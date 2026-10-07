export function safeReceiptUrl(value: string): string {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      !url.port &&
      (url.hostname.endsWith('.s3.us-east-1.amazonaws.com') ||
        url.hostname.endsWith('.s3.amazonaws.com'))
      ? url.href
      : '';
  } catch {
    return '';
  }
}
