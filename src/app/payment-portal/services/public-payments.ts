import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, type Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { PublicAccount } from '../interfaces/public-account.interface';
import type { PortalAttempt } from '../interfaces/portal-attempt.interface';
import type { ReceiptVerification } from '../interfaces/receipt-verification.interface';

@Injectable({ providedIn: 'root' })
export class PublicPayments {
  private readonly http = inject(HttpClient);

  /** Firma de sesión exclusiva del portal; no adjunta el token administrativo. */
  checkout(email: string, requestId: string, token: string): Observable<PortalAttempt> {
    return this.http
      .post<{ data: PortalAttempt }>(
        `${environment.apiUrl}/pagos/portal/checkout`,
        { email },
        {
          headers: { Authorization: `Bearer ${token}`, 'Idempotency-Key': requestId },
        },
      )
      .pipe(map(({ data }) => data));
  }

  attempt(id: string, token: string): Observable<PortalAttempt> {
    return this.http
      .get<{ data: PortalAttempt }>(
        `${environment.apiUrl}/pagos/portal/intentos/${encodeURIComponent(id)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      .pipe(map(({ data }) => data));
  }

  account(token: string): Observable<PublicAccount> {
    return this.http
      .get<{ data: PublicAccount }>(`${environment.apiUrl}/pagos/portal/cuenta`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .pipe(map(({ data }) => data));
  }

  verifyReceipt(code: string): Observable<ReceiptVerification> {
    return this.http
      .post<{ data: ReceiptVerification }>(
        `${environment.apiUrl}/pagos/comprobantes/verificaciones`,
        { code: code.trim().toUpperCase() },
      )
      .pipe(map(({ data }) => data));
  }

  resendReceipt(
    attemptId: string,
    email: string,
    commandId: string,
    token: string,
  ): Observable<void> {
    return this.http
      .post<{ data: { status: 'QUEUED' } }>(
        `${environment.apiUrl}/pagos/portal/intentos/${encodeURIComponent(attemptId)}/comprobante/reenvios`,
        { email, commandId },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      .pipe(map(() => undefined));
  }

  /** Los datos viajan en el cuerpo, nunca en URL, almacenamiento web ni credenciales administrativas. */
  lookup(rut: string, tripCode: string): Observable<PublicAccount> {
    return this.http
      .post<{ data: PublicAccount }>(`${environment.apiUrl}/pagos/consultas`, {
        rut: rut.trim(),
        tripCode: tripCode.trim().toUpperCase(),
      })
      .pipe(map(({ data }) => data));
  }
}
