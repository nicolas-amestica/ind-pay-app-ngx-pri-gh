import type { ValidatorFn } from '@angular/forms';
import { isValidChileanRut } from '../../shared/validators/document-id.validator';

export const passengerRutValidator: ValidatorFn = (control) =>
  typeof control.value === 'string' && isValidChileanRut(control.value) ? null : { rut: true };

export const tripCodeValidator: ValidatorFn = (control) =>
  typeof control.value === 'string' &&
  /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/.test(control.value.trim().toUpperCase())
    ? null
    : { tripCode: true };
