/** Genera un ULID con aleatoriedad criptográfica, sin información del usuario. */
export function newUlid(): string {
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
