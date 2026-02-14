const CHARSET =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

const BASE = CHARSET.length; // 62

export function encode(num: number): string {
  if (num < 0) {
    throw new Error('Number must be non-negative');
  }

  if (num === 0) {
    return CHARSET[0];
  }

  let encoded = '';

  while (num > 0) {
    encoded = CHARSET[num % BASE] + encoded;
    num = Math.floor(num / BASE);
  }

  return encoded;
}

export function decode(str: string): number {
  if (!str) {
    throw new Error('Input string cannot be empty');
  }

  let decoded = 0;

  for (let i = 0; i < str.length; i++) {
    const index = CHARSET.indexOf(str[i]);

    if (index === -1) {
      throw new Error(`Invalid character found: ${str[i]}`);
    }

    decoded = decoded * BASE + index;
  }

  return decoded;
}
