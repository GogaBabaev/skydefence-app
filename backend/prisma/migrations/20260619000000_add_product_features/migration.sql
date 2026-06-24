-- AlterTable: add nullable JSONB column for the product "features" block
-- Shape: { "title": "Преимущества"|"Особенности"|"Характеристики", "items": string[] }
-- NULL = no features block shown for the product.
ALTER TABLE "products" ADD COLUMN "features" JSONB;
