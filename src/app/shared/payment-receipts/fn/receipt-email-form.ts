import { FormControl, FormGroup, Validators } from '@angular/forms';

export function receiptEmailForm() {
  return new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(254)],
    }),
  });
}
