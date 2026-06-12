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
import { PaymentsService } from '../payments/payments.service';

@Controller('orders')
@UseGuards(TelegramAuthGuard)
export class OrdersController {
  constructor(
    private readonly orders: OrdersService,
    private readonly payments: PaymentsService,
  ) {}

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
    const order = await this.orders.findOwned(id, user.id);
    // Fallback to webhooks: actively verify pending payments via YooKassa API
    if (order.status === 'AWAITING_PAYMENT') {
      await this.payments.reconcileOrder(id);
      return this.orders.findOwned(id, user.id);
    }
    return order;
  }

  /** Step 3 of the flow: create a YooKassa payment for an order. */
  @Post(':id/payment')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  createPayment(
    @TelegramUser() user: TelegramInitUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.payments.createPayment(id, user.id);
  }
}
