import type { AbstractControl, ValidationErrors } from '@angular/forms';
import { installmentDayOptions } from '../fn/installment-calendar';

/** Rechaza fechas imposibles sin alterar silenciosamente el día pactado. */
export function installmentStartValidator(control: AbstractControl): ValidationErrors | null {
  const year = control.get('startYear')?.value as number | null;
  const month = control.get('startMonth')?.value as string | null;
  const day = control.get('startDay')?.value as number | null;
  if (!year || !month || !day) return null; // Los controles marcan los campos requeridos.
  return installmentDayOptions(year, month).includes(day) ? null : { installmentStart: true };
}
