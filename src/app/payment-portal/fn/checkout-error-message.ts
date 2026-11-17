import { HttpErrorResponse } from '@angular/common/http';

interface ApiFailure {
  data?: { error?: string };
}

export function checkoutErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const code = (error.error as ApiFailure | null)?.data?.error;
    if (code === 'PAYMENT_SECURITY_REJECTED') {
      return 'No pudimos validar la seguridad de este navegador. Desactiva temporalmente VPN, bloqueadores o la retransmisión privada y vuelve a intentar.';
    }
    if (code === 'PAYMENT_SECURITY_UNAVAILABLE') {
      return 'La validación de seguridad no está disponible temporalmente. Intenta nuevamente en unos minutos.';
    }
    if (code === 'PAYMENT_CHECKOUT_DISABLED') {
      return 'Los nuevos pagos están deshabilitados temporalmente. Si ya iniciaste uno, consulta ese mismo intento y no vuelvas a pagar.';
    }
    if (code === 'PAYMENT_CHECKOUT_CONFIGURATION_INVALID') {
      return 'Los nuevos pagos no están disponibles por una configuración del servicio. La consulta y el seguimiento de intentos existentes continúan disponibles.';
    }
  }
  return 'No se pudo obtener el resultado. Reintenta esta misma solicitud; no se cambiará su referencia ni el correo.';
}
