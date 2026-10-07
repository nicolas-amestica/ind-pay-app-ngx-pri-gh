import { newUlid } from '../../shared/fn/new-ulid';

export function validAttemptId(value: string): boolean {
  return /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/.test(value);
}

/** ULID criptográfico: se conserva antes de emitir la solicitud de creación. */
export function newAttemptId(): string {
  return newUlid();
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
