import {
  BadGatewayException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  CreateYooKassaPaymentParams,
  YooKassaPayment,
} from './yookassa.types';

const API_BASE = 'https://api.yookassa.ru/v3';

/**
 * Thin HTTP client over the YooKassa REST API v3.
 * Auth: HTTP Basic shopId:secretKey.
 * Every create request carries an Idempotence-Key so retries are safe.
 */
@Injectable()
export class YooKassaClient {
  private readonly logger = new Logger(YooKassaClient.name);

  constructor(private readonly config: ConfigService) {}

  private authHeader(): string {
    const shopId = this.config.getOrThrow<string>('YOOKASSA_SHOP_ID');
    const secret = this.config.getOrThrow<string>('YOOKASSA_SECRET_KEY');
    return `Basic ${Buffer.from(`${shopId}:${secret}`).toString('base64')}`;
  }

  async createPayment(
    params: CreateYooKassaPaymentParams,
    idempotenceKey: string,
  ): Promise<YooKassaPayment> {
    const body: Record<string, unknown> = {
      amount: { value: params.amountRub, currency: 'RUB' },
      capture: true,
      confirmation: { type: 'redirect', return_url: params.returnUrl },
      description: params.description.slice(0, 128),
      metadata: params.metadata,
    };

    // 54-FZ fiscal receipt — required for RU online payments
    if (params.customerEmail || params.customerPhone) {
      body.receipt = {
        customer: {
          ...(params.customerEmail ? { email: params.customerEmail } : {}),
          ...(params.customerPhone ? { phone: params.customerPhone } : {}),
        },
        items: params.receiptItems.map((i) => ({
          description: i.description.slice(0, 128),
          quantity: String(i.quantity),
          amount: { value: i.amountRub, currency: 'RUB' },
          vat_code: 1, // без НДС — поменяйте под вашу систему налогообложения
          payment_mode: 'full_payment',
          payment_subject: 'commodity',
        })),
      };
    }

    return this.request<YooKassaPayment>('POST', '/payments', body, {
      'Idempotence-Key': idempotenceKey,
    });
  }

  /** Source of truth: re-fetch payment state directly from YooKassa. */
  async getPayment(paymentId: string): Promise<YooKassaPayment> {
    return this.request<YooKassaPayment>('GET', `/payments/${paymentId}`);
  }

  private async request<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: unknown,
    extraHeaders: Record<string, string> = {},
  ): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        Authorization: this.authHeader(),
        'Content-Type': 'application/json',
        ...extraHeaders,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15_000),
    });

    const text = await res.text();
    if (!res.ok) {
      this.logger.error(`YooKassa ${method} ${path} → ${res.status}: ${text}`);
      throw new BadGatewayException('Payment provider error');
    }
    return JSON.parse(text) as T;
  }
}
