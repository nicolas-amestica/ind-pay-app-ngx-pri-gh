import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PaymentReceipts } from './payment-receipts';
import { ReceiptApi } from '../services/receipt-api';
import type { ReceiptPage } from '../interfaces/receipt.interface';

describe('PaymentReceipts', () => {
  const api = { list: vi.fn(), download: vi.fn(), resend: vi.fn() };
  const receipt = { id: 'receipt-1', amount: 20000, effectiveDate: '2026-10-01', review: false };
  beforeEach(() => {
    vi.resetAllMocks();
    api.list.mockReturnValue(of({ items: [receipt] }));
    TestBed.configureTestingModule({
      imports: [PaymentReceipts],
      providers: [{ provide: ReceiptApi, useValue: api }],
    });
  });
  afterEach(() => vi.useRealTimers());
  async function mount(accountId = 'account-1') {
    const fixture = TestBed.createComponent(PaymentReceipts);
    fixture.componentRef.setInput('accountId', accountId);
    await fixture.whenStable();
    return fixture;
  }
  function click(root: HTMLElement, label: string) {
    const button = Array.from(root.querySelectorAll('button')).find((b) =>
      b.textContent?.includes(label),
    );
    expect(button).toBeDefined();
    button!.click();
  }
  it('consulta solo bajo solicitud y pagina dentro de la misma cuenta', async () => {
    api.list.mockReturnValueOnce(of({ items: [receipt], nextCursor: 'cursor' }));
    const f = await mount();
    expect(api.list).not.toHaveBeenCalled();
    click(f.nativeElement, 'Consultar');
    await f.whenStable();
    expect(api.list).toHaveBeenLastCalledWith({ accountId: 'account-1' }, '');
    api.list.mockReturnValue(of({ items: [{ ...receipt, id: 'receipt-2' }] }));
    click(f.nativeElement, 'Ver más');
    await f.whenStable();
    expect(api.list).toHaveBeenLastCalledWith({ accountId: 'account-1' }, 'cursor');
    expect(f.nativeElement.querySelectorAll('article')).toHaveLength(2);
  });
  it('valida correo, bloquea doble envío y reintenta la misma solicitud', async () => {
    const f = await mount();
    click(f.nativeElement, 'Consultar');
    await f.whenStable();
    click(f.nativeElement, 'Reenviar este');
    await f.whenStable();
    const submit = () =>
      f.nativeElement
        .querySelector('form')
        .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    submit();
    await f.whenStable();
    expect(api.resend).not.toHaveBeenCalled();
    const email = f.nativeElement.querySelector('input') as HTMLInputElement;
    email.value = 'new@example.test';
    email.dispatchEvent(new Event('input'));
    const pending = new Subject<{ status: string; deliveryId: string }>();
    api.resend.mockReturnValue(pending);
    submit();
    submit();
    await f.whenStable();
    expect(api.resend).toHaveBeenCalledTimes(1);
    const request = api.resend.mock.calls[0][2];
    expect(request.email).toBe('new@example.test');
    expect(request.commandId).toMatch(/^[0-7][0-9A-HJKMNP-TV-Z]{25}$/);
    pending.error(new Error('lost response'));
    await f.whenStable();
    expect(email.disabled).toBe(true);
    api.resend.mockReturnValue(of({ status: 'QUEUED', deliveryId: 'delivery' }));
    submit();
    await f.whenStable();
    expect(api.resend.mock.calls[1][2]).toEqual(request);
    expect(f.nativeElement.textContent).toContain('Solicitud registrada');
  });
  it('descarta una respuesta atrasada al cambiar de pasajero', async () => {
    const pending = new Subject<ReceiptPage>();
    api.list.mockReturnValue(pending);
    const f = await mount();
    click(f.nativeElement, 'Consultar');
    f.componentRef.setInput('accountId', 'account-2');
    await f.whenStable();
    pending.next({ items: [receipt] });
    await f.whenStable();
    expect(f.nativeElement.textContent).not.toContain('receipt-1');
    expect(f.nativeElement.querySelectorAll('article')).toHaveLength(0);
  });
  it('no consulta sin una cuenta o gira administrativa', async () => {
    const f = await mount('');
    click(f.nativeElement, 'Consultar');
    await f.whenStable();
    expect(api.list).not.toHaveBeenCalled();
    expect(f.nativeElement.textContent).toContain('Selecciona una cuenta o gira');
  });
  it('rechaza enlaces externos y borra enlaces válidos después de su vencimiento', async () => {
    const f = await mount();
    click(f.nativeElement, 'Consultar');
    await f.whenStable();
    api.download.mockReturnValue(of({ url: 'https://evil.test/file.pdf', expiresIn: 120 }));
    click(f.nativeElement, 'Preparar');
    await f.whenStable();
    expect(f.nativeElement.querySelector('a')).toBeNull();
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    api.download.mockReturnValue(
      of({
        url: 'https://private.s3.us-east-1.amazonaws.com/receipts/test.pdf?signature=test',
        expiresIn: 2,
      }),
    );
    click(f.nativeElement, 'Preparar');
    await f.whenStable();
    expect(f.nativeElement.querySelector('a')?.getAttribute('rel')).toBe('noopener noreferrer');
    await vi.advanceTimersByTimeAsync(2000);
    await f.whenStable();
    expect(f.nativeElement.querySelector('a')).toBeNull();
  });
});
