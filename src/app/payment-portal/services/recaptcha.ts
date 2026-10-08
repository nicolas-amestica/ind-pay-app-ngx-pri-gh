import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

interface RecaptchaEnterpriseApi {
  ready(callback: () => void): void;
  execute(siteKey: string, options: { action: string }): Promise<string>;
}

interface RecaptchaWindow extends Window {
  grecaptcha?: { enterprise?: RecaptchaEnterpriseApi };
}

@Injectable({ providedIn: 'root' })
export class RecaptchaService {
  private readonly executionTimeoutMs = 15_000;
  private readonly document = inject(DOCUMENT);
  private loading: Promise<RecaptchaEnterpriseApi> | null = null;

  execute(siteKey: string, action: string): Promise<string> {
    if (!siteKey.trim() || !action.trim())
      return Promise.reject(new Error('reCAPTCHA no configurado'));
    return this.withTimeout(
      this.load(siteKey).then(
        (api) =>
          new Promise<string>((resolve, reject) => {
            try {
              api.ready(() => {
                try {
                  void api.execute(siteKey, { action }).then(resolve, reject);
                } catch (error: unknown) {
                  reject(error);
                }
              });
            } catch (error: unknown) {
              reject(error);
            }
          }),
      ),
    );
  }

  private withTimeout<T>(operation: Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timeoutId = globalThis.setTimeout(
        () => reject(new Error('reCAPTCHA no respondio a tiempo')),
        this.executionTimeoutMs,
      );
      operation.then(
        (value) => {
          globalThis.clearTimeout(timeoutId);
          resolve(value);
        },
        (error: unknown) => {
          globalThis.clearTimeout(timeoutId);
          reject(error);
        },
      );
    });
  }

  private load(siteKey: string): Promise<RecaptchaEnterpriseApi> {
    const browserWindow = this.document.defaultView as RecaptchaWindow | null;
    const current = browserWindow?.grecaptcha?.enterprise;
    if (current) return Promise.resolve(current);
    if (this.loading) return this.loading;
    this.loading = new Promise<RecaptchaEnterpriseApi>((resolve, reject) => {
      const script = this.document.createElement('script');
      script.src = `https://www.google.com/recaptcha/enterprise.js?render=${encodeURIComponent(siteKey)}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        const api = browserWindow?.grecaptcha?.enterprise;
        api ? resolve(api) : reject(new Error('reCAPTCHA no disponible'));
      };
      script.onerror = () => reject(new Error('No fue posible cargar reCAPTCHA'));
      this.document.head.appendChild(script);
    }).catch((error: unknown) => {
      this.loading = null;
      throw error;
    });
    return this.loading;
  }
}
