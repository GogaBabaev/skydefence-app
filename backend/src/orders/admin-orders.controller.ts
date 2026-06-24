import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AdminSecretGuard } from '../common/guards/admin-secret.guard';
import { OrdersService } from './orders.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

/**
 * Admin endpoint used by the Telegram bot when the manager taps an
 * inline button (✅/❌/📦) on an order notification. Authenticated via
 * a shared secret — see AdminSecretGuard. Rate-limited (instead of skipping
 * the throttle) so a leaked secret can't be brute-forced without limit; the
 * bot's real usage is far below this ceiling.
 */
@Controller('admin/orders')
@UseGuards(AdminSecretGuard)
@Throttle({ default: { ttl: 60_000, limit: 60 } })
export class AdminOrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  findAll() {
    return this.orders.findAll();
  }

  @Patch(':id/status')
  setStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orders.setStatus(id, dto.status);
  }
}
