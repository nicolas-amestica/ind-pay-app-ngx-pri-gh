export function validAttemptId(value: string): boolean {
  return /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/.test(value);
}

/** ULID criptográfico: se conserva antes de emitir la solicitud de creación. */
export function newAttemptId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  let value = BigInt(Date.now());
  for (const byte of bytes) value = (value << 8n) | BigInt(byte);
  const alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  let result = '';
  for (let i = 0; i < 26; i++) {
    result = alphabet[Number(value & 31n)] + result;
    value >>= 5n;
  }
  return result;
}

export function safeCheckoutUrl(value?: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' &&
      ['khipu.com', 'app.khipu.com'].includes(url.hostname) &&
      !url.port &&
      !url.username &&
      !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}
