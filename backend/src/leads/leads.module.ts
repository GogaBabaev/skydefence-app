import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { AdminCallbacksController } from './admin-callbacks.controller';
import { LeadsService } from './leads.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [NotificationsModule, PrismaModule],
  controllers: [LeadsController, AdminCallbacksController],
  providers: [LeadsService],
})
export class LeadsModule {}
