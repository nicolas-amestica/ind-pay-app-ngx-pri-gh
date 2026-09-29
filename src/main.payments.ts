import { registerLocaleData } from '@angular/common';
import localeEsCl from '@angular/common/locales/es-CL';
import { provideHttpClient } from '@angular/common/http';
import { LOCALE_ID } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import { App } from './app/app';
import { PAYMENT_PORTAL_ROUTES } from './app/payment-portal/payment-portal.routes';
import { IndomitoPreset } from './app/core/theme/indomito.preset';
import { PRIMENG_ES_CL } from './app/core/i18n/primeng-es-cl';
import { registerPrimeUiLicense } from './app/core/theme/register-primeui-license';

registerLocaleData(localeEsCl);
registerPrimeUiLicense();
bootstrapApplication(App, {
  providers: [
    provideRouter(PAYMENT_PORTAL_ROUTES),
    provideHttpClient(),
    provideAnimationsAsync(),
    MessageService,
    { provide: LOCALE_ID, useValue: 'es-CL' },
    providePrimeNG({
      translation: PRIMENG_ES_CL,
      theme: {
        preset: IndomitoPreset,
        options: {
          darkModeSelector: '.dark',
          cssLayer: { name: 'primeng', order: 'theme, base, primeng' },
        },
      },
    }),
  ],
}).catch(console.error);
