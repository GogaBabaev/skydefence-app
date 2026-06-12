import { createHmac } from 'crypto';
import { validateInitData } from './init-data.util';

const BOT_TOKEN = '12345:TEST_TOKEN';

/** Builds correctly signed initData the same way Telegram does. */
function buildInitData(
  overrides: Record<string, string> = {},
  token = BOT_TOKEN,
): string {
  const params: Record<string, string> = {
    auth_date: String(Math.floor(Date.now() / 1000)),
    query_id: 'AAH_test',
    user: JSON.stringify({ id: 777, first_name: 'Misha', username: 'misha' }),
    ...overrides,
  };
  const dataCheckString = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('\n');
  const secret = createHmac('sha256', 'WebAppData').update(token).digest();
  const hash = createHmac('sha256', secret)
    .update(dataCheckString)
    .digest('hex');
  return new URLSearchParams({ ...params, hash }).toString();
}

describe('validateInitData', () => {
  it('accepts correctly signed initData', () => {
    const result = validateInitData(buildInitData(), BOT_TOKEN);
    expect(result).not.toBeNull();
    expect(result!.user.id).toBe(777);
    expect(result!.user.username).toBe('misha');
  });

  it('rejects data signed with a different bot token', () => {
    const forged = buildInitData({}, 'ANOTHER:TOKEN');
    expect(validateInitData(forged, BOT_TOKEN)).toBeNull();
  });

  it('rejects tampered user payload', () => {
    const valid = buildInitData();
    const params = new URLSearchParams(valid);
    params.set('user', JSON.stringify({ id: 1, first_name: 'Hacker' }));
    expect(validateInitData(params.toString(), BOT_TOKEN)).toBeNull();
  });

  it('rejects expired initData', () => {
    const old = buildInitData({
      auth_date: String(Math.floor(Date.now() / 1000) - 100_000),
    });
    expect(validateInitData(old, BOT_TOKEN)).toBeNull();
  });

  it('rejects missing hash / malformed input', () => {
    expect(validateInitData('', BOT_TOKEN)).toBeNull();
    expect(validateInitData('user=abc', BOT_TOKEN)).toBeNull();
    expect(validateInitData('hash=zzzz', BOT_TOKEN)).toBeNull();
  });

  it('rejects oversized payloads (DoS guard)', () => {
    const big = buildInitData() + '&x=' + 'a'.repeat(5000);
    expect(validateInitData(big, BOT_TOKEN)).toBeNull();
  });
});
