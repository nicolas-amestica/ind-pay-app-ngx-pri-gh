import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { ApiSuccessEnvelope } from '../../../core/http/api-response.interface';
import type {
  CollectionSetup,
  CollectionSetupRequest,
  CollectionSetupResult,
} from '../interfaces/collection-setup.interface';

@Injectable({ providedIn: 'root' })
export class CollectionApi {
  private readonly http = inject(HttpClient);
  getSetup(id: string) {
    return this.http
      .get<ApiSuccessEnvelope<CollectionSetup>>(this.endpoint(id))
      .pipe(map(({ data }) => data));
  }
  confirmSetup(id: string, request: CollectionSetupRequest) {
    return this.http
      .post<ApiSuccessEnvelope<CollectionSetupResult>>(this.endpoint(id), request)
      .pipe(map(({ data }) => data));
  }
  private endpoint(id: string): string {
    return `${environment.apiUrl}/pagos/contratos/${encodeURIComponent(id)}/puesta-en-marcha`;
  }
}
