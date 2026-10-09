import type { PassengerSession } from './passenger-session.interface';

export interface PublicInstallment {
  number: number;
  dueDate: string;
  amount: number;
  paid: number;
  outstanding: number;
  status: 'PENDING' | 'PAID' | 'ADJUSTED';
}

/** Respuesta pública mínima: no contiene datos personales ni identificadores de cuentas. */
export interface PublicAccount {
  accounts?: { accountId: string; tripId: string; name: string }[];
  openAttemptId?: string;
  reviewRequired?: boolean;
  reviewAttemptId?: string;
  session?: PassengerSession;
  active: boolean;
  free: boolean;
  checkoutEnabled: boolean;
  recaptchaSiteKey?: string;
  installments: PublicInstallment[];
}
