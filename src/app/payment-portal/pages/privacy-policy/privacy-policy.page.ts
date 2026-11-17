import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LegalFooterComponent } from '../../components/legal-footer.component';

@Component({
  selector: 'app-privacy-policy',
  imports: [LegalFooterComponent, RouterLink],
  templateUrl: './privacy-policy.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacyPolicyPage {}
