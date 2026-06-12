import { createHmac, timingSafeEqual } from 'crypto';

export interface TelegramInitUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface ValidatedInitData {
  user: TelegramInitUser;
  authDate: number;
  raw: URLSearchParams;
}

/**
 * Validates Telegram WebApp initData (server-side, per official docs):
 *  secret_key = HMAC_SHA256(key="WebAppData", data=bot_token)
 *  hash       = hex(HMAC_SHA256(key=secret_key, data=data_check_string))
 * data_check_string = sorted "key=value" pairs (excluding hash), joined by "\n".
 *
 * Returns null when the signature is invalid, expired or malformed.
 */
export function validateInitData(
  initData: string,
  botToken: string,
  maxAgeSeconds = 86_400,
  now: () => number = () => Date.now(),
): ValidatedInitData | null {
  if (!initData || initData.length > 4096) return null;

  let params: URLSearchParams;
  try {
    params = new URLSearchParams(initData);
  } catch {
    return null;
  }

  const hash = params.get('hash');
  if (!hash || !/^[0-9a-f]{64}$/i.test(hash)) return null;

  const pairs: string[] = [];
  params.forEach((value, key) => {
    if (key !== 'hash') pairs.push(`${key}=${value}`);
  });
  pairs.sort();
  const dataCheckString = pairs.join('\n');

  const secretKey = createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();
  const expected = createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest();

  const provided = Buffer.from(hash, 'hex');
  if (
    provided.length !== expected.length ||
    !timingSafeEqual(provided, expected)
  ) {
    return null;
  }

  const authDate = Number(params.get('auth_date'));
  if (!Number.isFinite(authDate)) return null;
  const ageSeconds = now() / 1000 - authDate;
  if (ageSeconds > maxAgeSeconds || ageSeconds < -60) return null;

  let user: TelegramInitUser;
  try {
    user = JSON.parse(params.get('user') ?? '');
  } catch {
    return null;
  }
  if (!user || typeof user.id !== 'number') return null;

  return { user, authDate, raw: params };
}
