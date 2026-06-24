import { Body, Controller, Get, NotFoundException, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import { IsEnum } from 'class-validator';
import { Throttle } from '@nestjs/throttler';
import { AdminSecretGuard } from '../common/guards/admin-secret.guard';
import { B2bService } from './b2b.service';
import { B2bStatus } from '@prisma/client';

class UpdateB2bStatusDto {
  @IsEnum(B2bStatus)
  status: B2bStatus;
}

/**
 * Admin endpoints for the Telegram bot. Authenticated via a shared secret
 * (AdminSecretGuard) and additionally protected at the Caddy layer by HTTP
 * Basic Auth on /api/admin/* (see Caddyfile.prod). The bot reaches these over
 * the internal docker network and is unaffected by the edge auth.
 */
@Controller('admin/b2b-requests')
@UseGuards(AdminSecretGuard)
@Throttle({ default: { ttl: 60_000, limit: 30 } })
export class AdminB2bController {
  constructor(private readonly b2b: B2bService) {}

  @Get()
  listRecent() {
    return this.b2b.listRecent();
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateB2bStatusDto,
  ) {
    const updated = await this.b2b.updateStatus(id, dto.status);
    if (!updated) throw new NotFoundException(`B2B request #${id} not found`);
    return updated;
  }
}
