import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { TreasuryView } from '../interfaces/treasury.interface';

/** Acceso administrativo exclusivo del entorno de demostración local. */
@Injectable({ providedIn: 'root' })
export class TreasuryApiService {
  private readonly http = inject(HttpClient);
  view(key: string, tripId: string) {
    return this.http.get<TreasuryView>('/api/pagos/tesoreria', {
      headers: { 'X-Local-Admin-Key': key },
      params: { tripId },
    });
  }
  expense(
    key: string,
    body: { tripId: string; category: string; supplier: string; dueDate: string; amount: number },
    idempotencyKey: string,
  ) {
    return this.http.post('/api/pagos/egresos', body, {
      headers: { 'X-Local-Admin-Key': key, 'Idempotency-Key': idempotencyKey },
    });
  }
  pay(key: string, id: string, amount: number, idempotencyKey: string) {
    return this.http.post(
      `/api/pagos/egresos/${encodeURIComponent(id)}/pagar`,
      { amount },
      { headers: { 'X-Local-Admin-Key': key, 'Idempotency-Key': idempotencyKey } },
    );
  }
  settle(key: string, id: string) {
    return this.http.post(
      `/api/pagos/liquidaciones/${encodeURIComponent(id)}`,
      {},
      { headers: { 'X-Local-Admin-Key': key } },
    );
  }
}
