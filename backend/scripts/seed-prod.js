/**
 * Production seed — runs inside the api container (no ts-node needed).
 * Usage: node scripts/seed-prod.js
 */
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const file = path.join(__dirname, '../prisma/catalog.json');
  const catalog = JSON.parse(fs.readFileSync(file, 'utf-8'));

  for (const c of catalog.categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      create: { slug: c.slug, label: c.label },
      update: { label: c.label },
    });
  }

  const categories = await prisma.category.findMany();
  const catBySlug = new Map(categories.map((c) => [c.slug, c.id]));

  let count = 0;
  for (const p of catalog.products) {
    const categoryId = catBySlug.get(p.categorySlug);
    if (!categoryId) { console.warn(`Skipping ${p.slug}: unknown category`); continue; }
    const data = {
      name: p.name, categoryId,
      price: p.price ?? null, oldPrice: p.oldPrice ?? null,
      badge: p.badge ?? null, inStock: p.inStock,
      shortDesc: p.shortDesc, fullDesc: p.fullDesc,
      image: p.image, gallery: p.gallery, specs: p.specs, isActive: true,
    };
    await prisma.product.upsert({
      where: { slug: p.slug },
      create: { slug: p.slug, ...data },
      update: data,
    });
    count++;
  }
  console.log(`Seeded: ${catalog.categories.length} categories, ${count} products`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
