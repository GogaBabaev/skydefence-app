import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { B2bService } from './b2b.service';
import { CreateB2bRequestDto } from './dto/create-b2b-request.dto';

/**
 * Public endpoint for B2B requests submitted from the marketing website
 * (sky-defence.ru). Unlike the Mini App controller it has NO Telegram auth —
 * website visitors are anonymous. Rate-limited to deter abuse. Saves to the
 * same b2b_requests table (→ admin panel) and notifies the manager with
 * status buttons, exactly like the Mini App flow.
 */
@Controller('b2b-requests')
export class WebsiteB2bController {
  constructor(private readonly b2b: B2bService) {}

  @Post('website')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  createFromWebsite(@Body() dto: CreateB2bRequestDto) {
    return this.b2b.createFromWebsite(dto);
  }
}
