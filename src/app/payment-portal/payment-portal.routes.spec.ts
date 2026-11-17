import { describe, expect, it } from 'vitest';
import { PAYMENT_PORTAL_ROUTES } from './payment-portal.routes';
import { PAYMENT_PORTAL_ROUTES as PRODUCTION_PAYMENT_PORTAL_ROUTES } from './payment-portal.routes.production';

describe('PAYMENT_PORTAL_ROUTES', () => {
  it('no publica rutas administrativas o de tesorería', () => {
    const publicPaths = PAYMENT_PORTAL_ROUTES.map((route) => route.path);

    expect(publicPaths).not.toContain('tesoreria');
    expect(publicPaths).not.toContain('cobranza');
    expect(publicPaths).toContain('verificar-comprobante');
    expect(publicPaths).toContain('consultar-boleta');
    expect(publicPaths).toContain('informacion-legal');
    expect(publicPaths).toContain('privacidad');
    expect(publicPaths).toContain('retorno');
    expect(publicPaths).not.toContain('administracion');
  });

  it('publica información legal y privacidad también en producción', () => {
    const publicPaths = PRODUCTION_PAYMENT_PORTAL_ROUTES.map((route) => route.path);

    expect(publicPaths).toContain('informacion-legal');
    expect(publicPaths).toContain('privacidad');
    expect(publicPaths).not.toContain('pruebas-khipu');
  });
});
