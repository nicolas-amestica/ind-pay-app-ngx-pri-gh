import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { FormGroup } from '@angular/forms';
import { of, throwError, type Observable } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TaxDocumentVerification } from '../../interfaces/tax-document-verification.interface';
import { PublicPayments } from '../../services/public-payments';
import { TaxDocumentVerificationPage } from './tax-document-verification.page';

describe('TaxDocumentVerificationPage', () => {
  const api = { verifyTaxDocument: vi.fn() };

  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      imports: [TaxDocumentVerificationPage],
      providers: [{ provide: PublicPayments, useValue: api }, provideRouter([])],
    });
  });

  async function verifyWith(response: Observable<TaxDocumentVerification>) {
    api.verifyTaxDocument.mockReturnValue(response);
    const fixture = TestBed.createComponent(TaxDocumentVerificationPage);
    const page = fixture.componentInstance as unknown as {
      form: FormGroup;
      verify(): void;
    };
    page.form.setValue({ folio: 381, issueDate: new Date(2026, 10, 2), amount: 29800 });
    page.verify();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('muestra emisión y aceptación SII como estados distintos', async () => {
    const root = await verifyWith(
      of({
        authentic: true,
        queryStatus: 'FOUND' as const,
        issuedByIndomito: true,
        siiStatus: 'PENDING' as const,
        folio: 381,
        issueDate: '2026-11-02',
        totalAmount: 29800,
        items: [],
      }),
    );
    expect(root.textContent).toContain('fue emitida por Indómito');
    expect(root.textContent).toContain('aceptación aún está pendiente');
    expect(root.textContent).not.toContain('El SII informó el documento como aceptado');
  });

  it('informa rechazo sin invalidar el pago', async () => {
    const root = await verifyWith(
      of({
        authentic: true,
        queryStatus: 'FOUND' as const,
        issuedByIndomito: true,
        siiStatus: 'REJECTED' as const,
        folio: 381,
        issueDate: '2026-11-02',
        totalAmount: 29800,
        replacementPending: true,
        items: [],
      }),
    );
    expect(root.textContent).toContain('El SII rechazó este documento');
    expect(root.textContent).toContain('no cambia a impago');
    expect(root.textContent).toContain('reemisión en preparación');
  });

  it('distingue una consulta indisponible de un documento inexistente', async () => {
    api.verifyTaxDocument.mockReturnValue(throwError(() => new Error('offline')));
    const fixture = TestBed.createComponent(TaxDocumentVerificationPage);
    const page = fixture.componentInstance as unknown as { form: FormGroup; verify(): void };
    page.form.setValue({ folio: 381, issueDate: new Date(2026, 10, 2), amount: 29800 });
    page.verify();
    await fixture.whenStable();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'No fue posible consultar el registro',
    );
  });
});
