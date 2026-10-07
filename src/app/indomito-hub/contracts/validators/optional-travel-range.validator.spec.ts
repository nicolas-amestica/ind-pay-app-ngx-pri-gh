import { FormControl } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { optionalTravelRangeValidator } from './optional-travel-range.validator';

describe('optionalTravelRangeValidator', () => {
  it.each([null, [], [new Date(2027, 0, 10), new Date(2027, 0, 14)]])('permite %s', (value) => {
    expect(optionalTravelRangeValidator(new FormControl(value))).toBeNull();
  });
  it.each([
    [new Date(2027, 0, 10)],
    [new Date(2027, 0, 10), null],
    [new Date(2027, 0, 14), new Date(2027, 0, 10)],
    [new Date('invalid'), new Date()],
    ['2027-01-10', '2027-01-14'],
  ])('rechaza el rango incompleto o inválido %s', (...value) => {
    expect(optionalTravelRangeValidator(new FormControl(value))).toEqual({ travelRange: true });
  });
});
