import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CollectionGroupDeposits } from '../../services/collection-group-deposits';
import type { GroupDepositState } from '../../interfaces/group-deposit.interface';
import { GroupDepositPage } from './group-deposit.page';

describe('GroupDepositPage', () => {
  const api = { create: vi.fn(), get: vi.fn() };
  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      imports: [GroupDepositPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: 'trip-1' }),
              queryParamMap: convertToParamMap({}),
            },
          },
        },
        { provide: CollectionGroupDeposits, useValue: api },
      ],
    });
  });

  it('no registra sin confirmacion explicita', async () => {
    const fixture = TestBed.createComponent(GroupDepositPage);
    await fixture.whenStable();
    (fixture.nativeElement.querySelector('button[type=submit]') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(api.create).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('movimiento bancario real');
    expect(fixture.nativeElement.textContent).toContain('Este campo es obligatorio.');
    expect(fixture.nativeElement.textContent).toContain(
      'número o código con que el banco identifica la transferencia',
    );
    expect(fixture.nativeElement.querySelector('p-datepicker')).not.toBeNull();
  });

  it('congela la misma solicitud cuando la respuesta es incierta', async () => {
    api.create.mockReturnValueOnce(throwError(() => new Error('timeout')));
    const fixture = TestBed.createComponent(GroupDepositPage);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const component = fixture.componentInstance as unknown as {
      form: { setValue(value: unknown): void };
    };
    component.form.setValue({
      amount: 300000,
      effectiveDate: new Date(2026, 9, 5),
      reference: 'CARTOLA-123',
      email: 'cobranza@example.com',
      reason: 'Ingreso verificado en cartola',
      reviewed: true,
    });
    fixture.detectChanges();
    (root.querySelector('button[type=submit]') as HTMLButtonElement).click();
    await fixture.whenStable();
    const first = api.create.mock.calls[0][1];
    expect(first.commandId).toHaveLength(26);
    expect(first.effectiveDate).toBe('2026-10-05');
    api.create.mockReturnValueOnce(
      of({
        id: 'internal',
        tripId: 'trip-1',
        status: 'APPLIED',
        amount: 300000,
        prepared: 2,
        applied: 2,
        expected: 2,
      } satisfies GroupDepositState),
    );
    (root.querySelector('button[type=submit]') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(api.create.mock.calls[1][1]).toEqual(first);
    expect(root.textContent).toContain('El ingreso quedó aplicado una sola vez');
  });
});
