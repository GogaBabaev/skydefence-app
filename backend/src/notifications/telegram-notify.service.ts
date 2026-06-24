import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// `node-fetch` and `socks-proxy-agent` are ESM-only. Loading them at module
// top-level via require() throws "Cannot use import statement outside a module"
// under ts-jest (CommonJS) and broke the whole backend test suite. They are
// ONLY needed when a SOCKS proxy is configured, so we load them lazily with a
// real dynamic import. The Function wrapper prevents TypeScript from
// down-levelling import() back into require() under the CommonJS target.
const dynamicImport = new Function('m', 'return import(m)') as (
  m: string,
) => Promise<any>;

/**
 * TelegramNotifyService: sends notifications to the manager / customer via the
 * Bot API. Best-effort — a failure must never break order creation.
 *
 * NB: this server sits on a network where api.telegram.org is intermittently
 * blocked (some round-robin IPs are filtered, ~1 in 6 attempts times out).
 * When SOCKS_PROXY is set, all Telegram requests are routed through it —
 * same approach as bot.js — which avoids the blocking entirely.
 * Without a proxy the service retries many times with backoff to out-wait
 * transient blocks. Either way notifications never break request handling.
 */
@Injectable()
export class TelegramNotifyService {
  private readonly logger = new Logger(TelegramNotifyService.name);
  // Telegram is intermittently blocked from this host; bad windows can last a
  // few seconds. Many attempts with growing backoff out-wait the window. The
  // call is fire-and-forget (never awaited by the request), so a long total
  // retry span does not delay the user — it only delays manager delivery.
  private static readonly ATTEMPTS = 12;
  private static readonly TIMEOUT_MS = 6000;

  constructor(private readonly config: ConfigService) {}

  async notifyManager(
    text: string,
    replyMarkup?: { inline_keyboard: { text: string; callback_data: string }[][] },
  ): Promise<void> {
    const chatId = this.config.get<string>('TELEGRAM_MANAGER_CHAT_ID');
    if (!chatId) {
      this.logger.warn(
        'TELEGRAM_MANAGER_CHAT_ID not configured — skipping manager notification',
      );
      return;
    }
    await this.send('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: replyMarkup,
    });
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
    await this.send('sendMessage', { chat_id: Number(telegramId), text });
  }

  /**
   * POSTs to the Bot API with retries. Distinguishes:
   *  - network errors (timeout against a blocked IP) → retry;
   *  - Telegram API errors (4xx with a body, e.g. bad chat) → no retry, log.
   *
   * When SOCKS_PROXY is configured, uses it for all Telegram requests — same
   * approach as bot.js — which avoids IP-level blocks entirely.
   */
  private async send(method: string, payload: unknown): Promise<void> {
    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      this.logger.warn('TELEGRAM_BOT_TOKEN not configured — skipping notification');
      return;
    }
    const url = `https://api.telegram.org/bot${token}/${method}`;
    const socksProxy = this.config.get<string>('SOCKS_PROXY');

    // When a SOCKS proxy is configured, lazily load node-fetch + the proxy
    // agent (native fetch has no proxy support). Without a proxy we use the
    // built-in fetch and never touch the ESM-only deps.
    let fetchFn: (url: string, opts: Record<string, unknown>) => Promise<any> =
      fetch as never;
    let agent: unknown;
    if (socksProxy) {
      try {
        const [proxyMod, nodeFetchMod] = await Promise.all([
          dynamicImport('socks-proxy-agent'),
          dynamicImport('node-fetch'),
        ]);
        agent = new proxyMod.SocksProxyAgent(socksProxy);
        fetchFn = nodeFetchMod.default;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        this.logger.warn(`SOCKS proxy load failed, using direct fetch: ${msg}`);
      }
    }

    for (let attempt = 1; attempt <= TelegramNotifyService.ATTEMPTS; attempt++) {
      try {
        const opts: Record<string, unknown> = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(TelegramNotifyService.TIMEOUT_MS),
        };
        if (agent) opts.agent = agent;
        const res = await fetchFn(url, opts);
        if (res.ok) return;
        // Telegram-level rejection — retrying the same payload won't help.
        const body = await res.text();
        this.logger.warn(`Telegram ${method} rejected: ${res.status} ${body}`);
        return;
      } catch (e) {
        // Network error (likely ETIMEDOUT to a filtered Telegram IP) — retry.
        const msg = e instanceof Error ? e.message : String(e);
        if (attempt === TelegramNotifyService.ATTEMPTS) {
          this.logger.warn(
            `Telegram ${method} unreachable after ${attempt} attempts: ${msg}`,
          );
          return;
        }
        // growing backoff (0.5s, 1s, 1.5s … capped at 3s) — spans ~12s total
        await new Promise((r) => setTimeout(r, Math.min(500 * attempt, 3000)));
      }
    }
  }
}
