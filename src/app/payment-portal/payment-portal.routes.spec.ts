import { describe, expect, it } from 'vitest';
import { PAYMENT_PORTAL_ROUTES } from './payment-portal.routes';

describe('PAYMENT_PORTAL_ROUTES', () => {
  it('no publica rutas administrativas o de tesorería', () => {
    const publicPaths = PAYMENT_PORTAL_ROUTES.map((route) => route.path);

    expect(publicPaths).not.toContain('tesoreria');
    expect(publicPaths).not.toContain('cobranza');
    expect(publicPaths).toContain('verificar-comprobante');
    expect(publicPaths).toContain('retorno');
    expect(publicPaths).not.toContain('administracion');
  });
});
