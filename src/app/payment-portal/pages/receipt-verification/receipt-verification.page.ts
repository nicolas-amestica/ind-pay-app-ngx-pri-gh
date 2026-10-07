import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Panel } from 'primeng/panel';
import { finalize } from 'rxjs';
import type { ReceiptVerification } from '../../interfaces/receipt-verification.interface';
import { PublicPayments } from '../../services/public-payments';

@Component({
  selector: 'app-receipt-verification',
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule, RouterLink, ButtonDirective, InputText, Message, Panel],
  templateUrl: './receipt-verification.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceiptVerificationPage {
  private readonly api = inject(PublicPayments);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly busy = signal(false);
  protected readonly result = signal<ReceiptVerification | null>(null);
  protected readonly code = new FormControl(window.location.hash.slice(1).toUpperCase(), {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/^[0-7][0-9A-HJKMNP-TV-Z]{25}$/)],
  });

  constructor() {
    if (this.code.valid) this.verify();
  }

  protected verify(): void {
    if (this.busy()) return;
    this.code.markAsTouched();
    if (this.code.invalid) return;
    this.busy.set(true);
    this.result.set(null);
    this.api.verifyReceipt(this.code.value).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.busy.set(false)),
    ).subscribe({
      next: (result) => this.result.set(result),
      error: () => this.result.set({ authentic: false }),
    });
  }
}
