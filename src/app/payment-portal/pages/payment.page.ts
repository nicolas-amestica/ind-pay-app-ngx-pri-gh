import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Panel } from 'primeng/panel';
import { Message } from 'primeng/message';
import { Dialog } from 'primeng/dialog';
import { PaymentApiService } from '../services/payment-api.service';
import type { Installment, PaymentAttempt, PaymentReceipt } from '../interfaces/payment.interface';

/** Consulta privada y pago de obligaciones individuales en el portal local. */
@Component({
  selector: 'app-payment-page',
  imports: [
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    ButtonDirective,
    InputText,
    Panel,
    Message,
    Dialog,
  ],
  templateUrl: './payment.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentPage {
  private readonly api = inject(PaymentApiService);
  protected readonly accessForm = new FormGroup({
    rut: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(20)],
    }),
    code: new FormControl('', { nonNullable: true }),
  });
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly challenge = signal<{ challengeId: string; demoCode: string } | null>(null);
  protected readonly signedIn = signal(false);
  protected readonly installments = signal<Installment[]>([]);
  protected readonly pending = computed(() => this.installments().filter((i) => i.paid < i.amount));
  protected readonly paid = computed(() => this.installments().filter((i) => i.paid === i.amount));
  protected readonly balance = computed(() =>
    this.pending().reduce((sum, i) => sum + i.amount - i.paid, 0),
  );
  protected readonly attempt = signal<PaymentAttempt | null>(null);
  protected readonly receipt = signal<PaymentReceipt | null>(null);
  protected readonly notice = signal('');

  protected async requestAccess(): Promise<void> {
    if (this.accessForm.controls.rut.invalid) {
      this.accessForm.markAllAsTouched();
      return;
    }
    await this.run(async () => {
      this.challenge.set(await firstValueFrom(this.api.access(this.accessForm.controls.rut.value)));
      this.accessForm.controls.code.reset();
    });
  }
  protected async login(): Promise<void> {
    const challenge = this.challenge();
    if (!challenge) return;
    await this.run(async () => {
      await firstValueFrom(
        this.api.login(challenge.challengeId, this.accessForm.controls.code.value),
      );
      this.installments.set(await firstValueFrom(this.api.installments()));
      this.signedIn.set(true);
      this.challenge.set(null);
      this.accessForm.reset();
    });
  }
  protected async logout(): Promise<void> {
    await this.run(async () => {
      await firstValueFrom(this.api.logout());
      this.signedIn.set(false);
      this.installments.set([]);
      this.receipt.set(null);
      this.attempt.set(null);
      this.notice.set('');
    });
  }
  protected async pay(item: Installment): Promise<void> {
    await this.run(async () =>
      this.attempt.set(await firstValueFrom(this.api.create(item.id, crypto.randomUUID()))),
    );
  }
  protected async simulate(outcome: 'CONFIRMED' | 'FAILED'): Promise<void> {
    const attempt = this.attempt();
    if (!attempt) return;
    await this.run(async () => {
      await firstValueFrom(this.api.simulate(attempt.id, outcome));
      this.installments.set(await firstValueFrom(this.api.installments()));
      this.attempt.set(null);
      this.notice.set(
        outcome === 'CONFIRMED'
          ? 'Pago de prueba confirmado. Comprobante disponible y correo capturado en la bandeja local.'
          : 'Pago de prueba rechazado. La cuota sigue pendiente.',
      );
    });
  }
  protected async showReceipt(id: string): Promise<void> {
    await this.run(async () => this.receipt.set(await firstValueFrom(this.api.receipt(id))));
  }
  protected downloadReceipt(): void {
    const receipt = this.receipt();
    if (!receipt) return;
    const text = `${receipt.description}\nIdentificador: ${receipt.id}\nViaje: ${receipt.tripName}\n${receipt.installment}\nMonto: ${receipt.amount} CLP\nFecha UTC: ${receipt.issuedAt}\n`;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `comprobante-prueba-${receipt.id}.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  private async run(operation: () => Promise<unknown>): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    try {
      await operation();
    } catch {
      this.error.set(
        'No se pudo completar la operación. Comprueba los datos, la vigencia del código y que el servicio local esté iniciado.',
      );
    } finally {
      this.busy.set(false);
    }
  }
}
