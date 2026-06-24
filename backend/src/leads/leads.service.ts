import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramNotifyService } from '../notifications/telegram-notify.service';

interface OrderItem {
  name: string;
  price: number | null;
  qty: number;
}

/**
 * Website "leads" — order and callback forms submitted from sky-defence.ru.
 * These used to be sent to Telegram directly FROM the website container, which
 * meant the bot token had to live in the website's env (and got exfiltrated in
 * the Next.js RCE incident). Routing them through the backend keeps the token
 * out of the public-facing website entirely. Best-effort notify (retries).
 *
 * Website orders are now saved to the orders table so the manager can use the
 * same ✅/📦/❌ action buttons as on mini-app order notifications, and the
 * admin panel shows status for all orders in one place.
 */
@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notify: TelegramNotifyService,
  ) {}

  async order(data: {
    name: string;
    phone: string;
    items: OrderItem[];
    comment?: string;
    source?: string;
  }): Promise<void> {
    const total = data.items.reduce((s, i) => s + (i.price ?? 0) * i.qty, 0);

    const order = await this.prisma.order.create({
      data: {
        // userId is null for website orders — no Telegram user involved
        status: 'NEW',
        totalAmount: total,
        customerName: data.name,
        customerPhone: data.phone,
        comment: data.comment ?? null,
        items: {
          create: data.items.map((i) => ({
            // productId is null — website items are free-text, not DB products
            productName: i.name,
            unitPrice: i.price ?? 0,
            quantity: i.qty,
          })),
        },
      },
    });

    void this.notify.notifyManager(this.formatOrder(data, order.number), {
      inline_keyboard: [
        [
          { text: '✅ Подтвердить', callback_data: `ord:c:${order.id}` },
          { text: '📦 Выполнен', callback_data: `ord:f:${order.id}` },
        ],
        [{ text: '❌ Отменить', callback_data: `ord:x:${order.id}` }],
      ],
    });
  }

  async callback(data: { name: string; phone: string; message?: string }): Promise<void> {
    await this.prisma.leadCallback.create({
      data: { name: data.name, phone: data.phone, message: data.message ?? null },
    });
    void this.notify.notifyManager(this.formatCallback(data));
  }

  async listCallbacks(limit = 20) {
    return this.prisma.leadCallback.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(limit, 1), 50),
    });
  }

  private formatOrder(
    data: {
      name: string;
      phone: string;
      items: OrderItem[];
      comment?: string;
      source?: string;
    },
    orderNumber: number,
  ): string {
    const total = data.items.reduce((s, i) => s + (i.price ?? 0) * i.qty, 0);
    const hasOnRequest = data.items.some((i) => i.price == null);
    const itemLines = data.items
      .map(
        (i) =>
          `  • ${esc(i.name)} × ${i.qty} — ${i.price == null ? 'по запросу' : fmt(i.price * i.qty)}`,
      )
      .join('\n');
    const totalLine =
      total > 0
        ? `<b>ИТОГО: ${fmt(total)}${hasOnRequest ? ' + товары по запросу' : ''}</b>`
        : `<b>ИТОГО: по запросу</b>`;
    const lines = [
      `🛒 <b>Новый заказ с сайта №${orderNumber}${data.source ? ` (${esc(data.source)})` : ''}</b>`,
      '',
      `👤 <b>Имя:</b> ${esc(data.name)}`,
      `📞 <b>Телефон:</b> ${esc(data.phone)}`,
      '',
      `<b>Состав заказа:</b>`,
      itemLines,
      '',
      totalLine,
    ];
    if (data.comment) lines.push(`\n💬 <b>Комментарий:</b> ${esc(data.comment)}`);
    return lines.join('\n');
  }

  private formatCallback(data: { name: string; phone: string; message?: string }): string {
    const lines = [
      `📞 <b>Заявка на обратный звонок</b>`,
      '',
      `👤 <b>Имя:</b> ${esc(data.name)}`,
      `📞 <b>Телефон:</b> ${esc(data.phone)}`,
    ];
    if (data.message) lines.push(`\n💬 ${esc(data.message)}`);
    return lines.join('\n');
  }
}

function fmt(n: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(n);
}

function esc(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
