import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import type { KhipuDevAttempt, KhipuDevConfiguration } from '../interfaces/khipu-dev.interface';

@Injectable({ providedIn: 'root' })
export class KhipuDev {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/khipu-dev';
  private readonly headers = { 'X-Payment-Dev-Client': 'local' };

  configuration() {
    return this.http
      .get<{ data: KhipuDevConfiguration }>(`${this.base}/configuracion`, { headers: this.headers })
      .pipe(map((result) => result.data));
  }
  create(id: string) {
    return this.http
      .post<{ data: KhipuDevAttempt }>(
        `${this.base}/pruebas`,
        {},
        { headers: { ...this.headers, 'Idempotency-Key': id } },
      )
      .pipe(map((result) => result.data));
  }
  read(id: string) {
    return this.http
      .get<{ data: KhipuDevAttempt }>(`${this.base}/pruebas/${encodeURIComponent(id)}`, {
        headers: this.headers,
      })
      .pipe(map((result) => result.data));
  }
  verify(id: string) {
    return this.http
      .post<{ data: KhipuDevAttempt }>(
        `${this.base}/pruebas/${encodeURIComponent(id)}/verificar`,
        {},
        { headers: this.headers },
      )
      .pipe(map((result) => result.data));
  }
}
