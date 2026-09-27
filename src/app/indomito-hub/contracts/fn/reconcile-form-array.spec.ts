import { FormArray, FormControl, FormGroup } from '@angular/forms';

import { reconcileFormArray } from './reconcile-form-array';

interface PersonValue {
  name?: string;
  dni?: string;
}

const personGroup = (value: PersonValue): FormGroup =>
  new FormGroup({
    name: new FormControl(value.name ?? ''),
    dni: new FormControl(value.dni ?? ''),
  });

describe('reconcileFormArray', () => {
  it('conserva las filas enlazadas y agrega los datos nuevos', () => {
    const firstGroup = personGroup({});
    const array = new FormArray([firstGroup]);

    reconcileFormArray(
      array,
      [
        { name: 'Pedro Aguilera', dni: '16915292-6' },
        { name: 'Esteban Osorio', dni: '8058135-1' },
      ],
      personGroup,
    );

    expect(array.at(0)).toBe(firstGroup);
    expect(array.getRawValue()).toEqual([
      { name: 'Pedro Aguilera', dni: '16915292-6' },
      { name: 'Esteban Osorio', dni: '8058135-1' },
    ]);
  });

  it('elimina solo las filas sobrantes y mantiene una fila vacía', () => {
    const firstGroup = personGroup({ name: 'Anterior' });
    const array = new FormArray([firstGroup, personGroup({ name: 'Sobrante' })]);

    reconcileFormArray(array, [], personGroup);

    expect(array).toHaveLength(1);
    expect(array.at(0)).toBe(firstGroup);
    expect(array.getRawValue()).toEqual([{ name: '', dni: '' }]);
  });
});
