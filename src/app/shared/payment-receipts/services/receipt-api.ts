import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type {
  ReceiptDeliveryRequest,
  ReceiptPage,
  ReceiptScope,
} from '../interfaces/receipt.interface';

@Injectable({ providedIn: 'root' })
export class ReceiptApi {
  private readonly http = inject(HttpClient);
  resend(scope: ReceiptScope, id: string, request: ReceiptDeliveryRequest) {
    return this.http
      .post<{ data: { status: string; deliveryId: string } }>(
        `${this.url(scope)}/${encodeURIComponent(id)}/reenvios`,
        request,
      )
      .pipe(map(({ data }) => data));
  }
  list(scope: ReceiptScope, cursor = '') {
    return this.http
      .get<{ data: ReceiptPage }>(this.url(scope), {
        params: cursor ? { cursor } : {},
      })
      .pipe(map(({ data }) => data));
  }
  download(scope: ReceiptScope, id: string) {
    return this.http
      .get<{ data: { url: string; expiresIn: number } }>(
        `${this.url(scope)}/${encodeURIComponent(id)}/descarga`,
      )
      .pipe(map(({ data }) => data));
  }
  private url(scope: ReceiptScope): string {
    const owner = scope.tripId
      ? `giras/${encodeURIComponent(scope.tripId)}`
      : scope.accountId
        ? `cuentas/${encodeURIComponent(scope.accountId)}`
        : '';
    return `${environment.apiUrl}/pagos/${owner}/comprobantes`;
  }
}
