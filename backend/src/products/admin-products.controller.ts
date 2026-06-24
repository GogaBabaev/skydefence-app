import {
  BadRequestException,
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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { mkdirSync } from 'fs';
import { extname, join } from 'path';
import { AdminSecretGuard } from '../common/guards/admin-secret.guard';
import { AdminProductsService } from './admin-products.service';
import { UpsertProductDto } from './dto/upsert-product.dto';

// Admin-uploaded images. The host's public/images folder is bind-mounted into
// this container at /app/images (read-write) and into the edge Caddy at
// /srv/images (read-only), which serves it at /images/*. So a file written to
// /app/images/uploads/<name> is reachable at /images/uploads/<name> with no
// app-server round-trip. The `uploads` subfolder keeps admin uploads separate
// from the ~300 seed product images. See docker-compose.prod.yml (api + caddy
// volumes) and the /images/* handler in the production Caddyfile.
const IMAGES_DIR = join('/app/images', 'uploads');
const ALLOWED_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);

// Best-effort: the folder is normally pre-created on the host and bind-mounted.
// Never throw at module load — a permissions/mount issue must NOT take down the
// whole API; at worst uploads fail per-request while the store keeps working.
try {
  mkdirSync(IMAGES_DIR, { recursive: true });
} catch {
  // swallow — see note above
}

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

  /**
   * Uploads a single product image into the bind-mounted images folder.
   * Caddy serves it at /images/*, so the returned url is immediately
   * reachable from the Mini App, the website and the API responses.
   */
  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: IMAGES_DIR,
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname).toLowerCase();
          // timestamp-ish unique name without Date.now/Math.random reliance issues
          const unique = `${process.hrtime.bigint()}${ext}`;
          cb(null, unique);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        if (!file.mimetype.startsWith('image/') || !ALLOWED_EXT.has(ext)) {
          cb(new BadRequestException('Only image files are allowed'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    return { url: `/images/uploads/${file.filename}` };
  }
}
