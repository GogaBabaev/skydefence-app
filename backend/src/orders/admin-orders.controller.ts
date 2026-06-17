import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { AdminSecretGuard } from '../common/guards/admin-secret.guard';
import { OrdersService } from './orders.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

/**
 * Admin endpoint used by the Telegram bot when the manager taps an
 * inline button (✅/❌/📦) on an order notification. Authenticated via
 * a shared secret — see AdminSecretGuard.
 */
@Controller('admin/orders')
@UseGuards(AdminSecretGuard)
@SkipThrottle()
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
