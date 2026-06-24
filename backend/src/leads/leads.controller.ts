import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { LeadsService } from './leads.service';
import { CreateOrderLeadDto, CreateCallbackLeadDto } from './dto/create-lead.dto';

/**
 * Public endpoints for the marketing website's order and callback forms.
 * No auth (anonymous visitors), rate-limited. The backend holds the bot token
 * and notifies the manager — the website never touches Telegram directly.
 */
@Controller('leads')
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  @Post('order')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  async order(@Body() dto: CreateOrderLeadDto) {
    await this.leads.order(dto);
    return { ok: true };
  }

  @Post('callback')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  async callback(@Body() dto: CreateCallbackLeadDto) {
    await this.leads.callback(dto);
    return { ok: true };
  }
}
