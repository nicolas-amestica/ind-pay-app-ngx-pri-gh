import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { DatePicker } from 'primeng/datepicker';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Panel } from 'primeng/panel';
import { Textarea } from 'primeng/textarea';
import { newUlid } from '../../../../shared/fn/new-ulid';
import { PaymentReceipts } from '../../../../shared/payment-receipts/components/payment-receipts';
import type {
  GroupDepositRequest,
  GroupDepositState,
} from '../../interfaces/group-deposit.interface';
import { CollectionGroupDeposits } from '../../services/collection-group-deposits';

@Component({
  selector: 'app-group-deposit',
  imports: [
    CurrencyPipe,
    RouterLink,
    ReactiveFormsModule,
    ButtonDirective,
    Checkbox,
    DatePicker,
    InputNumber,
    InputText,
    Message,
    Panel,
    Textarea,
    PaymentReceipts,
  ],
  templateUrl: './group-deposit.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupDepositPage {
  private readonly api = inject(CollectionGroupDeposits);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly tripId = this.route.snapshot.paramMap.get('id') ?? '';
  private pending: GroupDepositRequest | null = null;
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly result = signal<GroupDepositState | null>(null);
  protected readonly commandId = signal(this.route.snapshot.queryParamMap.get('operacion') ?? '');
  protected readonly hasPendingRequest = signal(false);
  protected readonly maxEffectiveDate = new Date();
  protected readonly form = new FormGroup({
    amount: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    reference: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(150)],
    }),
    effectiveDate: new FormControl<Date | null>(null, Validators.required),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(254)],
    }),
    reason: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(500)],
    }),
    reviewed: new FormControl(false, { nonNullable: true, validators: [Validators.requiredTrue] }),
  });

  constructor() {
    if (!this.tripId) {
      this.error.set('No se identificó la gira.');
      return;
    }
    if (this.commandId()) this.recover();
  }

  protected save(): void {
    if (this.busy() || this.result()?.status === 'APPLIED') return;
    this.error.set('');
    if (!this.pending) {
      this.form.markAllAsTouched();
      const value = this.form.getRawValue();
      const amount = value.amount;
      if (this.form.invalid || amount === null || !Number.isSafeInteger(amount) || amount <= 0) {
        this.error.set('Revisa los datos y confirma que verificaste el movimiento bancario real.');
        return;
      }
      const commandId = this.commandId() || newUlid();
      this.commandId.set(commandId);
      this.pending = {
        commandId,
        amount,
        reference: value.reference.trim(),
        effectiveDate: this.dateValue(value.effectiveDate),
        email: value.email.trim(),
        reason: value.reason.trim(),
      };
      this.hasPendingRequest.set(true);
      this.form.disable();
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { operacion: commandId },
        replaceUrl: true,
      });
    }
    const pending = this.pending;
    if (!pending) return;
    this.busy.set(true);
    this.api
      .create(this.tripId, pending)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (state) => this.accept(state),
        error: () => {
          this.busy.set(false);
          this.error.set(
            'No se confirmó el resultado. Reintenta esta misma operación; no cambies la referencia ni el monto.',
          );
        },
      });
  }

  protected recover(): void {
    if (!this.tripId || !this.commandId() || this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    this.api
      .get(this.tripId, this.commandId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (state) => this.accept(state),
        error: () => {
          this.busy.set(false);
          this.error.set(
            'No se encontró un resultado confirmado. Si estabas registrando un abono, reintenta con los mismos datos.',
          );
        },
      });
  }

  private accept(state: GroupDepositState): void {
    this.result.set(state);
    this.busy.set(false);
    if (state.status === 'APPLIED') {
      this.pending = null;
      this.hasPendingRequest.set(false);
      this.form.disable();
    }
  }

  private dateValue(value: Date | null): string {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) return '';
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  }
}
