export interface TaxDocumentItem {
  readonly description: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly exempt: boolean;
  readonly unit?: string;
}

export interface TaxDocumentVerification {
  readonly authentic: boolean;
  readonly queryStatus?: 'FOUND' | 'NOT_FOUND' | 'RATE_LIMITED' | 'UNAVAILABLE' | 'INVALID_REQUEST';
  readonly issuedByIndomito?: boolean;
  readonly siiStatus?: 'PENDING' | 'ACCEPTED' | 'ACCEPTED_WITH_REPAIRS' | 'REJECTED' | 'UNKNOWN';
  readonly siiStatusUpdatedAt?: string;
  readonly originalFolio?: number;
  readonly replacementFolio?: number;
  readonly replacementPending?: boolean;
  readonly documentType?: number;
  readonly folio?: number;
  readonly issueDate?: string;
  readonly issuerRut?: string;
  readonly issuerName?: string;
  readonly issuerActivity?: string;
  readonly issuerAddress?: string;
  readonly issuerCommune?: string;
  readonly resolutionDate?: string;
  readonly resolutionNumber?: number;
  readonly netAmount?: number;
  readonly vatAmount?: number;
  readonly exemptAmount?: number;
  readonly totalAmount?: number;
  readonly items?: readonly TaxDocumentItem[];
  readonly ted?: string;
}
