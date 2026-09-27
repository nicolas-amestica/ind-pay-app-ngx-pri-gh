import { FormArray, FormGroup } from '@angular/forms';

/**
 * Sincroniza filas dinámicas conservando la identidad de los grupos existentes.
 *
 * Evita que Angular destruya toda la colección y mantiene enlazadas las
 * directivas `formGroupName` cuando llegan datos del servicio o de Excel.
 */
export function reconcileFormArray<T>(
  array: FormArray,
  values: readonly T[],
  build: (value: T) => FormGroup,
): void {
  const nextValues = values.length > 0 ? values : ([{}] as T[]);

  while (array.length > nextValues.length) {
    array.removeAt(array.length - 1, { emitEvent: false });
  }

  nextValues.forEach((value, index) => {
    const nextGroup = build(value);
    const currentGroup = array.at(index);

    if (currentGroup) {
      currentGroup.reset(nextGroup.getRawValue(), { emitEvent: false });
    } else {
      array.push(nextGroup, { emitEvent: false });
    }
  });

  array.updateValueAndValidity();
}
