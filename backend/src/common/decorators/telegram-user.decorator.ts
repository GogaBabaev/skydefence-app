import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RequestWithTelegram } from '../guards/telegram-auth.guard';
import type { TelegramInitUser } from '../telegram/init-data.util';

export const TelegramUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): TelegramInitUser => {
    const req = ctx.switchToHttp().getRequest<RequestWithTelegram>();
    return req.telegram.user;
  },
);
