import type { AbstractControl, ValidationErrors } from '@angular/forms';

/** Permite fechas pendientes, pero rechaza rangos parciales o invertidos. */
export function optionalTravelRangeValidator(control: AbstractControl): ValidationErrors | null {
  const value: unknown = control.value;
  if (value == null || (Array.isArray(value) && value.length === 0)) return null;
  if (!Array.isArray(value) || value.length !== 2) return { travelRange: true };
  const [start, end] = value;
  return start instanceof Date &&
    end instanceof Date &&
    Number.isFinite(start.getTime()) &&
    Number.isFinite(end.getTime()) &&
    end >= start
    ? null
    : { travelRange: true };
}
