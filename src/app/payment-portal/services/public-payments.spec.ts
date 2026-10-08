import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { PublicPayments } from './public-payments';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('PublicPayments', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }),
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it('crea un intento sin enviar monto, RUT ni cuenta desde el navegador', () => {
    const result = { id: 'attempt', status: 'RECONCILIATION_REQUIRED' };
    TestBed.inject(PublicPayments)
      .checkout('family@example.com', 'request-id', 'passenger-token', 'recaptcha-token')
      .subscribe((value) => expect(value).toEqual(result));
    const request = TestBed.inject(HttpTestingController).expectOne(
      `${environment.apiUrl}/pagos/portal/checkout`,
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: 'family@example.com',
      recaptchaToken: 'recaptcha-token',
    });
    expect(request.request.headers.get('Authorization')).toBe('Bearer passenger-token');
    expect(request.request.headers.get('Idempotency-Key')).toBe('request-id');
    expect(request.request.withCredentials).toBe(false);
    request.flush({ data: result });
  });
  it('consulta el intento sin poner la sesión en la URL', () => {
    TestBed.inject(PublicPayments).attempt('attempt', 'passenger-token').subscribe();
    const request = TestBed.inject(HttpTestingController).expectOne(
      `${environment.apiUrl}/pagos/portal/intentos/attempt`,
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('Authorization')).toBe('Bearer passenger-token');
    expect(request.request.body).toBeNull();
    expect(request.request.withCredentials).toBe(false);
    request.flush({ data: { id: 'attempt', status: 'CONFIRMED' } });
  });
  it('reenvía desde el intento sin exponer un identificador de comprobante', () => {
    TestBed.inject(PublicPayments)
      .resendReceipt('attempt', 'other@example.com', 'command', 'passenger-token')
      .subscribe();
    const request = TestBed.inject(HttpTestingController).expectOne(
      `${environment.apiUrl}/pagos/portal/intentos/attempt/comprobante/reenvios`,
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ email: 'other@example.com', commandId: 'command' });
    expect(request.request.headers.get('Authorization')).toBe('Bearer passenger-token');
    request.flush({ data: { status: 'QUEUED' } });
  });
  it('envía el RUT solo en el cuerpo y no adjunta credenciales administrativas', () => {
    TestBed.inject(PublicPayments).lookup(' 12345678-5 ', ' ab23cd ').subscribe();
    const request = TestBed.inject(HttpTestingController).expectOne(
      `${environment.apiUrl}/pagos/consultas`,
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ rut: '12345678-5', tripCode: 'AB23CD' });
    expect(request.request.headers.has('Authorization')).toBe(false);
    expect(request.request.withCredentials).toBe(false);
    request.flush({ data: { active: true, free: true, checkoutEnabled: false, installments: [] } });
  });
});
