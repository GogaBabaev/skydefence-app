import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  Ip,
  Logger,
  Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from './payments.service';
import { isYooKassaIp } from './yookassa-ips';
import type { YooKassaWebhookBody } from './yookassa.types';

/**
 * paymentWebhookHandler(): YooKassa HTTP notifications.
 *
 * Security model (YooKassa does not HMAC-sign webhooks):
 *  1. Source IP allowlist (official YooKassa ranges).
 *  2. The payload is treated only as a HINT — the authoritative state
 *     is re-fetched from the YooKassa API with our credentials.
 *  3. Idempotency: each (event, payment_id) is recorded; duplicates are no-ops.
 *  4. Always answer 200 for processed/ignored events so YooKassa stops retrying.
 */
@Controller('payments/yookassa')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly payments: PaymentsService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  @Post('webhook')
  @HttpCode(200)
  @SkipThrottle() // bursts of provider retries must not be throttled
  async webhook(@Body() body: YooKassaWebhookBody, @Ip() ip: string) {
    const ipCheckEnabled =
      (this.config.get('YOOKASSA_WEBHOOK_IP_CHECK') ?? 'true') !== 'false';
    if (ipCheckEnabled && !isYooKassaIp(ip)) {
      this.logger.warn(`Webhook from non-YooKassa IP ${ip} rejected`);
      throw new ForbiddenException();
    }

    const paymentId = body?.object?.id;
    const event = body?.event;
    if (!paymentId || typeof paymentId !== 'string' || !event) {
      // malformed — acknowledge so the provider doesn't retry forever
      return { ok: true };
    }

    // Idempotency: skip already-seen events
    try {
      await this.prisma.webhookEvent.create({
        data: {
          type: event,
          paymentExternalId: paymentId,
          payload: JSON.parse(JSON.stringify(body)),
        },
      });
    } catch {
      this.logger.log(`Duplicate webhook ${event}/${paymentId} ignored`);
      return { ok: true };
    }

    // Zero trust: verify against the YooKassa API, then apply
    const verified = await this.payments.verifyPayment(paymentId);
    const result = await this.payments.applyVerifiedPayment(verified);
    this.logger.log(
      `Webhook ${event}/${paymentId}: ${JSON.stringify(result)}`,
    );
    return { ok: true };
  }
}
