import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { TelegramInitUser } from '../common/telegram/init-data.util';
import { CreateB2bRequestDto } from './dto/create-b2b-request.dto';
import { TelegramNotifyService } from '../notifications/telegram-notify.service';

@Injectable()
export class B2bService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notify: TelegramNotifyService,
  ) {}

  async create(tgUser: TelegramInitUser, dto: CreateB2bRequestDto) {
    await this.prisma.user.upsert({
      where: { id: BigInt(tgUser.id) },
      create: {
        id: BigInt(tgUser.id),
        username: tgUser.username,
        firstName: tgUser.first_name,
        lastName: tgUser.last_name,
      },
      update: {},
    });

    const request = await this.prisma.b2bRequest.create({
      data: {
        userId: BigInt(tgUser.id),
        company: dto.company,
        inn: dto.inn,
        contactName: dto.contactName,
        phone: dto.phone,
        email: dto.email,
        productSlug: dto.productSlug,
        message: dto.message,
      },
    });

    this.notifyNewRequest(request.id, dto);
    return { id: request.id, status: request.status };
  }

  /**
   * Creates a B2B request submitted from the public website (no Telegram
   * auth — the visitor is anonymous, so userId stays null). Persists to the
   * same table as the Mini App so it shows up in the admin panel, and sends
   * the manager notification with the same status buttons.
   */
  async createFromWebsite(dto: CreateB2bRequestDto) {
    const request = await this.prisma.b2bRequest.create({
      data: {
        company: dto.company,
        inn: dto.inn,
        contactName: dto.contactName,
        phone: dto.phone,
        email: dto.email,
        productSlug: dto.productSlug,
        message: dto.message,
      },
    });

    this.notifyNewRequest(request.id, dto);
    return { id: request.id, status: request.status };
  }

  /** Sends the manager a new-request notification with status buttons. */
  private notifyNewRequest(id: number, dto: CreateB2bRequestDto) {
    try {
      void this.notify.notifyManager(this.formatB2bMessage(id, dto), {
        inline_keyboard: [
          [
            { text: '🔄 В работу', callback_data: `b2b:ip:${id}` },
            { text: '✅ Закрыть',  callback_data: `b2b:cl:${id}` },
          ],
        ],
      });
    } catch {
      // swallow — notification is best-effort, never breaks request creation
    }
  }

  /** Recent B2B requests for the manager (bot /b2b command). */
  async listRecent(limit = 20) {
    const rows = await this.prisma.b2bRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(limit, 1), 50),
    });
    // Map to a plain DTO — the raw row has a BigInt `userId` that JSON cannot
    // serialize (would 500). The bot/admin only need the contact fields.
    return rows.map((r) => ({
      id: r.id,
      company: r.company,
      inn: r.inn,
      contactName: r.contactName,
      phone: r.phone,
      email: r.email,
      productSlug: r.productSlug,
      message: r.message,
      status: r.status,
      createdAt: r.createdAt,
    }));
  }

  /** Update B2B request status (called by Telegram bot inline buttons). */
  async updateStatus(id: number, status: import('@prisma/client').B2bStatus) {
    try {
      return await this.prisma.b2bRequest.update({
        where: { id },
        data: { status },
      });
    } catch {
      return null;
    }
  }

  private formatB2bMessage(id: number, dto: CreateB2bRequestDto): string {
    const lines = [
      `📨 <b>Новая B2B-заявка №${id}</b>`,
      '',
      `<b>Компания:</b> ${escapeHtml(dto.company)}`,
      `<b>Контакт:</b> ${escapeHtml(dto.contactName)}`,
      `<b>Телефон:</b> ${escapeHtml(dto.phone)}`,
    ];
    if (dto.inn)         lines.push(`<b>ИНН:</b> ${escapeHtml(dto.inn)}`);
    if (dto.email)       lines.push(`<b>Email:</b> ${escapeHtml(dto.email)}`);
    if (dto.productSlug) lines.push(`<b>Товар:</b> ${escapeHtml(dto.productSlug)}`);
    lines.push('', `<b>Сообщение:</b>`, escapeHtml(dto.message));
    return lines.join('\n');
  }
}

function escapeHtml(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
