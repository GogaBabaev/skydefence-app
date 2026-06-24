import { Module } from '@nestjs/common';
import { B2bController } from './b2b.controller';
import { B2bService } from './b2b.service';
import { AdminB2bController } from './admin-b2b.controller';
import { WebsiteB2bController } from './website-b2b.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [B2bController, AdminB2bController, WebsiteB2bController],
  providers: [B2bService],
})
export class B2bModule {}
