import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface ProductRow {
  id: number;
  slug: string;
  name: string;
  price: unknown;
  oldPrice: unknown;
  badge: string | null;
  inStock: boolean;
  shortDesc: string;
  fullDesc: string;
  image: string;
  gallery: string[];
  specs: unknown;
  category: { slug: string; label: string };
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findCategories() {
    const categories = await this.prisma.category.findMany({
      orderBy: { id: 'asc' },
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    });
    return categories.map(
      (c: { slug: string; label: string; _count: { products: number } }) => ({
        slug: c.slug,
        label: c.label,
        count: c._count.products,
      }),
    );
  }

  async findAll(categorySlug?: string) {
    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      },
      include: { category: true },
      orderBy: { id: 'asc' },
    });
    return products.map((p: ProductRow) => this.toDto(p));
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, isActive: true },
      include: { category: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return this.toDto(product);
  }

  private toDto(p: ProductRow) {
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category.label,
      categorySlug: p.category.slug,
      price: p.price === null ? null : Number(p.price),
      oldPrice: p.oldPrice === null ? undefined : Number(p.oldPrice),
      badge: p.badge ?? undefined,
      inStock: p.inStock,
      shortDesc: p.shortDesc,
      fullDesc: p.fullDesc,
      image: p.image,
      gallery: p.gallery,
      specs: p.specs,
    };
  }
}
