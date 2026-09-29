import { describe, expect, it } from 'vitest';
import { newAttemptId, safeCheckoutUrl, validAttemptId } from './khipu-dev.fn';

describe('Khipu DEV helpers', () => {
  it('genera ULID válidos y distintos', () => {
    const ids = Array.from({ length: 100 }, () => newAttemptId());
    expect(ids.every(validAttemptId)).toBe(true);
    expect(new Set(ids).size).toBe(100);
    expect(validAttemptId('../configuracion')).toBe(false);
  });
  it('solo permite checkout HTTPS de hosts exactos de Khipu', () => {
    expect(safeCheckoutUrl('https://khipu.com/payment/123')).toBe('https://khipu.com/payment/123');
    expect(safeCheckoutUrl('https://app.khipu.com/payment/123')).not.toBeNull();
    for (const url of [
      'javascript:alert(1)',
      'http://khipu.com',
      'https://khipu.com.evil.test',
      'https://evil.test@khipu.com',
      'https://khipu.com:444',
      '/relative',
      'invalid',
    ]) {
      expect(safeCheckoutUrl(url)).toBeNull();
    }
  });
});
