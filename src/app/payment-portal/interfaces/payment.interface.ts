export interface Installment {
  id: string;
  tripId: string;
  tripName: string;
  passengerId: string;
  label: string;
  dueDate: string;
  amount: number;
  paid: number;
  receiptId?: string;
}
export interface PaymentAttempt {
  id: string;
  amount: number;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
}
export interface PaymentReceipt {
  id: string;
  tripName: string;
  installment: string;
  amount: number;
  issuedAt: string;
  description: string;
}
