import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import {
  validateInitData,
  ValidatedInitData,
} from '../telegram/init-data.util';

export interface RequestWithTelegram extends Request {
  telegram: ValidatedInitData;
}

/**
 * Authenticates requests coming from the Telegram Mini App.
 * The frontend sends window.Telegram.WebApp.initData verbatim
 * in the X-Telegram-Init-Data header; we verify the HMAC server-side.
 */
@Injectable()
export class TelegramAuthGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<RequestWithTelegram>();
    const initData = req.header('x-telegram-init-data');
    if (!initData) {
      throw new UnauthorizedException('Missing Telegram init data');
    }

    const botToken = this.config.getOrThrow<string>('TELEGRAM_BOT_TOKEN');
    const ttl = Number(this.config.get('TELEGRAM_INITDATA_TTL') ?? 86_400);

    const validated = validateInitData(initData, botToken, ttl);
    if (!validated) {
      throw new UnauthorizedException('Invalid Telegram init data');
    }

    req.telegram = validated;
    return true;
  }
}
