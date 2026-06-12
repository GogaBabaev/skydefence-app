import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PaymentsService } from './payments.service';
import { YooKassaClient } from './yookassa.client';
import { PrismaService } from '../prisma/prisma.service';
import type { YooKassaPayment } from './yookassa.types';

const dec = (v: string | number) => new Prisma.Decimal(v);

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: {
    order: { findUnique: jest.Mock; update: jest.Mock };
    payment: { create: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
    $transaction: jest.Mock;
  };
  let yookassa: { createPayment: jest.Mock; getPayment: jest.Mock };

  const baseOrder = {
    id: 'order-1',
    number: 42,
    userId: BigInt(777),
    status: 'PENDING',
    totalAmount: dec('109900.00'),
    currency: 'RUB',
    customerEmail: 'b@b.ru',
    customerPhone: '+79990000000',
    items: [
      {
        productName: 'Detector',
        unitPrice: dec('109900.00'),
        quantity: 1,
      },
    ],
    payments: [],
  };

  beforeEach(async () => {
    prisma = {
      order: { findUnique: jest.fn(), update: jest.fn() },
      payment: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
      $transaction: jest.fn().mockResolvedValue([]),
    };
    yookassa = { createPayment: jest.fn(), getPayment: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: prisma },
        { provide: YooKassaClient, useValue: yookassa },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('https://app.example/#/order'),
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(PaymentsService);
  });

  describe('createPayment', () => {
    it('creates a YooKassa payment with server-side amount', async () => {
      prisma.order.findUnique.mockResolvedValue({ ...baseOrder });
      yookassa.createPayment.mockResolvedValue({
        id: 'yk-1',
        status: 'pending',
        confirmation: { type: 'redirect', confirmation_url: 'https://yk/pay' },
      });
      prisma.payment.create.mockImplementation(({ data }: any) =>
        Promise.resolve({ id: 'pay-1', ...data }),
      );

      const result = await service.createPayment('order-1', 777);

      expect(yookassa.createPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          amountRub: '109900.00',
          metadata: { orderId: 'order-1' },
        }),
        expect.any(String),
      );
      expect(result.confirmationUrl).toBe('https://yk/pay');
      expect(prisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'AWAITING_PAYMENT' } }),
      );
    });

    it("rejects another user's order", async () => {
      prisma.order.findUnique.mockResolvedValue({ ...baseOrder });
      await expect(service.createPayment('order-1', 999)).rejects.toThrow(
        'Not your order',
      );
      expect(yookassa.createPayment).not.toHaveBeenCalled();
    });

    it('rejects already paid orders', async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...baseOrder,
        status: 'PAID',
      });
      await expect(service.createPayment('order-1', 777)).rejects.toThrow(
        'already paid',
      );
    });

    it('reuses an existing pending payment (idempotent double-tap)', async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...baseOrder,
        payments: [
          {
            id: 'pay-1',
            status: 'PENDING',
            confirmationUrl: 'https://yk/pay-old',
          },
        ],
      });
      const result = await service.createPayment('order-1', 777);
      expect(result.confirmationUrl).toBe('https://yk/pay-old');
      expect(yookassa.createPayment).not.toHaveBeenCalled();
    });
  });

  describe('applyVerifiedPayment', () => {
    const verified: YooKassaPayment = {
      id: 'yk-1',
      status: 'succeeded',
      paid: true,
      amount: { value: '109900.00', currency: 'RUB' },
      created_at: new Date().toISOString(),
    };

    it('marks order PAID when amounts match', async () => {
      prisma.payment.findUnique.mockResolvedValue({
        id: 'pay-1',
        orderId: 'order-1',
        status: 'PENDING',
        amount: dec('109900.00'),
        currency: 'RUB',
        order: { status: 'AWAITING_PAYMENT' },
      });

      const result = await service.applyVerifiedPayment(verified);
      expect(result.applied).toBe(true);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('rejects amount mismatch (tampering guard)', async () => {
      prisma.payment.findUnique.mockResolvedValue({
        id: 'pay-1',
        orderId: 'order-1',
        status: 'PENDING',
        amount: dec('109900.00'),
        currency: 'RUB',
        order: { status: 'AWAITING_PAYMENT' },
      });

      const result = await service.applyVerifiedPayment({
        ...verified,
        amount: { value: '1.00', currency: 'RUB' },
      });
      expect(result).toEqual({ applied: false, reason: 'amount_mismatch' });
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('is a no-op for unknown payments', async () => {
      prisma.payment.findUnique.mockResolvedValue(null);
      const result = await service.applyVerifiedPayment(verified);
      expect(result).toEqual({ applied: false, reason: 'unknown_payment' });
    });

    it('is a no-op for duplicate status updates', async () => {
      prisma.payment.findUnique.mockResolvedValue({
        id: 'pay-1',
        orderId: 'order-1',
        status: 'SUCCEEDED',
        amount: dec('109900.00'),
        currency: 'RUB',
        order: { status: 'PAID' },
      });
      const result = await service.applyVerifiedPayment(verified);
      expect(result).toEqual({ applied: false, reason: 'already_processed' });
    });
  });
});
