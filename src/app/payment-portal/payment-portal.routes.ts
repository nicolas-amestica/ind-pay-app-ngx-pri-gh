import type { Routes } from '@angular/router';

/** Rutas del artefacto local; no forman parte del despliegue administrativo. */
export const PAYMENT_PORTAL_ROUTES: Routes = [
  {
    path: 'pruebas-khipu',
    loadComponent: () => import('./pages/khipu-dev.page').then((m) => m.KhipuDevPage),
  },
  { path: '', loadComponent: () => import('./pages/payment.page').then((m) => m.PaymentPage) },
  {
    path: 'tesoreria',
    loadComponent: () =>
      import('../indomito-hub/treasury/pages/treasury.page').then((m) => m.TreasuryPage),
  },
  { path: '**', redirectTo: '' },
];
