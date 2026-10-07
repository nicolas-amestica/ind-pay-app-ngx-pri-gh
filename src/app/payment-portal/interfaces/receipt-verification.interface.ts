export interface ReceiptVerification {
  authentic: boolean;
  code?: string;
  amount?: number;
  effectiveDate?: string;
  concept?: string;
  status?: 'REGISTERED' | 'UNDER_REVIEW' | 'REVERSED';
  version?: number;
}
