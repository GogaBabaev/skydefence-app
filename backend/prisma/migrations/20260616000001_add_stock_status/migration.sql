-- CreateEnum
CREATE TYPE "StockStatus" AS ENUM ('IN_STOCK', 'ON_ORDER', 'OUT_OF_ORDER');

-- AlterTable
ALTER TABLE "products" ADD COLUMN "stock" "StockStatus" NOT NULL DEFAULT 'IN_STOCK';
