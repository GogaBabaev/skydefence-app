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
  payments?: { status: string; confirmationUrl: string | null }[];
}

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

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
        status: 'PENDING',
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
    return this.toDto(order);
  }

  async findOwned(orderId: string, tgUserId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, payments: { orderBy: { createdAt: 'desc' } } },
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
      lastPayment: order.payments?.[0]
        ? {
            status: order.payments[0].status,
            confirmationUrl: order.payments[0].confirmationUrl,
          }
        : null,
    };
  }
}
