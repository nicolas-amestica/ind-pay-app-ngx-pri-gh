export interface TreasuryExpense {
  id: string;
  tripId: string;
  category: string;
  supplier: string;
  dueDate: string;
  amount: number;
  paid: number;
}
export interface TreasuryView {
  cash: {
    available: number;
    receipts: number;
    disbursements: number;
    inTransit: number;
    receivables: number;
    payables: number;
    projected: number;
  };
  sales: number;
  budget: number;
  margin: number;
  forecast: {
    month: string;
    opening: number;
    collections: number;
    expenses: number;
    closing: number;
  }[];
  payments: {
    id: string;
    tripId: string;
    amount: number;
    fee: number;
    status: string;
    settledAt?: string;
  }[];
  expenses: TreasuryExpense[];
  events: { id: string; type: string; amount: number; occurredAt: string }[];
  mail: { id: string; subject: string; body: string; createdAt: string }[];
}
