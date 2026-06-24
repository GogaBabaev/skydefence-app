import { Test } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramNotifyService } from '../notifications/telegram-notify.service';

const dec = (v: string | number) => new Prisma.Decimal(v);
const tgUser = { id: 777, first_name: 'Misha', username: 'misha' };

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: {
    user: { upsert: jest.Mock };
    product: { findMany: jest.Mock };
    order: { create: jest.Mock; findUnique: jest.Mock; findMany: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      user: { upsert: jest.fn().mockResolvedValue({}) },
      product: { findMany: jest.fn() },
      order: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: TelegramNotifyService,
          useValue: { notifyManager: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();
    service = moduleRef.get(OrdersService);
  });

  it('computes total from DB prices, ignoring anything client-side', async () => {
    prisma.product.findMany.mockResolvedValue([
      { id: 1, name: 'A', price: dec('1000.00'), inStock: true },
      { id: 2, name: 'B', price: dec('500.50'), inStock: true },
    ]);
    prisma.order.create.mockImplementation(({ data }: any) =>
      Promise.resolve({
        id: 'o1',
        number: 1,
        status: data.status,
        totalAmount: data.totalAmount,
        currency: 'RUB',
        createdAt: new Date(),
        items: data.items.create.map((i: any) => i),
      }),
    );

    const order = await service.create(tgUser, {
      items: [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 },
      ],
      customerName: 'Misha',
      customerPhone: '+79990000000',
      consent: true,
    });

    expect(order.totalAmount).toBe(2500.5);
    const created = prisma.order.create.mock.calls[0][0].data;
    expect(created.totalAmount.toFixed(2)).toBe('2500.50');
  });

  it('rejects products that do not exist', async () => {
    prisma.product.findMany.mockResolvedValue([]);
    await expect(
      service.create(tgUser, {
        items: [{ productId: 99, quantity: 1 }],
        customerName: 'M',
        customerPhone: '+79990000000',
        consent: true as const,
      }),
    ).rejects.toThrow('Some products do not exist');
  });

  it('rejects price-on-request products (B2B only)', async () => {
    prisma.product.findMany.mockResolvedValue([
      { id: 1, name: 'Jammer X', price: null, inStock: true },
    ]);
    await expect(
      service.create(tgUser, {
        items: [{ productId: 1, quantity: 1 }],
        customerName: 'M',
        customerPhone: '+79990000000',
        consent: true as const,
      }),
    ).rejects.toThrow('B2B');
  });

  it('rejects out-of-stock products', async () => {
    prisma.product.findMany.mockResolvedValue([
      { id: 1, name: 'A', price: dec(10), inStock: false },
    ]);
    await expect(
      service.create(tgUser, {
        items: [{ productId: 1, quantity: 1 }],
        customerName: 'M',
        customerPhone: '+79990000000',
        consent: true as const,
      }),
    ).rejects.toThrow('out of stock');
  });

  it("denies reading another user's order", async () => {
    prisma.order.findUnique.mockResolvedValue({
      id: 'o1',
      userId: BigInt(123),
      items: [],
    });
    await expect(service.findOwned('o1', 777)).rejects.toThrow(
      'Not your order',
    );
  });
});
