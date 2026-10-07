export interface GroupDepositRequest {
  commandId: string;
  amount: number;
  reference: string;
  effectiveDate: string;
  email: string;
  reason: string;
}

export interface GroupDepositState {
  id: string;
  tripId: string;
  status: 'PREPARING' | 'APPLYING' | 'APPLIED';
  amount: number;
  prepared: number;
  applied: number;
  expected: number;
}
