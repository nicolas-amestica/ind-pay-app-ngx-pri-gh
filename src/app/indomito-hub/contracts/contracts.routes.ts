import type { Routes } from '@angular/router';
import { moduleGuard } from '../../core/auth/auth.guard';

export const CONTRACTS_ROUTES: Routes = [
  {
    path: ':id/anexos',
    title: 'Anexos del contrato',
    data: { module: 'CONTRACT_CREATE' },
    canActivate: [moduleGuard],
    loadComponent: () =>
      import('./pages/contract-amendments/contract-amendments.page').then(
        (m) => m.ContractAmendmentsPage,
      ),
  },
  {
    path: ':id/puesta-en-marcha',
    title: 'Puesta en marcha de cobranza',
    data: { module: 'PAYMENT_SETUP' },
    canActivate: [moduleGuard],
    loadComponent: () =>
      import('../collections/pages/contract-setup/contract-setup.page').then(
        (m) => m.ContractSetupPage,
      ),
  },
  {
    path: 'nuevo',
    title: 'Crear contrato',
    data: { module: 'CONTRACT_CREATE' },
    canActivate: [moduleGuard],
    loadComponent: () =>
      import('./pages/contract-form/contract-form.page').then((m) => m.ContractFormPage),
  },
  {
    path: ':id/editar',
    title: 'Editar contrato',
    data: { module: 'CONTRACT_CREATE' },
    canActivate: [moduleGuard],
    loadComponent: () =>
      import('./pages/contract-form/contract-form.page').then((m) => m.ContractFormPage),
  },
  {
    path: '',
    title: 'Listado de contratos',
    data: { module: 'CONTRACT_LIST' },
    canActivate: [moduleGuard],
    loadComponent: () =>
      import('./pages/contract-list/contract-list.page').then((m) => m.ContractListPage),
  },
];
