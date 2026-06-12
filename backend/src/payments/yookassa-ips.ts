import { isIPv4 } from 'net';

/**
 * Official YooKassa webhook source ranges:
 * https://yookassa.ru/developers/using-api/webhooks#ip
 */
const RANGES_V4: [number, number][] = [
  cidrV4('185.71.76.0/27'),
  cidrV4('185.71.77.0/27'),
  cidrV4('77.75.153.0/25'),
  cidrV4('77.75.156.11/32'),
  cidrV4('77.75.156.35/32'),
  cidrV4('77.75.154.128/25'),
];

const RANGE_V6_PREFIX = '2a02:5180:'; // 2a02:5180::/32

function ipV4ToInt(ip: string): number {
  return ip
    .split('.')
    .reduce((acc, oct) => (acc << 8) + Number(oct), 0) >>> 0;
}

function cidrV4(cidr: string): [number, number] {
  const [ip, bitsStr] = cidr.split('/');
  const bits = Number(bitsStr);
  const base = ipV4ToInt(ip);
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return [base & mask, mask];
}

export function isYooKassaIp(rawIp: string): boolean {
  // strip IPv4-mapped IPv6 prefix (::ffff:1.2.3.4)
  const ip = rawIp.replace(/^::ffff:/i, '');

  if (isIPv4(ip)) {
    const n = ipV4ToInt(ip);
    return RANGES_V4.some(([base, mask]) => (n & mask) === base);
  }
  return ip.toLowerCase().startsWith(RANGE_V6_PREFIX);
}
