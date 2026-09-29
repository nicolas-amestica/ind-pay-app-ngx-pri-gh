export interface KhipuDevConfiguration {
  amount: number;
  currency: string;
  mode: string;
  testBankAvailable: boolean;
}

export interface KhipuDevAttempt {
  id: string;
  amount: number;
  status: 'CREATING' | 'PENDING' | 'CONFIRMED' | 'BLOCKED' | 'RECONCILIATION_REQUIRED';
  paymentUrl?: string;
  receipt?: { id: string; amount: number; issuedAt: string; description: string };
  notificationStatus?: string;
}
