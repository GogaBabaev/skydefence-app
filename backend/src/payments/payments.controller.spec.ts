import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ForbiddenException } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import type { YooKassaWebhookBody } from './yookassa.types';

const YK_IP = '185.71.76.5';

describe('PaymentsController (webhook)', () => {
  let controller: PaymentsController;
  let payments: { verifyPayment: jest.Mock; applyVerifiedPayment: jest.Mock };
  let prisma: { webhookEvent: { create: jest.Mock } };
  let ipCheck = 'true';

  const body: YooKassaWebhookBody = {
    type: 'notification',
    event: 'payment.succeeded',
    object: {
      id: 'yk-1',
      status: 'succeeded',
      paid: true,
      amount: { value: '100.00', currency: 'RUB' },
      created_at: new Date().toISOString(),
    },
  };

  beforeEach(async () => {
    ipCheck = 'true';
    payments = {
      verifyPayment: jest.fn().mockResolvedValue({
        ...body.object,
        status: 'succeeded',
      }),
      applyVerifiedPayment: jest.fn().mockResolvedValue({ applied: true }),
    };
    prisma = { webhookEvent: { create: jest.fn().mockResolvedValue({}) } };

    const moduleRef = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        { provide: PaymentsService, useValue: payments },
        { provide: PrismaService, useValue: prisma },
        {
          provide: ConfigService,
          useValue: { get: jest.fn(() => ipCheck) },
        },
      ],
    }).compile();

    controller = moduleRef.get(PaymentsController);
  });

  it('rejects webhooks from non-YooKassa IPs', async () => {
    await expect(controller.webhook(body, '8.8.8.8')).rejects.toThrow(
      ForbiddenException,
    );
    expect(payments.verifyPayment).not.toHaveBeenCalled();
  });

  it('verifies payment against YooKassa API instead of trusting payload', async () => {
    await controller.webhook(body, YK_IP);
    expect(payments.verifyPayment).toHaveBeenCalledWith('yk-1');
    expect(payments.applyVerifiedPayment).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'yk-1', status: 'succeeded' }),
    );
  });

  it('ignores duplicate webhook deliveries (idempotency)', async () => {
    prisma.webhookEvent.create.mockRejectedValue(
      new Error('Unique constraint'),
    );
    const result = await controller.webhook(body, YK_IP);
    expect(result).toEqual({ ok: true });
    expect(payments.verifyPayment).not.toHaveBeenCalled();
  });

  it('acknowledges malformed payloads without processing', async () => {
    const result = await controller.webhook(
      {} as YooKassaWebhookBody,
      YK_IP,
    );
    expect(result).toEqual({ ok: true });
    expect(payments.verifyPayment).not.toHaveBeenCalled();
  });
});
