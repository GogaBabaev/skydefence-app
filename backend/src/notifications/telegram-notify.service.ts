import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * TelegramNotifyService: sends plain-text notifications to the manager's
 * Telegram chat via the Bot API (sendMessage). Best-effort — a failure to
 * notify must never break order creation, so all errors are swallowed and
 * logged.
 */
@Injectable()
export class TelegramNotifyService {
  private readonly logger = new Logger(TelegramNotifyService.name);

  constructor(private readonly config: ConfigService) {}

  async notifyManager(
    text: string,
    replyMarkup?: { inline_keyboard: { text: string; callback_data: string }[][] },
  ): Promise<void> {
    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    const chatId = this.config.get<string>('TELEGRAM_MANAGER_CHAT_ID');
    if (!token || !chatId) {
      this.logger.warn(
        'TELEGRAM_MANAGER_CHAT_ID not configured — skipping manager notification',
      );
      return;
    }

    try {
      const res = await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: 'HTML',
            reply_markup: replyMarkup,
          }),
        },
      );
      if (!res.ok) {
        this.logger.warn(
          `Telegram notify failed: ${res.status} ${await res.text()}`,
        );
      }
    } catch (e) {
      this.logger.warn(
        `Telegram notify error: ${e instanceof Error ? e.message : e}`,
      );
    }
  }

  /**
   * Notifies the customer in their own Telegram chat when the manager
   * changes the order status. Best-effort — never throws.
   */
  async notifyUser(
    telegramId: bigint | number,
    orderNumber: number,
    status: 'CONFIRMED' | 'FULFILLED' | 'CANCELED',
  ): Promise<void> {
    const messages: Record<string, string> = {
      CONFIRMED: `✅ Заказ №${orderNumber} подтверждён. Менеджер свяжется с вами для согласования оплаты.`,
      FULFILLED: `📦 Заказ №${orderNumber} выполнен. Спасибо за покупку!`,
      CANCELED: `❌ Заказ №${orderNumber} отменён. Свяжитесь с менеджером для уточнения.`,
    };
    const text = messages[status];
    if (!text) return;

    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) return;

    try {
      const res = await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: Number(telegramId), text }),
        },
      );
      if (!res.ok) {
        this.logger.warn(
          `Telegram user notify failed: ${res.status} ${await res.text()}`,
        );
      }
    } catch (e) {
      this.logger.warn(
        `Telegram user notify error: ${e instanceof Error ? e.message : e}`,
      );
    }
  }
}
