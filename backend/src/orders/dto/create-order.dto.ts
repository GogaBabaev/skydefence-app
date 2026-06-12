import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class OrderItemDto {
  @IsInt()
  @Min(1)
  productId: number;

  @IsInt()
  @Min(1)
  @Max(999)
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  customerName: string;

  @IsString()
  @Matches(/^\+?[0-9\s\-()]{7,20}$/, { message: 'Invalid phone number' })
  customerPhone: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  customerEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  company?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{10}(\d{2})?$/, { message: 'INN must be 10 or 12 digits' })
  inn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  deliveryAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}
