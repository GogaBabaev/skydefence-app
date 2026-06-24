import { Controller, Get, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AdminSecretGuard } from '../common/guards/admin-secret.guard';
import { LeadsService } from './leads.service';

@Controller('admin/callbacks')
@UseGuards(AdminSecretGuard)
@Throttle({ default: { ttl: 60_000, limit: 60 } })
export class AdminCallbacksController {
  constructor(private readonly leads: LeadsService) {}

  @Get()
  listRecent() {
    return this.leads.listCallbacks();
  }
}
