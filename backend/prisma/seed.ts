/**
 * Seeds categories + products from catalog.json
 * (generated from the frontend's src/data/products.ts).
 * Usage: npm run seed
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

interface CatalogProduct {
  slug: string;
  name: string;
  categorySlug: string;
  price: number | null;
  oldPrice?: number;
  badge?: string;
  inStock: boolean;
  shortDesc: string;
  fullDesc: string;
  image: string;
  gallery: string[];
  specs: { label: string; value: string }[];
}

interface Catalog {
  categories: { slug: string; label: string }[];
  products: CatalogProduct[];
}

const prisma = new PrismaClient();

async function main() {
  const file = path.join(__dirname, 'catalog.json');
  const catalog: Catalog = JSON.parse(fs.readFileSync(file, 'utf-8'));

  for (const c of catalog.categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      create: { slug: c.slug, label: c.label },
      update: { label: c.label },
    });
  }
  const categories: { id: number; slug: string }[] =
    await prisma.category.findMany();
  const catBySlug = new Map(categories.map((c) => [c.slug, c.id]));

  for (const p of catalog.products) {
    const categoryId = catBySlug.get(p.categorySlug);
    if (!categoryId) {
      console.warn(`Skipping ${p.slug}: unknown category ${p.categorySlug}`);
      continue;
    }
    const data = {
      name: p.name,
      categoryId,
      price: p.price,
      oldPrice: p.oldPrice ?? null,
      badge: p.badge ?? null,
      inStock: p.inStock,
      shortDesc: p.shortDesc,
      fullDesc: p.fullDesc,
      image: p.image,
      gallery: p.gallery,
      specs: p.specs as object[],
      isActive: true,
    };
    await prisma.product.upsert({
      where: { slug: p.slug },
      create: { slug: p.slug, ...data },
      update: data,
    });
  }

  const count = await prisma.product.count();
  console.log(`Seeded: ${catalog.categories.length} categories, ${count} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
