import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { Message } from 'primeng/message';

import { ThemeService } from '../../../core/theme/theme.service';

@Component({
  selector: 'app-payment-return',
  imports: [RouterLink, ButtonDirective, Message],
  templateUrl: './payment-return.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentReturnPage implements OnInit {
  constructor() {
    inject(ThemeService);
  }

  ngOnInit(): void {
    window.setTimeout(() => window.close(), 900);
  }
}
