import type { Routes } from '@angular/router';

/** Rutas del artefacto local; no forman parte del despliegue administrativo. */
export const PAYMENT_PORTAL_ROUTES: Routes = [
  { path: 'pago-en-proceso', loadComponent: () => import('./pages/payment-transition/payment-transition.page').then((m) => m.PaymentTransitionPage) },
  { path: 'retorno', loadComponent: () => import('./pages/payment-return/payment-return.page').then((m) => m.PaymentReturnPage) },
  { path: 'cancelado', loadComponent: () => import('./pages/payment-return/payment-return.page').then((m) => m.PaymentReturnPage) },
  { path: 'verificar-comprobante', loadComponent: () => import('./pages/receipt-verification/receipt-verification.page').then((m) => m.ReceiptVerificationPage) },
  {
    path: 'pruebas-khipu',
    loadComponent: () => import('./pages/khipu-dev.page').then((m) => m.KhipuDevPage),
  },
  { path: '', loadComponent: () => import('./pages/lookup/lookup.page').then((m) => m.LookupPage) },
  { path: '**', redirectTo: '' },
];
