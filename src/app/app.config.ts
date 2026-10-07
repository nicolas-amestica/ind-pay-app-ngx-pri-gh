import { registerLocaleData } from '@angular/common';
import localeEsCl from '@angular/common/locales/es-CL';
import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';

import { PRIMENG_ES_CL } from './core/i18n/primeng-es-cl';
import { IndomitoPreset } from './core/theme/indomito.preset';
import { registerPrimeUiLicense } from './core/theme/register-primeui-license';
import { routes } from './app.routes';

registerLocaleData(localeEsCl);
registerPrimeUiLicense();

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
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
};
