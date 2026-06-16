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

    // Notify the manager — best-effort, must never break request creation.
    try {
      void this.notify.notifyManager(this.formatB2bMessage(request.id, dto), {
        inline_keyboard: [
          [
            { text: '🔄 В работу', callback_data: `b2b:ip:${request.id}` },
            { text: '✅ Закрыть',  callback_data: `b2b:cl:${request.id}` },
          ],
        ],
      });
    } catch {
      // swallow — notification is best-effort
    }

    return { id: request.id, status: request.status };
  }

  /** Recent B2B requests for the manager (bot /b2b command). */
  async listRecent(limit = 20) {
    return this.prisma.b2bRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(limit, 1), 50),
    });
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
