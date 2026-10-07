import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { Message } from 'primeng/message';

@Component({
  selector: 'app-payment-return',
  imports: [RouterLink, ButtonDirective, Message],
  templateUrl: './payment-return.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentReturnPage implements OnInit {
  ngOnInit(): void {
    window.setTimeout(() => window.close(), 900);
  }
}
