/**
 * Integration test of the full flow:
 *   create order → create payment intent → webhook → order becomes PAID.
 * Prisma and the YooKassa HTTP API are mocked; everything in between
 * (services, controller, verification, idempotency) is real.
 */
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { OrdersService } from '../orders/orders.service';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { YooKassaClient } from './yookassa.client';
import { PrismaService } from '../prisma/prisma.service';
import type { YooKassaWebhookBody } from './yookassa.types';

const dec = (v: string | number) => new Prisma.Decimal(v);
const tgUser = { id: 777, first_name: 'Misha' };
const YK_IP = '185.71.76.5';

describe('Order → Payment → Webhook flow (integration)', () => {
  // crude in-memory "database"
  const db: {
    orders: Map<string, any>;
    payments: Map<string, any>;
    webhookEvents: Set<string>;
  } = { orders: new Map(), payments: new Map(), webhookEvents: new Set() };

  const prismaMock = {
    user: { upsert: jest.fn().mockResolvedValue({}) },
    product: {
      findMany: jest
        .fn()
        .mockResolvedValue([
          { id: 1, name: 'Детектор БУЛАТ V.4', price: dec('109900.00'), inStock: true },
        ]),
    },
    order: {
      create: jest.fn(({ data }: any) => {
        const order = {
          id: 'order-uuid-1',
          number: 1,
          currency: 'RUB',
          createdAt: new Date(),
          ...data,
          items: data.items.create,
          payments: [],
        };
        db.orders.set(order.id, order);
        return Promise.resolve(order);
      }),
      findUnique: jest.fn(({ where }: any) => {
        const o = db.orders.get(where.id);
        return Promise.resolve(
          o
            ? {
                ...o,
                payments: [...db.payments.values()].filter(
                  (p) => p.orderId === o.id,
                ),
              }
            : null,
        );
      }),
      update: jest.fn(({ where, data }: any) => {
        const o = db.orders.get(where.id);
        Object.assign(o, data);
        return Promise.resolve(o);
      }),
    },
    payment: {
      create: jest.fn(({ data }: any) => {
        const p = { id: 'pay-uuid-1', ...data };
        db.payments.set(p.id, p);
        return Promise.resolve(p);
      }),
      findUnique: jest.fn(({ where }: any) => {
        const p = [...db.payments.values()].find(
          (x) => x.externalId === where.externalId,
        );
        return Promise.resolve(
          p ? { ...p, order: db.orders.get(p.orderId) } : null,
        );
      }),
      update: jest.fn(({ where, data }: any) => {
        const p = db.payments.get(where.id);
        Object.assign(p, data);
        return Promise.resolve(p);
      }),
    },
    webhookEvent: {
      create: jest.fn(({ data }: any) => {
        const key = `${data.type}:${data.paymentExternalId}`;
        if (db.webhookEvents.has(key)) {
          return Promise.reject(new Error('Unique constraint failed'));
        }
        db.webhookEvents.add(key);
        return Promise.resolve({ id: 'evt-1', ...data });
      }),
    },
    $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
  };

  const yookassaMock = {
    createPayment: jest.fn().mockResolvedValue({
      id: 'yk-payment-1',
      status: 'pending',
      paid: false,
      amount: { value: '109900.00', currency: 'RUB' },
      confirmation: {
        type: 'redirect',
        confirmation_url: 'https://yoomoney.ru/checkout/payments/v2?orderId=yk-payment-1',
      },
      created_at: new Date().toISOString(),
    }),
    getPayment: jest.fn().mockResolvedValue({
      id: 'yk-payment-1',
      status: 'succeeded',
      paid: true,
      amount: { value: '109900.00', currency: 'RUB' },
      created_at: new Date().toISOString(),
    }),
  };

  let orders: OrdersService;
  let payments: PaymentsService;
  let webhookController: PaymentsController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        OrdersService,
        PaymentsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: YooKassaClient, useValue: yookassaMock },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn(() => 'https://app.example/#/order'),
            get: jest.fn(() => 'true'),
          },
        },
      ],
    }).compile();

    orders = moduleRef.get(OrdersService);
    payments = moduleRef.get(PaymentsService);
    webhookController = moduleRef.get(PaymentsController);
  });

  it('runs the full happy path', async () => {
    // 1-2. user creates order
    const order = await orders.create(tgUser, {
      items: [{ productId: 1, quantity: 1 }],
      customerName: 'Misha',
      customerPhone: '+7 999 000-00-00',
      customerEmail: 'misha@example.com',
    });
    expect(order.status).toBe('PENDING');
    expect(order.totalAmount).toBe(109900);

    // 3-4. backend creates payment intent → confirmation_url
    const payment = await payments.createPayment(order.id, tgUser.id);
    expect(payment.confirmationUrl).toContain('yoomoney');
    expect(db.orders.get(order.id).status).toBe('AWAITING_PAYMENT');

    // 5. YooKassa calls the webhook
    const webhookBody: YooKassaWebhookBody = {
      type: 'notification',
      event: 'payment.succeeded',
      object: yookassaMock.getPayment.mock.results[0]?.value ?? {
        id: 'yk-payment-1',
        status: 'succeeded',
        paid: true,
        amount: { value: '109900.00', currency: 'RUB' },
        created_at: new Date().toISOString(),
      },
    };
    const res = await webhookController.webhook(webhookBody, YK_IP);
    expect(res).toEqual({ ok: true });

    // payload was NOT trusted — state re-fetched from YooKassa
    expect(yookassaMock.getPayment).toHaveBeenCalledWith('yk-payment-1');

    // 6. order status updated
    expect(db.orders.get(order.id).status).toBe('PAID');
    expect(db.payments.get('pay-uuid-1').status).toBe('SUCCEEDED');

    // 7. duplicate webhook delivery is a no-op
    const res2 = await webhookController.webhook(webhookBody, YK_IP);
    expect(res2).toEqual({ ok: true });
    expect(yookassaMock.getPayment).toHaveBeenCalledTimes(1);
  });
});
