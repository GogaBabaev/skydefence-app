import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsString()
  @MaxLength(300)
  name: string;

  // null = "цена по запросу". Если цена указана — она не может быть
  // отрицательной (защита от подмены итога в меньшую сторону).
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1_000_000_000)
  price: number | null;

  @IsInt()
  @Min(1)
  @Max(10_000)
  qty: number;
}

export class CreateOrderLeadDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @IsString()
  @Matches(/^\+?[0-9\s\-()]{7,20}$/, { message: 'Invalid phone number' })
  phone: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  source?: string;
}

export class CreateCallbackLeadDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @IsString()
  @Matches(/^\+?[0-9\s\-()]{7,20}$/, { message: 'Invalid phone number' })
  phone: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;
}
