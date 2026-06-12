import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { YooKassaClient } from './yookassa.client';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, YooKassaClient],
  exports: [PaymentsService],
})
export class PaymentsModule {}
