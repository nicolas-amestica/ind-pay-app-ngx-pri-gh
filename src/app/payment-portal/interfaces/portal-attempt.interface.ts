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
  installmentNumber?: number;
  paymentUrl?: string;
  receiptReady?: boolean;
  receiptStatus?: 'PREPARING' | 'AVAILABLE';
  receiptDeliveryStatus?:
    'PENDING' | 'SMTP_ACCEPTED' | 'FAILED_RETRYING' | 'FAILED' | 'NOT_REQUESTED' | 'UNKNOWN';
  receiptRecoveryAvailable?: boolean;
  taxDocumentStatus?:
    | 'PREPARING'
    | 'SUBMITTED'
    | 'ACCEPTED'
    | 'ACCEPTED_WITH_REPAIRS'
    | 'REJECTED'
    | 'REISSUE_PENDING'
    | 'UNKNOWN';
  taxDocumentDeliveryStatus?:
    | 'PENDING'
    | 'SMTP_ACCEPTED'
    | 'DOCUMENT_READY_NO_RECIPIENT'
    | 'FAILED_RETRYING'
    | 'FAILED'
    | 'UNKNOWN';
  taxDocumentRecoveryAvailable?: boolean;
  lastCheckedAt?: string;
}
