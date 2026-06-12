import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { TelegramAuthGuard } from '../common/guards/telegram-auth.guard';
import { TelegramUser } from '../common/decorators/telegram-user.decorator';
import type { TelegramInitUser } from '../common/telegram/init-data.util';
import { B2bService } from './b2b.service';
import { CreateB2bRequestDto } from './dto/create-b2b-request.dto';

@Controller('b2b-requests')
@UseGuards(TelegramAuthGuard)
export class B2bController {
  constructor(private readonly b2b: B2bService) {}

  @Post()
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  create(
    @TelegramUser() user: TelegramInitUser,
    @Body() dto: CreateB2bRequestDto,
  ) {
    return this.b2b.create(user, dto);
  }
}
