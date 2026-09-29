import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { KhipuDevPage } from './khipu-dev.page';
import { KhipuDev } from '../services/khipu-dev';
import { ThemeService } from '../../core/theme/theme.service';

describe('KhipuDevPage', () => {
  const api = {
    configuration: vi.fn(),
    create: vi.fn(),
    read: vi.fn(),
    verify: vi.fn(),
  };
  beforeEach(() => {
    localStorage.removeItem('indomito-khipu-dev-attempt');
    vi.resetAllMocks();
    api.configuration.mockReturnValue(
      of({ mode: 'khipu-development', amount: 20000, currency: 'CLP', testBankAvailable: true }),
    );
    TestBed.configureTestingModule({
      imports: [KhipuDevPage],
      providers: [
        provideRouter([]),
        { provide: KhipuDev, useValue: api },
        { provide: ThemeService, useValue: { label: () => 'Cambiar tema', toggle: vi.fn() } },
      ],
    });
  });
  afterEach(() => localStorage.removeItem('indomito-khipu-dev-attempt'));
  async function mount() {
    const fixture = TestBed.createComponent(KhipuDevPage);
    await fixture.whenStable();
    return fixture;
  }
  it('consulta configuración sin crear pagos automáticamente', async () => {
    const fixture = await mount();
    expect(fixture.nativeElement.textContent).toContain('DemoBank disponible');
    expect(api.create).not.toHaveBeenCalled();
  });
  it('conserva el ID ante fallo y reintenta sin generar otro', async () => {
    api.create.mockReturnValue(throwError(() => new Error('network')));
    const fixture = await mount();
    const button = [...fixture.nativeElement.querySelectorAll('button')].find(
      (item: HTMLButtonElement) => item.textContent?.includes('Crear intento'),
    ) as HTMLButtonElement;
    button.click();
    await fixture.whenStable();
    const id = localStorage.getItem('indomito-khipu-dev-attempt');
    expect(id).toHaveLength(26);
    expect(api.create).toHaveBeenLastCalledWith(id);
    button.click();
    await fixture.whenStable();
    expect(api.create).toHaveBeenCalledTimes(2);
    expect(api.create).toHaveBeenLastCalledWith(id);
  });
  it('recupera el intento guardado y no habilita crear otro', async () => {
    const id = '01K00000000000000000000000';
    localStorage.setItem('indomito-khipu-dev-attempt', id);
    api.read.mockReturnValue(
      of({ id, amount: 20000, status: 'PENDING', paymentUrl: 'https://evil.example' }),
    );
    const fixture = await mount();
    expect(api.read).toHaveBeenCalledWith(id);
    expect(api.create).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).not.toContain('Crear intento de prueba');
    expect(fixture.nativeElement.querySelector('a[target="_blank"]')).toBeNull();
  });
});
