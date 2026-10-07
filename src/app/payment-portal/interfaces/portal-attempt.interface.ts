export interface PortalAttempt {
  id: string;
  status:
    | 'PENDING_PAYMENT'
    | 'CONFIRMED'
    | 'REVIEW_REQUIRED'
    | 'RECONCILIATION_REQUIRED'
    | 'UNPAID_FINAL'
    | 'REVERSED';
  paymentUrl?: string;
  receiptReady?: boolean;
}
