import { Injectable, NotFoundException } from '@nestjs/common';
type StockStatus = 'IN_STOCK' | 'ON_ORDER' | 'OUT_OF_ORDER';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertProductDto } from './dto/upsert-product.dto';

@Injectable()
export class AdminProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const products = await this.prisma.product.findMany({
      include: { category: true },
      orderBy: { id: 'asc' },
    });
    return products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category.label,
      categorySlug: p.category.slug,
      price: p.price === null ? null : Number(p.price),
      oldPrice: p.oldPrice === null ? null : Number(p.oldPrice),
      badge: p.badge,
      inStock: p.inStock,
      isActive: p.isActive,
      shortDesc: p.shortDesc,
      fullDesc: p.fullDesc,
      image: p.image,
      gallery: p.gallery,
      specs: p.specs,
    }));
  }

  async create(dto: UpsertProductDto) {
    const category = await this.resolveCategory(dto.categorySlug);
    return this.prisma.product.create({
      data: {
        slug: dto.slug,
        name: dto.name,
        categoryId: category.id,
        price: dto.price ?? null,
        oldPrice: dto.oldPrice ?? null,
        badge: dto.badge ?? null,
        inStock: dto.inStock,
        shortDesc: dto.shortDesc,
        fullDesc: dto.fullDesc,
        image: dto.image,
        gallery: dto.gallery,
        specs: dto.specs as object[],
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: number, dto: UpsertProductDto) {
    await this.findOrFail(id);
    const category = await this.resolveCategory(dto.categorySlug);
    return this.prisma.product.update({
      where: { id },
      data: {
        slug: dto.slug,
        name: dto.name,
        categoryId: category.id,
        price: dto.price ?? null,
        oldPrice: dto.oldPrice ?? null,
        badge: dto.badge ?? null,
        inStock: dto.inStock,
        shortDesc: dto.shortDesc,
        fullDesc: dto.fullDesc,
        image: dto.image,
        gallery: dto.gallery,
        specs: dto.specs as object[],
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateStock(id: number, stock: StockStatus) {
    await this.findOrFail(id);
    const inStock = stock === 'IN_STOCK' || stock === 'ON_ORDER';
    return this.prisma.product.update({ where: { id }, data: { inStock } });
  }

  async remove(id: number) {
    await this.findOrFail(id);
    await this.prisma.product.update({ where: { id }, data: { isActive: false } });
    return { ok: true };
  }

  private async findOrFail(id: number) {
    const p = await this.prisma.product.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }

  private async resolveCategory(slug: string) {
    const cat = await this.prisma.category.findUnique({ where: { slug } });
    if (!cat) throw new NotFoundException(`Category not found: ${slug}`);
    return cat;
  }
}
