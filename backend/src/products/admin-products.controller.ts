import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { AdminSecretGuard } from '../common/guards/admin-secret.guard';
import { AdminProductsService } from './admin-products.service';
import { UpsertProductDto } from './dto/upsert-product.dto';

const IMAGES_DIR = join('/app/images');

@Controller('admin/products')
@UseGuards(AdminSecretGuard)
export class AdminProductsController {
  constructor(private readonly service: AdminProductsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: UpsertProductDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpsertProductDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/stock')
  updateStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { stock: 'IN_STOCK' | 'ON_ORDER' | 'OUT_OF_ORDER' },
  ) {
    return this.service.updateStock(id, body.stock);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: IMAGES_DIR,
        filename: (_req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
          cb(null, unique + extname(file.originalname));
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(new BadRequestException('Only image files are allowed'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    return { url: `/images/${file.filename}` };
  }
}
