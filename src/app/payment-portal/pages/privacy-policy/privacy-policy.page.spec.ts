import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { PrivacyPolicyPage } from './privacy-policy.page';

describe('PrivacyPolicyPage', () => {
  it('distingue titulares, finalidades, proveedores, conservación y derechos', async () => {
    TestBed.configureTestingModule({
      imports: [PrivacyPolicyPage],
      providers: [provideRouter([])],
    });
    const fixture = TestBed.createComponent(PrivacyPolicyPage);
    await fixture.whenStable();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    for (const expected of [
      'Pasajeros adultos y menores de edad',
      'Khipu SpA',
      'Google reCAPTCHA Enterprise',
      'Amazon Web Services',
      'SolucionHost SpA',
      'Servicio de Impuestos Internos',
      'eliminación física automática',
      'soporte@girasindomito.cl',
    ]) {
      expect(text).toContain(expected);
    }
    expect(text).toContain('La calidad de representante del grupo no sustituye automáticamente');
  });
});
