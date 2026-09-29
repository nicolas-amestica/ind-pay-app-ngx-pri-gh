import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  type OnInit,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Panel } from 'primeng/panel';
import { Message } from 'primeng/message';
import { ThemeService } from '../../core/theme/theme.service';
import { KhipuDev } from '../services/khipu-dev';
import { newAttemptId, safeCheckoutUrl, validAttemptId } from '../fn/khipu-dev.fn';
import type { KhipuDevAttempt, KhipuDevConfiguration } from '../interfaces/khipu-dev.interface';

@Component({
  selector: 'app-khipu-dev',
  imports: [
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    ButtonDirective,
    InputText,
    Panel,
    Message,
  ],
  templateUrl: './khipu-dev.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KhipuDevPage implements OnInit {
  private readonly api = inject(KhipuDev);
  private readonly storageKey = 'indomito-khipu-dev-attempt';
  protected readonly theme = inject(ThemeService);
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly configuration = signal<KhipuDevConfiguration | null>(null);
  protected readonly id = signal('');
  protected readonly attempt = signal<KhipuDevAttempt | null>(null);
  protected readonly recoveryId = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/^[0-7][0-9A-HJKMNP-TV-Z]{25}$/)],
  });
  protected readonly ready = computed(() => {
    const config = this.configuration();
    return (
      config?.mode === 'khipu-development' && config.testBankAvailable && config.currency === 'CLP'
    );
  });
  protected readonly checkout = computed(() =>
    this.ready() && this.attempt()?.status === 'PENDING'
      ? safeCheckoutUrl(this.attempt()?.paymentUrl)
      : null,
  );
  protected readonly status = computed(() => {
    switch (this.attempt()?.status) {
      case 'CONFIRMED':
        return 'Pago de prueba confirmado';
      case 'PENDING':
        return 'Pendiente de pago en DemoBank';
      case 'CREATING':
        return 'Creación en curso: consulta el estado antes de continuar';
      case 'BLOCKED':
        return 'Prueba bloqueada por el backend';
      case 'RECONCILIATION_REQUIRED':
        return 'Requiere conciliación: no crees otro intento';
      default:
        return 'Resultado aún no disponible';
    }
  });

  ngOnInit(): void {
    void this.run(async () => {
      const saved = localStorage.getItem(this.storageKey);
      if (saved && validAttemptId(saved)) this.id.set(saved);
      this.configuration.set(await firstValueFrom(this.api.configuration()));
      if (this.id()) this.attempt.set(await firstValueFrom(this.api.read(this.id())));
    });
  }

  protected async connect(): Promise<void> {
    await this.run(async () =>
      this.configuration.set(await firstValueFrom(this.api.configuration())),
    );
  }

  protected async create(): Promise<void> {
    if (!this.ready() || this.attempt()) return;
    await this.run(async () => {
      const id = this.id() || newAttemptId();
      // Si no se puede persistir el identificador, no se crea el cobro.
      localStorage.setItem(this.storageKey, id);
      this.id.set(id);
      this.attempt.set(await firstValueFrom(this.api.create(id)));
    });
  }

  protected async recover(): Promise<void> {
    if (this.id() || this.recoveryId.invalid) return;
    await this.run(async () => {
      const id = this.recoveryId.value;
      const attempt = await firstValueFrom(this.api.read(id));
      localStorage.setItem(this.storageKey, id);
      this.id.set(id);
      this.attempt.set(attempt);
    });
  }

  protected async refresh(verify = false): Promise<void> {
    if (!this.id()) return;
    await this.run(async () =>
      this.attempt.set(
        await firstValueFrom(verify ? this.api.verify(this.id()) : this.api.read(this.id())),
      ),
    );
  }

  protected download(): void {
    const receipt = this.attempt()?.receipt;
    if (!receipt || this.attempt()?.status !== 'CONFIRMED') return;
    const text = `${receipt.description}\nComprobante: ${receipt.id}\nIntento: ${this.id()}\nMonto: ${receipt.amount} CLP\nFecha UTC: ${receipt.issuedAt}\n`;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `comprobante-dev-${receipt.id}.txt`;
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
        'No se pudo completar la operación. Revisa el puente local y la sesión AWS DEV. Si existe un ID, consérvalo y consulta su estado: un error no significa que el pago haya fallado.',
      );
    } finally {
      this.busy.set(false);
    }
  }
}
