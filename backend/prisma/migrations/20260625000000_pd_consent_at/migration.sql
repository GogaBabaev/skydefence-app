-- 152-ФЗ: фиксируем момент согласия на обработку ПДн при создании заявки/заказа.
ALTER TABLE "orders" ADD COLUMN "pd_consent_at" TIMESTAMP(3);
ALTER TABLE "lead_callbacks" ADD COLUMN "pd_consent_at" TIMESTAMP(3);
ALTER TABLE "b2b_requests" ADD COLUMN "pd_consent_at" TIMESTAMP(3);
