import { plainToInstance, Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  validateSync,
} from 'class-validator';

class EnvVars {
  @IsOptional()
  @IsString()
  NODE_ENV?: string;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @IsOptional()
  PORT?: number;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsString()
  @IsNotEmpty()
  TELEGRAM_BOT_TOKEN: string;

  @IsString()
  @IsNotEmpty()
  TELEGRAM_MANAGER_CHAT_ID: string;

  /** Shared secret the bot sends to call /api/admin/orders/:id/status */
  @IsString()
  @IsNotEmpty()
  ADMIN_API_SECRET: string;

  @IsOptional()
  @IsString()
  CORS_ORIGINS?: string;
}

export function validateEnv(config: Record<string, unknown>): EnvVars {
  // Tests provide their own config via DI — skip strict env validation
  if (process.env.NODE_ENV === 'test') {
    return plainToInstance(EnvVars, config);
  }
  const validated = plainToInstance(EnvVars, config);
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(
      `Invalid environment:\n${errors
        .map((e) => Object.values(e.constraints ?? {}).join(', '))
        .join('\n')}`,
    );
  }
  return validated;
}
