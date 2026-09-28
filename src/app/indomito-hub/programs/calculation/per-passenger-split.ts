import { ceil } from './rounding';

/**
 * Calcula el precio individual necesario para recuperar el monto completo.
 *
 * Los pasajeros liberados ocupan los servicios, pero no pagan. Por eso todos
 * los costos del programa, incluidos los fijos, se reparten entre quienes sí
 * pagan. El redondeo hacia arriba evita perder dinero por fracciones de peso.
 */
export function perPassengerPrice(amount: number, payingPassengers: number): number {
  return ceil(amount / Math.max(1, payingPassengers));
}
