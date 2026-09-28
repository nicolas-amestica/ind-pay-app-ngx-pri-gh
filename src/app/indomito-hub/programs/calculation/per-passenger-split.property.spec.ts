import fc from 'fast-check';

import { arbCalculationInput } from './__arbitraries__';
import { calculateProgram, derivePayingPassengers } from './calculation-engine';
import { perPassengerPrice } from './per-passenger-split';
import { ceil } from './rounding';

const NUM_RUNS = 100;

describe('perPassengerPrice', () => {
  it('Feature: program-form, Property 12: Los pagantes recuperan el monto completo', () => {
    fc.assert(
      fc.property(arbCalculationInput(), (input) => {
        const result = calculateProgram(input);
        const amount = result.totals.totalCLP;
        const payingPassengers = derivePayingPassengers(
          input.schedule.totalPassengers,
          input.schedule.freePassengers,
        );
        const price = perPassengerPrice(amount, payingPassengers);

        expect(price * payingPassengers).toBeGreaterThanOrEqual(amount);
      }),
      { numRuns: NUM_RUNS },
    );
  });

  it('Feature: program-form, Property 13: El precio es el monto dividido entre pagantes', () => {
    fc.assert(
      fc.property(arbCalculationInput(), (input) => {
        const result = calculateProgram(input);
        const amount = result.totals.totalCLP;
        const payingPassengers = derivePayingPassengers(
          input.schedule.totalPassengers,
          input.schedule.freePassengers,
        );

        expect(perPassengerPrice(amount, payingPassengers)).toBe(ceil(amount / payingPassengers));
      }),
      { numRuns: NUM_RUNS },
    );
  });
});
