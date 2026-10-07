import { describe, expect, it } from 'vitest';
import { FormControl, FormGroup } from '@angular/forms';
import { installmentDayOptions } from './installment-calendar';
import { installmentStartValidator } from '../validators/installment-start.validator';

describe('calendario de cuotas', () => {
  it.each([
    [2027, '02', 28],
    [2028, '02', 29],
    [2100, '02', 28],
    [2000, '02', 29],
    [2027, '04', 30],
    [2027, '01', 31],
  ])('ofrece los días válidos de %s %s', (year, month, days) => {
    expect(installmentDayOptions(Number(year), String(month))).toEqual(
      Array.from({ length: Number(days) }, (_, i) => i + 1),
    );
  });
  it('no inventa un año para los contratos históricos', () => {
    expect(installmentDayOptions(null, '02')).toEqual([]);
    expect(installmentDayOptions(2027, 'Febrero')).toHaveLength(28);
  });
  it('rechaza un día que dejó de existir al cambiar el mes o año', () => {
    const form = new FormGroup(
      {
        startYear: new FormControl(2028),
        startMonth: new FormControl('02'),
        startDay: new FormControl(29),
      },
      { validators: installmentStartValidator },
    );
    expect(form.valid).toBe(true);
    form.controls.startYear.setValue(2027);
    expect(form.hasError('installmentStart')).toBe(true);
    form.controls.startDay.setValue(28);
    expect(form.valid).toBe(true);
  });
});
