export interface ReceiptSummary {
  id: string;
  amount: number;
  effectiveDate: string;
  review: boolean;
}
export interface ReceiptPage {
  items: ReceiptSummary[];
  nextCursor?: string;
}
export interface ReceiptScope {
  accountId?: string;
  tripId?: string;
}
export interface ReceiptView {
  items: ReceiptSummary[];
  cursor: string;
  loaded: boolean;
  busy: boolean;
  error: string;
  url: string;
}
export interface ReceiptDeliveryRequest {
  commandId: string;
  email: string;
}
export interface ReceiptDeliveryView {
  receiptId: string;
  request: ReceiptDeliveryRequest | null;
  busy: boolean;
  queued: boolean;
  error: string;
}
