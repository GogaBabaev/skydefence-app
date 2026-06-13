import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

/**
 * AdminSecretGuard: protects manager-only endpoints called by the
 * Telegram bot (callback buttons), not by end users.
 * The bot authenticates itself with a shared secret header — the actual
 * "who is the manager" check happens in bot.js, which only acts on
 * callback_queries coming from TELEGRAM_MANAGER_CHAT_ID.
 */
@Injectable()
export class AdminSecretGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const expected = this.config.get<string>('ADMIN_API_SECRET');
    const provided = req.headers['x-admin-secret'];
    if (!expected || provided !== expected) {
      throw new UnauthorizedException('Invalid admin secret');
    }
    return true;
  }
}
