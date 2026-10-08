import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Panel } from 'primeng/panel';
import { Message } from 'primeng/message';
import { ThemeService } from '../../../core/theme/theme.service';
import { PublicPayments } from '../../services/public-payments';
import { RecaptchaService } from '../../services/recaptcha';
import type { PublicAccount } from '../../interfaces/public-account.interface';
import type { PortalAttempt } from '../../interfaces/portal-attempt.interface';
import { newAttemptId, safeCheckoutUrl } from '../../fn/khipu-dev.fn';
import {
  passengerRutValidator,
  tripCodeValidator,
} from '../../validators/passenger-access.validator';

@Component({
  selector: 'app-lookup',
  imports: [
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    ButtonDirective,
    InputText,
    Panel,
    Message,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './lookup.page.html',
  host: {
    '(window:focus)': 'onPortalFocus()',
    '(document:visibilitychange)': 'onVisibilityChange()',
  },
})
export class LookupPage {
  private readonly interactivePollingMs = 90_000;
  private readonly pollingIntervalMs = 5_000;
  private checkoutKey: string | null = null;
  private resendKey: string | null = null;
  private pollingDeadline = 0;
  private pollingTimer: ReturnType<typeof setTimeout> | null = null;
  protected readonly paymentBusy = signal(false);
  protected readonly paymentError = signal('');
  protected readonly resendQueued = signal(false);
  protected readonly attempt = signal<PortalAttempt | null>(null);
  protected readonly fallbackCheckoutUrl = signal<string | null>(null);
  protected readonly email = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email, Validators.maxLength(254)],
  });
  protected readonly checkoutForm = new FormGroup({ email: this.email });
  protected readonly resendEmail = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email, Validators.maxLength(254)],
  });
  protected readonly resendForm = new FormGroup({ email: this.resendEmail });
  private readonly api = inject(PublicPayments);
  private readonly recaptcha = inject(RecaptchaService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly theme = inject(ThemeService);
  protected readonly form = new FormGroup({
    rut: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(20), passengerRutValidator],
    }),
    tripCode: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, tripCodeValidator],
    }),
  });
  protected readonly busy = signal(false);
  protected readonly failed = signal(false);
  protected readonly account = signal<PublicAccount | null>(null);
  protected readonly pending = computed(
    () => this.account()?.installments.filter((q) => q.status === 'PENDING') ?? [],
  );
  protected readonly paid = computed(
    () => this.account()?.installments.filter((q) => q.status === 'PAID') ?? [],
  );
  protected readonly adjusted = computed(
    () => this.account()?.installments.filter((q) => q.status === 'ADJUSTED') ?? [],
  );
  protected readonly balance = computed(() =>
    this.pending().reduce((total, quota) => total + quota.outstanding, 0),
  );

  constructor() {
    this.destroyRef.onDestroy(() => this.stopAttemptPolling());
  }

  protected lookup(): void {
    if (this.busy()) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.failed.set(false);
    this.busy.set(true);
    this.form.disable();
    const { rut, tripCode } = this.form.getRawValue();
    this.api
      .lookup(rut, tripCode)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (account) => {
          this.account.set(account);
          this.form.reset();
          this.form.enable();
          this.busy.set(false);
          const recoveryId = account.reviewAttemptId || account.openAttemptId;
          if (recoveryId) {
            // Bloquear nuevos cobros antes de consultar, incluso si falla la recuperación.
            this.attempt.set({ id: recoveryId, status: 'RECONCILIATION_REQUIRED' });
            this.refreshAttempt();
            this.startAttemptPolling();
          }
        },
        error: () => {
          this.failed.set(true);
          this.form.enable();
          this.busy.set(false);
        },
      });
  }

  protected clear(): void {
    if (this.paymentBusy()) return;
    this.checkoutKey = null;
    this.stopAttemptPolling();
    this.resendKey = null;
    this.attempt.set(null);
    this.fallbackCheckoutUrl.set(null);
    this.paymentError.set('');
    this.resendQueued.set(false);
    this.email.reset();
    this.email.enable();
    this.resendEmail.reset();
    this.resendEmail.enable();
    this.account.set(null);
    this.failed.set(false);
    this.form.reset();
  }

  protected pay(): void {
    const account = this.account();
    if (
      this.paymentBusy() ||
      this.attempt() ||
      account?.openAttemptId ||
      account?.reviewRequired ||
      !account?.checkoutEnabled ||
      !account.active ||
      account.free ||
      !this.pending().length
    )
      return;
    this.email.markAsTouched();
    if (this.email.invalid) return;
    const token = this.sessionToken();
    if (!token) return;
    const siteKey = account.recaptchaSiteKey;
    if (!siteKey) {
      this.paymentError.set('El pago seguro no está disponible temporalmente. Intenta más tarde.');
      return;
    }
    const paymentWindow = window.open('/pago-en-proceso', '_blank');
    if (paymentWindow) paymentWindow.opener = null;
    this.checkoutKey ??= newAttemptId();
    this.email.disable();
    this.paymentBusy.set(true);
    this.paymentError.set('');
    this.recaptcha
      .execute(siteKey, 'khipu_checkout')
      .then((recaptchaToken) => {
        this.api
          .checkout(this.email.getRawValue(), this.checkoutKey!, token, recaptchaToken)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (attempt) => {
              this.attempt.set(attempt);
              this.startAttemptPolling();
              this.paymentBusy.set(false);
              const checkoutUrl = safeCheckoutUrl(attempt.paymentUrl);
              if (attempt.status === 'PENDING_PAYMENT' && checkoutUrl) {
                if (paymentWindow && !paymentWindow.closed) {
                  paymentWindow.location.replace(checkoutUrl);
                } else {
                  this.fallbackCheckoutUrl.set(checkoutUrl);
                  this.paymentError.set(
                    'El navegador bloqueó la pestaña de Khipu. Usa el botón de recuperación que aparece abajo.',
                  );
                }
              } else if (paymentWindow && !paymentWindow.closed) {
                paymentWindow.close();
              }
            },
            error: () => {
              if (paymentWindow && !paymentWindow.closed) paymentWindow.close();
              this.paymentBusy.set(false);
              this.paymentError.set(
                'No se pudo obtener el resultado. Reintenta esta misma solicitud; no se cambiará su referencia ni el correo.',
              );
            },
          });
      })
      .catch(() => {
        if (paymentWindow && !paymentWindow.closed) paymentWindow.close();
        this.email.enable();
        this.paymentBusy.set(false);
        this.paymentError.set(
          'No fue posible validar la seguridad del pago. Revisa tu conexión e intenta nuevamente.',
        );
      });
  }

  protected refreshAttempt(): void {
    const attempt = this.attempt();
    if (!attempt || this.paymentBusy()) return;
    const token = this.sessionToken();
    if (!token) return;
    this.paymentBusy.set(true);
    this.paymentError.set('');
    this.api
      .attempt(attempt.id, token)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.attempt.set(updated);
          this.paymentBusy.set(false);
          if (
            updated.status === 'PENDING_PAYMENT' &&
            !this.account()?.reviewRequired &&
            !this.fallbackCheckoutUrl()
          ) {
            this.fallbackCheckoutUrl.set(safeCheckoutUrl(updated.paymentUrl));
          }
          if (
            updated.status === 'CONFIRMED' ||
            updated.status === 'REVIEW_REQUIRED' ||
            updated.status === 'PROVIDER_REVIEW_REQUIRED' ||
            updated.status === 'UNPAID_FINAL' ||
            updated.status === 'REVERSED'
          ) {
            this.fallbackCheckoutUrl.set(null);
            this.refreshAccount();
            this.stopAttemptPolling();
          } else {
            this.scheduleAttemptPoll();
          }
        },
        error: () => {
          this.paymentBusy.set(false);
          this.paymentError.set(
            'No se pudo consultar el estado. No realices otro pago hasta verificar el intento actual.',
          );
          this.scheduleAttemptPoll();
        },
      });
  }

  protected onPortalFocus(): void {
    const current = this.attempt();
    if (
      current &&
      ['PENDING_PAYMENT', 'VERIFYING_PROVIDER', 'RECONCILIATION_REQUIRED'].includes(
        current.status,
      )
    ) {
      this.refreshAttempt();
    }
  }

  protected onVisibilityChange(): void {
    if (document.visibilityState === 'visible') this.onPortalFocus();
  }

  private refreshAccount(): void {
    const token = this.sessionToken();
    const session = this.account()?.session;
    if (!token || !session) return;
    this.api
      .account(token)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (account) => this.account.set({ ...account, session }),
        error: () =>
          this.paymentError.set(
            'El pago fue consultado, pero no fue posible actualizar la lista de cuotas. Cierra la consulta e ingresa nuevamente.',
          ),
      });
  }

  private startAttemptPolling(): void {
    this.pollingDeadline = Date.now() + this.interactivePollingMs;
    this.scheduleAttemptPoll();
  }

  private scheduleAttemptPoll(): void {
    this.stopPollingTimer();
    const current = this.attempt();
    if (
      !current ||
      Date.now() >= this.pollingDeadline ||
      !['PENDING_PAYMENT', 'VERIFYING_PROVIDER', 'RECONCILIATION_REQUIRED'].includes(current.status)
    )
      return;
    this.pollingTimer = globalThis.setTimeout(() => this.refreshAttempt(), this.pollingIntervalMs);
  }

  private stopPollingTimer(): void {
    if (this.pollingTimer === null) return;
    globalThis.clearTimeout(this.pollingTimer);
    this.pollingTimer = null;
  }

  private stopAttemptPolling(): void {
    this.pollingDeadline = 0;
    this.stopPollingTimer();
  }

  protected retryAfterUnpaid(): void {
    if (this.attempt()?.status !== 'UNPAID_FINAL' || this.paymentBusy()) return;
    this.checkoutKey = null;
    this.attempt.set(null);
    this.email.enable();
    this.paymentError.set('');
    this.refreshAccount();
  }

  protected resendReceipt(): void {
    const attempt = this.attempt();
    if (
      !attempt?.receiptReady ||
      attempt.status !== 'CONFIRMED' ||
      this.paymentBusy() ||
      this.resendQueued()
    )
      return;
    this.resendEmail.markAsTouched();
    if (this.resendEmail.invalid) return;
    const token = this.sessionToken();
    if (!token) return;
    this.resendKey ??= newAttemptId();
    this.resendEmail.disable();
    this.paymentBusy.set(true);
    this.paymentError.set('');
    this.api
      .resendReceipt(attempt.id, this.resendEmail.getRawValue(), this.resendKey, token)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.resendQueued.set(true);
          this.paymentBusy.set(false);
        },
        error: () => {
          this.resendEmail.enable();
          this.paymentBusy.set(false);
          this.paymentError.set(
            'No se pudo solicitar el reenvío. Reintenta aquí sin cerrar esta consulta.',
          );
        },
      });
  }

  private sessionToken(): string | null {
    const session = this.account()?.session;
    if (!session?.accessToken || session.expiresAt * 1000 <= Date.now()) {
      this.paymentError.set(
        'La sesión venció. Cierra la consulta e ingresa nuevamente el RUT y el código. Si ya iniciaste un pago, no lo repitas sin verificar su estado.',
      );
      return null;
    }
    return session.accessToken;
  }
}
