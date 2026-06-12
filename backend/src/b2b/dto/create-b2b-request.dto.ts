import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateB2bRequestDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  company: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{10}(\d{2})?$/, { message: 'INN must be 10 or 12 digits' })
  inn?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  contactName: string;

  @IsString()
  @Matches(/^\+?[0-9\s\-()]{7,20}$/, { message: 'Invalid phone number' })
  phone: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  productSlug?: string;

  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  message: string;
}
