export interface TaxDocumentItem {
  readonly description: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly exempt: boolean;
  readonly unit?: string;
}

export interface TaxDocumentVerification {
  readonly authentic: boolean;
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
