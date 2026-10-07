import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContractSetupPage } from './contract-setup.page';
import { CollectionApi } from '../../services/collection-api';
import type {
  CollectionSetup,
  CollectionSetupResult,
} from '../../interfaces/collection-setup.interface';

describe('ContractSetupPage', () => {
  const plan: CollectionSetup = {
    status: 'NOT_STARTED',
    freeParticipantIds: [],
    contractId: 'contract-1',
    contractVersion: 3,
    tripName: 'Gira de prueba',
    departureDate: '',
    freeCount: 1,
    pricePerPayer: 900000,
    depositAgreed: 100000,
    dueDates: ['2027-01-31', '2027-02-28'],
    daysBeforeDeparture: 15,
    policyVersion: 2,
    members: [
      { id: 'a', name: 'Pasajero A', dni: '11111111-1' },
      { id: 'b', name: 'Pasajero B', dni: '22222222-2' },
    ],
  };
  const api = { getSetup: vi.fn(), confirmSetup: vi.fn() };
  beforeEach(() => {
    vi.resetAllMocks();
    api.getSetup.mockReturnValue(of(plan));
    TestBed.configureTestingModule({
      imports: [ContractSetupPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id: 'contract-1' })) },
        },
        { provide: CollectionApi, useValue: api },
      ],
    });
  });
  async function mount() {
    const fixture = TestBed.createComponent(ContractSetupPage);
    await fixture.whenStable();
    return fixture;
  }
  it('muestra condiciones sin generar deudas al abrir', async () => {
    const fixture = await mount();
    expect(fixture.nativeElement.textContent).toContain('Fecha por definir');
    expect(fixture.nativeElement.textContent).toContain('Abono grupal pactado, no recibido');
    expect(api.confirmSetup).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('button').disabled).toBe(true);
  });
  it('exige liberados y revisión; bloquea confirmaciones simultáneas', async () => {
    const result = new Subject<CollectionSetupResult>();
    api.confirmSetup.mockReturnValue(result);
    const fixture = await mount();
    const inputs = fixture.nativeElement.querySelectorAll(
      'input[type=checkbox]',
    ) as NodeListOf<HTMLInputElement>;
    inputs[0].click();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('button').disabled).toBe(true);
    inputs[2].click();
    await fixture.whenStable();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    await fixture.whenStable();
    button.click();
    expect(api.confirmSetup).toHaveBeenCalledTimes(1);
    expect(api.confirmSetup).toHaveBeenCalledWith('contract-1', {
      contractVersion: 3,
      freeParticipantIds: ['a'],
    });
    result.next({ tripId: 'contract-1', status: 'ACTIVE', participantCount: 2, freeCount: 1 });
    result.complete();
    await fixture.whenStable();
    expect(button.disabled).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('ni inicia un cobro bancario');
  });
  it('un error de lectura no habilita confirmación', async () => {
    api.getSetup.mockReturnValue(throwError(() => new Error('forbidden')));
    const fixture = await mount();
    expect(fixture.nativeElement.textContent).toContain('No se pudo completar');
    expect(api.confirmSetup).not.toHaveBeenCalled();
  });
  it('recupera una puesta en marcha activa sin permitir otra selección', async () => {
    api.getSetup.mockReturnValue(of({ ...plan, status: 'ACTIVE', freeParticipantIds: ['b'] }));
    const fixture = await mount();
    const inputs = fixture.nativeElement.querySelectorAll(
      'input[type=checkbox]',
    ) as NodeListOf<HTMLInputElement>;
    expect(inputs[1].checked).toBe(true);
    expect(inputs[0].disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('button').disabled).toBe(true);
    expect(api.confirmSetup).not.toHaveBeenCalled();
  });
});
