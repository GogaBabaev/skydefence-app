import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { TelegramAuthGuard } from '../common/guards/telegram-auth.guard';
import { TelegramUser } from '../common/decorators/telegram-user.decorator';
import type { TelegramInitUser } from '../common/telegram/init-data.util';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
@UseGuards(TelegramAuthGuard)
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  create(@TelegramUser() user: TelegramInitUser, @Body() dto: CreateOrderDto) {
    return this.orders.create(user, dto);
  }

  @Get()
  list(@TelegramUser() user: TelegramInitUser) {
    return this.orders.listOwned(user.id);
  }

  @Get(':id')
  async byId(
    @TelegramUser() user: TelegramInitUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.orders.findOwned(id, user.id);
  }
}
