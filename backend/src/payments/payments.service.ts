import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { YooKassaClient } from './yookassa.client';
import type { YooKassaPayment, YooKassaPaymentStatus } from './yookassa.types';

const STATUS_MAP: Record<YooKassaPaymentStatus, PaymentStatus> = {
  pending: PaymentStatus.PENDING,
  waiting_for_capture: PaymentStatus.WAITING_FOR_CAPTURE,
  succeeded: PaymentStatus.SUCCEEDED,
  canceled: PaymentStatus.CANCELED,
};

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly yookassa: YooKassaClient,
    private readonly config: ConfigService,
  ) {}

  /**
   * createPayment(): creates a YooKassa payment (intent) for an order
   * and returns the confirmation_url the Mini App opens.
   * Reuses a still-pending payment instead of creating duplicates.
   */
  async createPayment(orderId: string, tgUserId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, payments: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== BigInt(tgUserId)) {
      throw new ForbiddenException('Not your order');
    }
    if (order.status === OrderStatus.PAID) {
      throw new BadRequestException('Order is already paid');
    }
    if (order.status === OrderStatus.CANCELED) {
      throw new BadRequestException('Order is canceled');
    }

    // Reuse existing pending payment (idempotent UX: double-tap safe)
    const existing = order.payments.find(
      (p: { status: PaymentStatus; confirmationUrl: string | null }) =>
        p.status === PaymentStatus.PENDING && p.confirmationUrl,
    );
    if (existing) {
      return {
        paymentId: existing.id,
        confirmationUrl: existing.confirmationUrl,
        status: existing.status,
      };
    }

    const idempotenceKey = randomUUID();
    const amountRub = order.totalAmount.toFixed(2);
    const returnUrl = `${this.config.getOrThrow<string>(
      'YOOKASSA_RETURN_URL',
    )}/${order.id}`;

    const ykPayment = await this.yookassa.createPayment(
      {
        amountRub,
        description: `Заказ №${order.number} SkyDefence`,
        returnUrl,
        metadata: { orderId: order.id },
        customerEmail: order.customerEmail ?? undefined,
        customerPhone: order.customerEmail
          ? undefined
          : normalizePhone(order.customerPhone),
        receiptItems: order.items.map(
          (i: {
            productName: string;
            quantity: number;
            unitPrice: Prisma.Decimal;
          }) => ({
          description: i.productName,
          quantity: i.quantity,
          amountRub: i.unitPrice.toFixed(2),
        })),
      },
      idempotenceKey,
    );

    const payment = await this.prisma.payment.create({
      data: {
        orderId: order.id,
        externalId: ykPayment.id,
        status: STATUS_MAP[ykPayment.status],
        amount: order.totalAmount,
        currency: 'RUB',
        confirmationUrl: ykPayment.confirmation?.confirmation_url,
        idempotenceKey,
        rawPayload: ykPayment as unknown as Prisma.InputJsonValue,
      },
    });

    await this.prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.AWAITING_PAYMENT },
    });

    return {
      paymentId: payment.id,
      confirmationUrl: payment.confirmationUrl,
      status: payment.status,
    };
  }

  /**
   * verifyPayment(): NEVER trusts webhook payloads.
   * Re-fetches the payment from the YooKassa API by id and returns
   * the authoritative state.
   */
  async verifyPayment(externalId: string): Promise<YooKassaPayment> {
    return this.yookassa.getPayment(externalId);
  }

  /**
   * orderStatusUpdater(): applies a verified payment state to our DB
   * inside a transaction. Validates amount to protect against
   * partial or tampered payments.
   */
  async applyVerifiedPayment(verified: YooKassaPayment) {
    const payment = await this.prisma.payment.findUnique({
      where: { externalId: verified.id },
      include: { order: true },
    });
    if (!payment) {
      this.logger.warn(`Webhook for unknown payment ${verified.id} — skipped`);
      return { applied: false as const, reason: 'unknown_payment' };
    }

    const newStatus = STATUS_MAP[verified.status];
    if (payment.status === newStatus) {
      return { applied: false as const, reason: 'already_processed' };
    }

    if (verified.status === 'succeeded') {
      const paidAmount = new Prisma.Decimal(verified.amount.value);
      if (
        !paidAmount.equals(payment.amount) ||
        verified.amount.currency !== payment.currency
      ) {
        this.logger.error(
          `Amount mismatch for payment ${verified.id}: expected ${payment.amount}, got ${verified.amount.value}`,
        );
        return { applied: false as const, reason: 'amount_mismatch' };
      }
    }

    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: newStatus,
          rawPayload: verified as unknown as Prisma.InputJsonValue,
        },
      }),
      this.prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status:
            verified.status === 'succeeded'
              ? OrderStatus.PAID
              : verified.status === 'canceled'
                ? OrderStatus.CANCELED
                : payment.order.status,
        },
      }),
    ]);

    this.logger.log(
      `Payment ${verified.id} → ${verified.status}, order ${payment.orderId} updated`,
    );
    return { applied: true as const };
  }
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}
