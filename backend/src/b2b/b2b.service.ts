import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { TelegramInitUser } from '../common/telegram/init-data.util';
import { CreateB2bRequestDto } from './dto/create-b2b-request.dto';

@Injectable()
export class B2bService {
  constructor(private readonly prisma: PrismaService) {}

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
    return { id: request.id, status: request.status };
  }
}
