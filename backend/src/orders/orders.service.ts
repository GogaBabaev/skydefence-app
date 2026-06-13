import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { TelegramInitUser } from '../common/telegram/init-data.util';
import { CreateOrderDto } from './dto/create-order.dto';
import { TelegramNotifyService } from '../notifications/telegram-notify.service';

interface OrderRow {
  id: string;
  number: number;
  status: string;
  totalAmount: Prisma.Decimal;
  currency: string;
  createdAt: Date;
  items: {
    productId: number;
    productName: string;
    unitPrice: Prisma.Decimal;
    quantity: number;
  }[];
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notify: TelegramNotifyService,
  ) {}

  /**
   * Creates an order. Prices are ALWAYS taken from the database —
   * the client only sends product ids and quantities (zero trust).
   */
  async create(tgUser: TelegramInitUser, dto: CreateOrderDto) {
    // upsert telegram user
    await this.prisma.user.upsert({
      where: { id: BigInt(tgUser.id) },
      create: {
        id: BigInt(tgUser.id),
        username: tgUser.username,
        firstName: tgUser.first_name,
        lastName: tgUser.last_name,
      },
      update: {
        username: tgUser.username,
        firstName: tgUser.first_name,
        lastName: tgUser.last_name,
      },
    });

    const ids = [...new Set(dto.items.map((i) => i.productId))];
    if (ids.length !== dto.items.length) {
      throw new BadRequestException('Duplicate products in order');
    }

    type ProductRow = {
      id: number;
      name: string;
      price: Prisma.Decimal | null;
      inStock: boolean;
    };
    const products: ProductRow[] = await this.prisma.product.findMany({
      where: { id: { in: ids }, isActive: true },
    });
    if (products.length !== ids.length) {
      throw new BadRequestException('Some products do not exist');
    }

    const byId = new Map(products.map((p) => [p.id, p]));
    let total = new Prisma.Decimal(0);
    const items = dto.items.map((i) => {
      const p = byId.get(i.productId)!;
      if (p.price === null) {
        throw new BadRequestException(
          `"${p.name}" is available on request only — use a B2B request`,
        );
      }
      if (!p.inStock) {
        throw new BadRequestException(`"${p.name}" is out of stock`);
      }
      total = total.add(p.price.mul(i.quantity));
      return {
        productId: p.id,
        productName: p.name,
        unitPrice: p.price,
        quantity: i.quantity,
      };
    });

    const order = await this.prisma.order.create({
      data: {
        userId: BigInt(tgUser.id),
        status: 'NEW',
        totalAmount: total,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        customerEmail: dto.customerEmail,
        company: dto.company,
        inn: dto.inn,
        deliveryAddress: dto.deliveryAddress,
        comment: dto.comment,
        items: { create: items },
      },
      include: { items: true },
    });

    try {
      void this.notify.notifyManager(this.formatOrderMessage(order), {
        inline_keyboard: [
          [
            { text: '✅ Подтвердить', callback_data: `ord:c:${order.id}` },
            { text: '📦 Выполнен', callback_data: `ord:f:${order.id}` },
          ],
          [{ text: '❌ Отменить', callback_data: `ord:x:${order.id}` }],
        ],
      });
    } catch {
      // notification is best-effort and must never break order creation
    }

    return this.toDto(order);
  }

  /**
   * Updates order status — called by the bot when the manager taps an
   * inline button on the order notification (admin endpoint).
   */
  async setStatus(orderId: string, status: 'CONFIRMED' | 'CANCELED' | 'FULFILLED') {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
    return { id: updated.id, number: updated.number, status: updated.status };
  }

  async findOwned(orderId: string, tgUserId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== BigInt(tgUserId)) {
      throw new ForbiddenException('Not your order');
    }
    return this.toDto(order);
  }

  async listOwned(tgUserId: number) {
    const orders = await this.prisma.order.findMany({
      where: { userId: BigInt(tgUserId) },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return orders.map((o: OrderRow) => this.toDto(o));
  }

  private toDto(order: OrderRow) {
    return {
      id: order.id,
      number: order.number,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      currency: order.currency,
      createdAt: order.createdAt,
      items: order.items.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        unitPrice: Number(i.unitPrice),
        quantity: i.quantity,
      })),
    };
  }

  /**
   * Formats an order summary sent to the manager's Telegram chat.
   * Payment is now arranged manually (bank transfer), so the manager
   * needs full contact + order details to follow up.
   */
  private formatOrderMessage(order: {
    number: number;
    totalAmount: Prisma.Decimal;
    currency: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string | null;
    company: string | null;
    inn: string | null;
    deliveryAddress: string | null;
    comment: string | null;
    items: { productName: string; unitPrice: Prisma.Decimal; quantity: number }[];
  }): string {
    const lines = [
      `🛒 <b>Новая заявка №${order.number}</b>`,
      '',
      ...order.items.map(
        (i) =>
          `• ${escapeHtml(i.productName)} × ${i.quantity} — ${Number(i.unitPrice) * i.quantity} ${order.currency}`,
      ),
      '',
      `<b>Итого:</b> ${Number(order.totalAmount)} ${order.currency}`,
      '',
      `<b>Клиент:</b> ${escapeHtml(order.customerName)}`,
      `<b>Телефон:</b> ${escapeHtml(order.customerPhone)}`,
    ];
    if (order.customerEmail) lines.push(`<b>Email:</b> ${escapeHtml(order.customerEmail)}`);
    if (order.company) lines.push(`<b>Компания:</b> ${escapeHtml(order.company)}`);
    if (order.inn) lines.push(`<b>ИНН:</b> ${escapeHtml(order.inn)}`);
    if (order.deliveryAddress)
      lines.push(`<b>Адрес доставки:</b> ${escapeHtml(order.deliveryAddress)}`);
    if (order.comment) lines.push(`<b>Комментарий:</b> ${escapeHtml(order.comment)}`);
    lines.push('', 'Оплата — переводом, согласовать с клиентом.');
    return lines.join('\n');
  }
}

function escapeHtml(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
