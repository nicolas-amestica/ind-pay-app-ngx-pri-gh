export interface CollectionAccount {
  id: string;
  tripId: string;
  participantId: string;
  version: number;
  active: boolean;
  free: boolean;
  depositAgreed: number;
  depositReceived: number;
  openAttemptId?: string;
  reviewAttemptId?: string;
  reviewedUnapplied?: number;
  unappliedReceived: number;
  withdrawalRefundApproved: number;
  unappliedRefundApproved: number;
  refunded: number;
  installments: {
    id: string;
    dueDate: string;
    original: number;
    discount: number;
    cancelled: number;
    paid: number;
  }[];
}
export type AccountOperation =
  | 'MANUAL_INSTALLMENT'
  | 'RECORD_DEPOSIT'
  | 'DISCOUNT'
  | 'ALLOCATE_UNAPPLIED'
  | 'APPROVE_WITHDRAWAL_REFUND'
  | 'APPROVE_UNAPPLIED_REFUND'
  | 'CONFIRM_REFUND'
  | 'RESOLVE_REFUNDED_REVIEW';
export interface AccountOperationRequest {
  commandId: string;
  version: number;
  operation: AccountOperation;
  reason: string;
  amount?: number;
  basisPoints?: number;
  installmentIds?: string[];
  reference?: string;
  effectiveDate?: string;
  email?: string;
}
