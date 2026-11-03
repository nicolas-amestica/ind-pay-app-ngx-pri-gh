import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { pdf417 } from '@bwip-js/browser';
import { ButtonDirective } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { InputNumber } from 'primeng/inputnumber';
import { Message } from 'primeng/message';
import { Panel } from 'primeng/panel';
import { finalize } from 'rxjs';
import type { TaxDocumentVerification } from '../../interfaces/tax-document-verification.interface';
import { PublicPayments } from '../../services/public-payments';

@Component({
  selector: 'app-tax-document-verification',
  imports: [
    ButtonDirective,
    CurrencyPipe,
    DatePicker,
    DatePipe,
    InputNumber,
    Message,
    Panel,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './tax-document-verification.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaxDocumentVerificationPage {
  private readonly api = inject(PublicPayments);
  private readonly destroyRef = inject(DestroyRef);
  private readonly barcode = viewChild<ElementRef<HTMLCanvasElement>>('barcode');
  protected readonly busy = signal(false);
  protected readonly result = signal<TaxDocumentVerification | null>(null);
  protected readonly today = new Date();
  protected readonly form = new FormGroup({
    folio: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    issueDate: new FormControl<Date | null>(null, Validators.required),
    amount: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
  });

  constructor() {
    effect(() => {
      const document = this.result();
      const canvas = this.barcode()?.nativeElement;
      if (!document?.authentic || !document.ted || !canvas) return;
      pdf417(canvas, { bcid: 'pdf417', text: document.ted, scale: 2, includetext: false });
    });
  }

  protected verify(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.busy()) return;
    const { folio, issueDate, amount } = this.form.getRawValue();
    if (folio === null || issueDate === null || amount === null) return;
    this.busy.set(true);
    this.result.set(null);
    this.api
      .verifyTaxDocument(folio, this.formatDate(issueDate), amount)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.busy.set(false)),
      )
      .subscribe({
        next: (result) => this.result.set(result),
        error: () => this.result.set({ authentic: false }),
      });
  }

  protected print(): void {
    window.print();
  }

  private formatDate(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
