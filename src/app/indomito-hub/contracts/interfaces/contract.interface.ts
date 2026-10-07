export type ContractStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type ContractSignatureStatus = 'NOT_REQUIRED' | 'PENDING_SIGNED_UPLOAD' | 'SIGNED_UPLOADED';
export interface ContractSignedDocument {
  id: string;
  contentType: 'application/pdf';
  size: number;
  sha256: string;
  approvedVersion: number;
  approvedPdfSha256: string;
  uploadedAt: string;
  uploadedBy: string;
  replacementReason?: string;
}
export interface ContractPerson {
  name: string;
  dni: string;
  course: string;
}
export type ContractPassengerSex = 'FEMALE' | 'MALE' | 'OTHER' | 'NOT_SPECIFIED';
export interface ContractPassenger {
  names: string;
  lastNames: string;
  dni: string;
  birthDate: string;
  nationality: string;
  sex: ContractPassengerSex;
}
export interface ContractProgramReference {
  id: string;
  name: string;
  updatedAt: string;
  content: Record<string, unknown>;
}
export interface ContractCountryOption {
  code: string;
  name: string;
}
export interface ContractBankAccountOption {
  id: string;
  label: string;
  accountNumber: string;
  accountHolder: string;
  holderDNI: string;
  bank: string;
  accountType: string;
  email: string;
}
export interface ContractFormConfiguration {
  companyRepresentatives: ContractPerson[];
  bankAccounts: ContractBankAccountOption[];
  defaults: { daysBeforePayment: number; specialProgramDeposit: number };
  countries: ContractCountryOption[];
}
export interface ContractContent {
  representatives: ContractPerson[];
  institution: { name: string; address: string; course: string };
  clientRepresentatives: ContractPerson[];
  trip: {
    city: string;
    contractDate: string;
    destination: string;
    departureDate: string;
    returnDate: string;
    days: number;
    nights: number;
    departurePoint: string;
  };
  plan: { name: string; servicesIncluded: { description: string }[] };
  payments: {
    totalPassengers: number;
    freePassengers: number;
    pricePerPerson: number;
    totalGroup: number;
    downPayment: number;
    groupBalance: number;
    daysBeforePayment: number;
    maxExchangeRate: number;
    discountPercentage: number;
    installments: {
      quantity: number;
      groupInstallmentValue: number;
      individualInstallmentValue: number;
      startMonth: string;
      startYear?: number;
      startDay?: number;
    };
    conditions: {
      refundPolicyVersion?: number;
      depositPercentageWithFlight: number;
      depositPercentageWithoutFlight: number;
      specialProgramDeposit: number;
      daysBeforeFlightBalance: number;
      daysBeforeTerrestrialBalance: number;
      cancellationPenaltyPercentage: number;
      cancellationNoticeDays: number;
      complaintDeadlineDays: number;
    };
    bankAccount: {
      accountNumber: string;
      accountHolder: string;
      holderDNI: string;
      bank: string;
      email: string;
    };
  };
  passengers: ContractPassenger[];
}
export interface Contract {
  id: string;
  programId?: string;
  programReference?: ContractProgramReference;
  period: string;
  status: ContractStatus;
  content: ContractContent;
  createdAt: string;
  updatedAt: string;
  version: number;
  pdfDocument?: {
    objectKey: string;
    contentType: string;
    size: number;
    sha256: string;
    generatorVersion: string;
    generatedAt: string;
    generatedBy: string;
  };
  approvedAt?: string;
  approvedBy?: string;
  signatureStatus?: ContractSignatureStatus;
  signedDocument?: ContractSignedDocument;
}
export interface ContractSummary {
  id: string;
  planName: string;
  institutionName: string;
  destination: string;
  period: string;
  passengerCount: number;
  status: ContractStatus;
  createdAt: string;
  updatedAt: string;
  signatureStatus: ContractSignatureStatus;
}
export interface ContractPDFAccess {
  url: string;
  expiresAt: string;
}
export interface ContractSignedDocumentPage {
  items: ContractSignedDocument[];
  nextCursor?: string;
}
export interface ContractSignedUploadPreparation {
  clientRequestId: string;
  uploadUrl?: string;
  method?: 'PUT';
  contentType?: 'application/pdf';
  expiresAt?: string;
  maxSize?: number;
  status?: 'COMPLETED';
}
export type ContractAmendmentStatus = 'DRAFT' | 'APPROVED';
export interface ContractTermsSnapshot {
  departureDate: string;
  returnDate: string;
  days: number;
  nights: number;
  services: { description: string }[];
}
export interface ContractAmendment {
  id: string;
  contractId: string;
  baseContractVersion: number;
  baseTermsRevision: number;
  version: number;
  status: ContractAmendmentStatus;
  reason: string;
  before: ContractTermsSnapshot;
  after: ContractTermsSnapshot;
  createdAt: string;
  createdBy: string;
  approvedAt?: string;
  approvedBy?: string;
  pdfDocument?: Contract['pdfDocument'];
}
export interface ContractAmendmentPage {
  items: ContractAmendment[];
  nextCursor?: string;
}
export interface ContractAmendmentCreateRequest {
  id: string;
  baseContractVersion: number;
  reason: string;
  after: ContractTermsSnapshot;
}
export interface ContractCreateRequest {
  programId?: string;
  programReference?: ContractProgramReference;
  period?: string;
  content: ContractContent;
}
export interface ContractUpdateRequest {
  programId?: string;
  programReference?: ContractProgramReference;
  period: string;
  status: ContractStatus;
  content: ContractContent;
  version: number;
}
