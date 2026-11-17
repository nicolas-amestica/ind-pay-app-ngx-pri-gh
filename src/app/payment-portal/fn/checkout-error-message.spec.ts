import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it } from 'vitest';
import { checkoutErrorMessage } from './checkout-error-message';

describe('checkoutErrorMessage', () => {
  it.each([
    ['PAYMENT_CHECKOUT_DISABLED', 'Los nuevos pagos están deshabilitados temporalmente'],
    [
      'PAYMENT_CHECKOUT_CONFIGURATION_INVALID',
      'Los nuevos pagos no están disponibles por una configuración del servicio',
    ],
    ['PAYMENT_SECURITY_REJECTED', 'No pudimos validar la seguridad'],
  ])('presenta una instrucción segura para %s', (code, expected) => {
    const error = new HttpErrorResponse({ status: 409, error: { data: { error: code } } });
    expect(checkoutErrorMessage(error)).toContain(expected);
  });
});
