import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { catchError, EMPTY, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { ClpAmountPipe } from '../../../../shared/formatting/clp-amount.pipe';
import type { CollectionSetup } from '../../interfaces/collection-setup.interface';
import { CollectionApi } from '../../services/collection-api';

@Component({
  selector: 'app-contract-setup',
  imports: [
    RouterLink,
    FormsModule,
    ButtonModule,
    CheckboxModule,
    MessageModule,
    TableModule,
    ClpAmountPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contract-setup.page.html',
})
export class ContractSetupPage {
  private readonly api = inject(CollectionApi);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly setup = signal<CollectionSetup | null>(null);
  protected readonly selected = signal<string[]>([]);
  protected readonly reviewed = signal(false);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly failed = signal(false);
  protected readonly confirmed = signal(false);
  protected readonly selectionLocked = signal(false);
  protected readonly canConfirm = computed(() => {
    const setup = this.setup();
    return (
      !!setup &&
      this.selected().length === setup.freeCount &&
      this.reviewed() &&
      !this.saving() &&
      !this.confirmed()
    );
  });
  constructor() {
    inject(ActivatedRoute)
      .paramMap.pipe(
        tap(() => {
          this.setup.set(null);
          this.selected.set([]);
          this.reviewed.set(false);
          this.loading.set(true);
          this.failed.set(false);
          this.saving.set(false);
          this.confirmed.set(false);
          this.selectionLocked.set(false);
        }),
        switchMap((params) =>
          this.api.getSetup(params.get('id') ?? '').pipe(
            catchError(() => {
              this.failed.set(true);
              this.loading.set(false);
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (setup) => {
          this.setup.set(setup);
          this.selected.set(setup.freeParticipantIds);
          this.selectionLocked.set(setup.status !== 'NOT_STARTED');
          this.confirmed.set(setup.status === 'ACTIVE');
          this.loading.set(false);
        },
        error: () => {
          this.failed.set(true);
          this.loading.set(false);
        },
      });
  }
  protected select(id: string, value: boolean): void {
    if (this.selectionLocked()) return;
    this.selected.update((ids) =>
      value ? [...new Set([...ids, id])] : ids.filter((item) => item !== id),
    );
    this.reviewed.set(false);
  }
  protected confirm(): void {
    const setup = this.setup();
    if (!setup || !this.canConfirm()) return;
    this.saving.set(true);
    this.selectionLocked.set(true);
    this.failed.set(false);
    this.api
      .confirmSetup(setup.contractId, {
        contractVersion: setup.contractVersion,
        freeParticipantIds: [...this.selected()].sort(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          if (this.setup() !== setup) return;
          this.confirmed.set(true);
          this.saving.set(false);
        },
        error: () => {
          if (this.setup() !== setup) return;
          this.failed.set(true);
          this.saving.set(false);
        },
      });
  }
}
