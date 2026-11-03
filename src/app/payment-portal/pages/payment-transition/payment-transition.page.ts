import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { Message } from 'primeng/message';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ThemeService } from '../../../core/theme/theme.service';

@Component({
  selector: 'app-payment-transition',
  imports: [RouterLink, ButtonDirective, Message, ProgressSpinner],
  templateUrl: './payment-transition.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentTransitionPage {
  protected readonly theme = inject(ThemeService);
}
