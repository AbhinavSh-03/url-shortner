import { encode, decode } from './base62';

describe('Base62', () => {
  test('encode works', () => {
    expect(encode(0)).toBe('0');
    expect(encode(125)).toBe('21');
  });

  test('decode works', () => {
    expect(decode('21')).toBe(125);
  });

  test('round trip', () => {
    const num = 987654;
    expect(decode(encode(num))).toBe(num);
  });
});
