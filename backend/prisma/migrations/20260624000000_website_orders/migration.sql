-- Allow website orders: orders.user_id and order_items.product_id become optional.
-- Mini-app orders still populate both fields; website orders (from sky-defence.ru)
-- arrive without a Telegram user_id or a DB product_id.

-- Make orders.user_id nullable (drop NOT NULL, keep FK constraint)
ALTER TABLE "orders" ALTER COLUMN "user_id" DROP NOT NULL;

-- Make order_items.product_id nullable (drop NOT NULL, keep FK constraint)
ALTER TABLE "order_items" ALTER COLUMN "product_id" DROP NOT NULL;
