import { isYooKassaIp } from './yookassa-ips';

describe('isYooKassaIp', () => {
  it('accepts official YooKassa IPv4 ranges', () => {
    expect(isYooKassaIp('185.71.76.1')).toBe(true);
    expect(isYooKassaIp('185.71.77.30')).toBe(true);
    expect(isYooKassaIp('77.75.153.100')).toBe(true);
    expect(isYooKassaIp('77.75.156.11')).toBe(true);
    expect(isYooKassaIp('77.75.156.35')).toBe(true);
    expect(isYooKassaIp('77.75.154.200')).toBe(true);
  });

  it('accepts IPv4-mapped IPv6 form', () => {
    expect(isYooKassaIp('::ffff:185.71.76.5')).toBe(true);
  });

  it('accepts the official IPv6 prefix', () => {
    expect(isYooKassaIp('2a02:5180::1')).toBe(true);
  });

  it('rejects unrelated IPs', () => {
    expect(isYooKassaIp('8.8.8.8')).toBe(false);
    expect(isYooKassaIp('185.71.78.1')).toBe(false);
    expect(isYooKassaIp('77.75.156.12')).toBe(false);
    expect(isYooKassaIp('127.0.0.1')).toBe(false);
    expect(isYooKassaIp('2a02:5181::1')).toBe(false);
    expect(isYooKassaIp('not-an-ip')).toBe(false);
  });
});
