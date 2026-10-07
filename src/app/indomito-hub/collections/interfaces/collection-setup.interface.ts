/** Vista administrativa: no exponer la nómina en el portal público. */
export interface CollectionSetup {
  status: 'NOT_STARTED' | 'PREPARING' | 'ACTIVE';
  freeParticipantIds: string[];
  contractId: string;
  contractVersion: number;
  tripName: string;
  departureDate: string;
  freeCount: number;
  pricePerPayer: number;
  depositAgreed: number;
  dueDates: string[];
  daysBeforeDeparture: number;
  members: { id: string; name: string; dni: string }[];
  policyVersion: number;
}

export interface CollectionSetupRequest {
  contractVersion: number;
  freeParticipantIds: string[];
}

export interface CollectionSetupResult {
  tripId: string;
  status: 'ACTIVE';
  participantCount: number;
  freeCount: number;
}
