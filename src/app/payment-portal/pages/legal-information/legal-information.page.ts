import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LegalFooterComponent } from '../../components/legal-footer.component';

@Component({
  selector: 'app-legal-information',
  imports: [LegalFooterComponent, RouterLink],
  templateUrl: './legal-information.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalInformationPage {}
