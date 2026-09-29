import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Installment, PaymentAttempt, PaymentReceipt } from '../interfaces/payment.interface';

/** Cliente del portal; no adjunta credenciales del administrador de Indómito Hub. */
@Injectable({ providedIn: 'root' })
export class PaymentApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/pagos';
  access(rut: string) {
    return this.http.post<{ challengeId: string; message: string; demoCode: string }>(
      `${this.base}/accesos`,
      { rut },
    );
  }
  login(challengeId: string, code: string) {
    return this.http.post(`${this.base}/sesiones`, { challengeId, code });
  }
  logout() {
    return this.http.delete(`${this.base}/sesiones`);
  }
  installments() {
    return this.http.get<Installment[]>(`${this.base}/cuotas`);
  }
  create(installmentId: string, key: string) {
    return this.http.post<PaymentAttempt>(
      `${this.base}/intentos`,
      { installmentId },
      { headers: new HttpHeaders({ 'Idempotency-Key': key }) },
    );
  }
  simulate(id: string, outcome: 'CONFIRMED' | 'FAILED') {
    return this.http.post<PaymentAttempt>(
      `${this.base}/intentos/${encodeURIComponent(id)}/simular`,
      { outcome },
    );
  }
  receipt(id: string) {
    return this.http.get<PaymentReceipt>(`${this.base}/comprobantes/${encodeURIComponent(id)}`);
  }
}
