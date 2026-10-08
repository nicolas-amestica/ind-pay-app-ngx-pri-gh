export interface PortalAttempt {
  id: string;
  status:
    | 'PENDING_PAYMENT'
    | 'VERIFYING_PROVIDER'
    | 'CONFIRMED'
    | 'REVIEW_REQUIRED'
    | 'RECONCILIATION_REQUIRED'
    | 'PROVIDER_REVIEW_REQUIRED'
    | 'UNPAID_FINAL'
    | 'REVERSED';
  paymentUrl?: string;
  receiptReady?: boolean;
  lastCheckedAt?: string;
}
