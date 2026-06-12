import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller()
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get('categories')
  categories() {
    return this.products.findCategories();
  }

  @Get('products')
  list(@Query('category') category?: string) {
    return this.products.findAll(category);
  }

  @Get('products/:slug')
  bySlug(@Param('slug') slug: string) {
    return this.products.findBySlug(slug);
  }
}
