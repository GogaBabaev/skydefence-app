import { IsString, IsOptional, IsBoolean, IsNumber, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class UpsertProductDto {
  @IsString()
  slug: string;

  @IsString()
  name: string;

  @IsString()
  categorySlug: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  price?: number | null;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  oldPrice?: number | null;

  @IsOptional()
  @IsString()
  badge?: string;

  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  inStock: boolean;

  @IsString()
  shortDesc: string;

  @IsString()
  fullDesc: string;

  @IsString()
  image: string;

  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (typeof value === 'string' ? JSON.parse(value) : value))
  gallery: string[];

  @Transform(({ value }) => (typeof value === 'string' ? JSON.parse(value) : value))
  specs: { label: string; value: string }[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  isActive?: boolean;
}
