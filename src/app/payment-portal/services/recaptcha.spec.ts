import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RecaptchaService } from './recaptcha';

describe('RecaptchaService', () => {
  let service: RecaptchaService;
  let browserWindow: Window & {
    grecaptcha?: {
      enterprise: {
        ready(callback: () => void): void;
        execute(siteKey: string, options: { action: string }): Promise<string>;
      };
    };
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecaptchaService);
    browserWindow = TestBed.inject(DOCUMENT).defaultView as typeof browserWindow;
  });

  afterEach(() => {
    delete browserWindow.grecaptcha;
    vi.restoreAllMocks();
  });

  it('returns the token produced by reCAPTCHA Enterprise', async () => {
    const execute = vi.fn().mockResolvedValue('recaptcha-token');
    browserWindow.grecaptcha = {
      enterprise: {
        ready: (callback) => callback(),
        execute,
      },
    };

    await expect(service.execute('site-key', 'khipu_checkout')).resolves.toBe(
      'recaptcha-token',
    );
    expect(execute).toHaveBeenCalledWith('site-key', { action: 'khipu_checkout' });
  });

  it('rejects when the Google API throws before returning a promise', async () => {
    browserWindow.grecaptcha = {
      enterprise: {
        ready: (callback) => callback(),
        execute: () => {
          throw new Error('Invalid site key');
        },
      },
    };

    await expect(service.execute('invalid-site-key', 'khipu_checkout')).rejects.toThrow(
      'Invalid site key',
    );
  });
});
