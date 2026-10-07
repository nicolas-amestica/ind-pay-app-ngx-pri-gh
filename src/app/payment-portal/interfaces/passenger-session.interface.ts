/** Credencial breve: conservar solo en memoria, nunca en URL ni almacenamiento web. */
export interface PassengerSession {
  accessToken: string;
  expiresAt: number;
}
