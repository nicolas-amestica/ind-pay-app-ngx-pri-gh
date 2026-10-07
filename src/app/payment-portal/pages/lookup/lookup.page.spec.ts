import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LookupPage } from './lookup.page';
import { PublicPayments } from '../../services/public-payments';
import { ThemeService } from '../../../core/theme/theme.service';
import type { PublicAccount } from '../../interfaces/public-account.interface';

describe('LookupPage', () => {
  const api = { lookup: vi.fn(), checkout: vi.fn(), attempt: vi.fn(), account: vi.fn(), resendReceipt: vi.fn() };
  const account: PublicAccount = {
    active: true,
    free: false,
    checkoutEnabled: false,
    installments: [
      {
        number: 1,
        dueDate: '2027-01-31',
        amount: 20000,
        paid: 20000,
        outstanding: 0,
        status: 'PAID',
      },
      {
        number: 2,
        dueDate: '2027-02-28',
        amount: 20000,
        paid: 0,
        outstanding: 20000,
        status: 'PENDING',
      },
      { number: 3, dueDate: '2027-03-31', amount: 0, paid: 0, outstanding: 0, status: 'ADJUSTED' },
    ],
  };
  beforeEach(() => {
    vi.resetAllMocks();
    api.lookup.mockReturnValue(of(account));
    api.account.mockReturnValue(of(account));
    vi.spyOn(window, 'open').mockReturnValue({ closed: false, opener: null, close: vi.fn(), location: { replace: vi.fn() } } as unknown as Window);
    TestBed.configureTestingModule({
      imports: [LookupPage],
      providers: [
        { provide: PublicPayments, useValue: api },
        { provide: ThemeService, useValue: { label: () => 'Cambiar tema', toggle: vi.fn() } },
      ],
    });
  });
  async function mount() {
    const fixture = TestBed.createComponent(LookupPage);
    await fixture.whenStable();
    return fixture;
  }
  function input(root: HTMLElement, selector: string, value: string) {
    const field = root.querySelector(selector) as HTMLInputElement;
    field.value = value;
    field.dispatchEvent(new Event('input'));
  }
  function submit(root: HTMLElement) {
    root
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  }
  async function checkoutScreen(overrides: Partial<PublicAccount> = {}) {
    api.lookup.mockReturnValue(
      of({
        ...account,
        checkoutEnabled: true,
        session: {
          accessToken: 'passenger-session',
          expiresAt: Math.floor(Date.now() / 1000) + 600,
        },
        ...overrides,
      }),
    );
    const fixture = await mount();
    const root = fixture.nativeElement as HTMLElement;
    input(root, '#passenger-rut', '12.345.678-5');
    input(root, '#trip-code', 'AB23CD');
    submit(root);
    await fixture.whenStable();
    return { fixture, root };
  }
  it('exige correo y conserva la misma solicitud al perder la respuesta', async () => {
    const { fixture, root } = await checkoutScreen();
    input(root, '#receipt-email', 'incorrecto');
    submit(root);
    await fixture.whenStable();
    expect(api.checkout).not.toHaveBeenCalled();
    expect(root.textContent).toContain('Ingresa un correo válido');
    const response = new Subject<never>();
    api.checkout.mockReturnValue(response);
    input(root, '#receipt-email', 'familia@example.com');
    submit(root);
    submit(root);
    expect(api.checkout).toHaveBeenCalledTimes(1);
    const original = api.checkout.mock.calls[0];
    expect(original).toEqual([
      'familia@example.com',
      expect.stringMatching(/^[0-9A-HJKMNP-TV-Z]{26}$/),
      'passenger-session',
    ]);
    response.error(new Error('secret-provider-error'));
    await fixture.whenStable();
    expect(root.textContent).not.toContain('secret-provider-error');
    expect((root.querySelector('#receipt-email') as HTMLInputElement).disabled).toBe(true);
    api.checkout.mockReturnValue(of({ id: 'attempt', status: 'RECONCILIATION_REQUIRED' }));
    submit(root);
    await fixture.whenStable();
    expect(api.checkout.mock.calls[1]).toEqual(original);
    expect(root.textContent).toContain('Estamos verificando este intento');
    expect(root.querySelector('a[target="_blank"]')).toBeNull();
  });
  it('consulta la confirmación sin marcar cuotas pagadas ni crear otro cobro', async () => {
    const { fixture, root } = await checkoutScreen();
    api.checkout.mockReturnValue(
      of({
        id: 'attempt',
        status: 'PENDING_PAYMENT',
        paymentUrl: 'https://khipu.com/payment/demo',
      }),
    );
    input(root, '#receipt-email', 'familia@example.com');
    submit(root);
    await fixture.whenStable();
    expect(window.open).toHaveBeenCalledWith('/pago-en-proceso', '_blank');
    expect(root.querySelector('a[target="_blank"]')).toBeNull();
    expect(root.textContent).toContain('Abrir Khipu no confirma');
    api.attempt.mockReturnValue(of({ id: 'attempt', status: 'CONFIRMED' }));
    [...root.querySelectorAll('button')]
      .find((b) => b.textContent?.includes('Consultar estado'))!
      .click();
    await fixture.whenStable();
    expect(api.attempt).toHaveBeenCalledWith('attempt', 'passenger-session');
    expect(api.checkout).toHaveBeenCalledTimes(1);
    expect(root.querySelector('a[target="_blank"]')).toBeNull();
    expect(root.textContent).toContain('Pago confirmado');
    expect(root.textContent).toContain('Pago confirmado');
  });
  it('ofrece un solo reenvío únicamente mientras permanece la confirmación abierta', async () => {
    const { fixture, root } = await checkoutScreen();
    api.checkout.mockReturnValue(of({ id: 'attempt', status: 'CONFIRMED', receiptReady: true }));
    api.resendReceipt.mockReturnValue(of(undefined));
    input(root, '#receipt-email', 'familia@example.com');
    submit(root);
    await fixture.whenStable();
    expect(root.textContent).toContain('no permite recuperar comprobantes anteriores');
    expect(root.textContent).not.toContain('Descargar');
    input(root, '#resend-receipt-email', 'otro@example.com');
    const resendForm = (root.querySelector('#resend-receipt-email') as HTMLInputElement).closest('form')!;
    resendForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(api.resendReceipt).toHaveBeenCalledWith(
      'attempt',
      'otro@example.com',
      expect.stringMatching(/^[0-9A-HJKMNP-TV-Z]{26}$/),
      'passenger-session',
    );
    expect(root.textContent).toContain('La copia fue solicitada');
    [...root.querySelectorAll('button')].find((b) => b.textContent?.includes('Cerrar consulta'))!.click();
    await fixture.whenStable();
    expect(root.querySelector('#resend-receipt-email')).toBeNull();
  });
  it('no inicia pagos con sesión vencida', async () => {
    const { fixture, root } = await checkoutScreen({
      session: { accessToken: 'expired', expiresAt: 1 },
    });
    input(root, '#receipt-email', 'familia@example.com');
    submit(root);
    await fixture.whenStable();
    expect(api.checkout).not.toHaveBeenCalled();
    expect(root.textContent).toContain('La sesión venció');
  });
  it('recupera revisión cerrada y oculta enlaces aunque la respuesta del intento sea pendiente', async () => {
    api.attempt.mockReturnValue(
      of({ id: 'review', status: 'PENDING_PAYMENT', paymentUrl: 'https://khipu.com/payment/demo' }),
    );
    const { root } = await checkoutScreen({ reviewRequired: true, reviewAttemptId: 'review' });
    expect(api.attempt).toHaveBeenCalledWith('review', 'passenger-session');
    expect(root.textContent).toContain('Hay dinero recibido pendiente de revisión');
    expect(root.querySelector('#receipt-email')).toBeNull();
    expect(root.querySelector('a[target="_blank"]')).toBeNull();
    expect(api.checkout).not.toHaveBeenCalled();
  });
  it('bloquea cuentas históricas en revisión sin referencia recuperable', async () => {
    const { root } = await checkoutScreen({ reviewRequired: true });
    expect(root.textContent).toContain('Los nuevos pagos están bloqueados');
    expect(root.querySelector('#receipt-email')).toBeNull();
    expect(api.attempt).not.toHaveBeenCalled();
    expect(api.checkout).not.toHaveBeenCalled();
  });
  it('recupera el intento al volver a ingresar sin volver a crear el pago', async () => {
    api.attempt.mockReturnValue(
      of({
        id: 'existing',
        status: 'PENDING_PAYMENT',
        paymentUrl: 'https://khipu.com/payment/demo',
      }),
    );
    const { fixture, root } = await checkoutScreen({ openAttemptId: 'existing' });
    expect(api.attempt).toHaveBeenCalledWith('existing', 'passenger-session');
    expect(api.checkout).not.toHaveBeenCalled();
    expect(root.querySelector('#receipt-email')).toBeNull();
    expect(root.querySelector('a[target="_blank"]')).not.toBeNull();
    [...root.querySelectorAll('button')]
      .find((b) => b.textContent?.includes('Cerrar consulta'))!
      .click();
    await fixture.whenStable();
    input(root, '#passenger-rut', '12.345.678-5');
    input(root, '#trip-code', 'AB23CD');
    submit(root);
    await fixture.whenStable();
    expect(api.attempt).toHaveBeenCalledTimes(2);
    expect(api.checkout).not.toHaveBeenCalled();
  });
  it('bloquea nuevos cobros si falla la recuperación y permite consultar otra vez', async () => {
    const response = new Subject<never>();
    api.attempt.mockReturnValue(response);
    const { fixture, root } = await checkoutScreen({ openAttemptId: 'existing' });
    expect(root.querySelector('#receipt-email')).toBeNull();
    expect(
      [...root.querySelectorAll('button')].find((b) => b.textContent?.includes('Cerrar consulta'))!
        .disabled,
    ).toBe(true);
    response.error(new Error('internal-error'));
    await fixture.whenStable();
    expect(root.textContent).toContain('No se pudo consultar el estado');
    expect(root.textContent).not.toContain('internal-error');
    expect(root.querySelector('#receipt-email')).toBeNull();
    api.attempt.mockReturnValue(of({ id: 'existing', status: 'CONFIRMED' }));
    [...root.querySelectorAll('button')]
      .find((b) => b.textContent?.includes('Consultar estado'))!
      .click();
    await fixture.whenStable();
    expect(root.textContent).toContain('Pago confirmado');
    expect(api.checkout).not.toHaveBeenCalled();
  });
  it('conserva la consulta del intento aunque el pasajero esté inactivo y el checkout apagado', async () => {
    api.attempt.mockReturnValue(of({ id: 'existing', status: 'RECONCILIATION_REQUIRED' }));
    const { root } = await checkoutScreen({
      openAttemptId: 'existing',
      active: false,
      checkoutEnabled: false,
    });
    expect(root.textContent).toContain('Estado del intento de pago');
    expect(root.querySelector('#receipt-email')).toBeNull();
    expect(api.checkout).not.toHaveBeenCalled();
  });
  it('no presenta enlaces ajenos a Khipu', async () => {
    const { fixture, root } = await checkoutScreen();
    api.checkout.mockReturnValue(
      of({
        id: 'attempt',
        status: 'PENDING_PAYMENT',
        paymentUrl: 'https://khipu.com.attacker.test/pay',
      }),
    );
    input(root, '#receipt-email', 'familia@example.com');
    submit(root);
    await fixture.whenStable();
    expect(root.querySelector('a[target="_blank"]')).toBeNull();
  });
  it('consulta con RUT y código del contrato sin OTP ni pago simulado', async () => {
    const fixture = await mount();
    const root = fixture.nativeElement as HTMLElement;
    expect(api.lookup).not.toHaveBeenCalled();
    input(root, '#passenger-rut', '12.345.678-5');
    input(root, '#trip-code', 'AB23CD');
    submit(root);
    await fixture.whenStable();
    expect(api.lookup).toHaveBeenCalledWith('12.345.678-5', 'AB23CD');
    expect(root.textContent).toContain('Cuotas pagadas');
    expect(root.textContent).toContain('Cuotas regularizadas');
    expect(root.textContent).not.toContain('Pagar en simulador');
    const close = [...root.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Cerrar consulta'),
    )!;
    close.click();
    await fixture.whenStable();
    expect((root.querySelector('#passenger-rut') as HTMLInputElement).value).toBe('');
    expect(root.textContent).not.toContain('Cuotas pagadas');
  });
  it('rechaza un DNI que no es RUT válido y un código incompleto', async () => {
    const fixture = await mount();
    const root = fixture.nativeElement as HTMLElement;
    input(root, '#passenger-rut', '12345678');
    input(root, '#trip-code', 'AB');
    submit(root);
    await fixture.whenStable();
    expect(api.lookup).not.toHaveBeenCalled();
    expect(root.textContent).toContain('Ingresa un RUT válido');
  });
  it('bloquea doble envío y conserva datos ante un error genérico', async () => {
    const pending = new Subject<PublicAccount>();
    api.lookup.mockReturnValue(pending);
    const fixture = await mount();
    const root = fixture.nativeElement as HTMLElement;
    input(root, '#passenger-rut', '12345678-5');
    input(root, '#trip-code', 'AB23CD');
    submit(root);
    submit(root);
    expect(api.lookup).toHaveBeenCalledTimes(1);
    pending.error(new Error('internal account-secret'));
    await fixture.whenStable();
    expect(root.textContent).toContain('No fue posible consultar');
    expect(root.textContent).not.toContain('account-secret');
    expect((root.querySelector('#passenger-rut') as HTMLInputElement).value).toBe('12345678-5');
  });
});
