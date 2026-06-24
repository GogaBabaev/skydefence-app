-- Drop the old single-column index and replace with a composite index
-- that covers both category filtering and isActive filtering in one scan.
DROP INDEX IF EXISTS "products_category_id_idx";
CREATE INDEX "products_category_id_is_active_idx" ON "products"("category_id", "is_active");
