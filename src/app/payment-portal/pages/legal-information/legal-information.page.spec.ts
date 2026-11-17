import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { LegalInformationPage } from './legal-information.page';

describe('LegalInformationPage', () => {
  it('publica identidad, contacto y recuperación sin alterar el contrato', async () => {
    TestBed.configureTestingModule({
      imports: [LegalInformationPage],
      providers: [provideRouter([])],
    });
    const fixture = TestBed.createComponent(LegalInformationPage);
    await fixture.whenStable();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Giras Indómito Limitada');
    expect(text).toContain('77.654.796-4');
    expect(text).toContain('pagos@girasindomito.cl');
    expect(text).toContain('+56 9 6366 2893');
    expect(text).toContain('no crea un nuevo contrato');
    expect(text).toContain('30 días hábiles');
    expect(text).toContain('No se crea un nuevo cobro');
  });
});
