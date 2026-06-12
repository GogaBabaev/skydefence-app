import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PaymentsService } from './payments.service';
import { YooKassaClient } from './yookassa.client';
import { PrismaService } from '../prisma/prisma.service';

const dec = (v: string | number) => new Prisma.Decimal(v);

describe('PaymentsService.reconcileOrder (webhook fallback)', () => {
  let service: PaymentsService;
  let prisma: any;
  let yookassa: { createPayment: jest.Mock; getPayment: jest.Mock };

  beforeEach(async () => {
    prisma = {
      payment: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      order: { update: jest.fn() },
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
          useValue: { getOrThrow: jest.fn(), get: jest.fn() },
        },
      ],
    }).compile();
    service = moduleRef.get(PaymentsService);
  });

  it('verifies and applies a pending payment', async () => {
    prisma.payment.findFirst.mockResolvedValue({
      id: 'pay-1',
      externalId: 'yk-1',
      status: 'PENDING',
    });
    yookassa.getPayment.mockResolvedValue({
      id: 'yk-1',
      status: 'succeeded',
      paid: true,
      amount: { value: '100.00', currency: 'RUB' },
      created_at: new Date().toISOString(),
    });
    prisma.payment.findUnique.mockResolvedValue({
      id: 'pay-1',
      orderId: 'order-1',
      status: 'PENDING',
      amount: dec('100.00'),
      currency: 'RUB',
      order: { status: 'AWAITING_PAYMENT' },
    });

    await service.reconcileOrder('order-1');

    expect(yookassa.getPayment).toHaveBeenCalledWith('yk-1');
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it('does nothing when there is no pending payment', async () => {
    prisma.payment.findFirst.mockResolvedValue(null);
    await service.reconcileOrder('order-1');
    expect(yookassa.getPayment).not.toHaveBeenCalled();
  });

  it('swallows provider errors (best-effort)', async () => {
    prisma.payment.findFirst.mockResolvedValue({
      id: 'pay-1',
      externalId: 'yk-1',
      status: 'PENDING',
    });
    yookassa.getPayment.mockRejectedValue(new Error('timeout'));
    await expect(service.reconcileOrder('order-1')).resolves.toBeUndefined();
  });
});
