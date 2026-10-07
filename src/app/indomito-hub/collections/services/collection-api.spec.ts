import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { CollectionApi } from './collection-api';

describe('CollectionApi', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }),
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it('usa el endpoint administrativo y solo envía versión y liberados', () => {
    const api = TestBed.inject(CollectionApi);
    const http = TestBed.inject(HttpTestingController);
    const url = `${environment.apiUrl}/pagos/contratos/id%2Fa/puesta-en-marcha`;
    api.getSetup('id/a').subscribe();
    const get = http.expectOne(url);
    expect(get.request.method).toBe('GET');
    get.flush({ data: {} });
    const body = { contractVersion: 3, freeParticipantIds: ['passenger'] };
    api.confirmSetup('id/a', body).subscribe();
    const post = http.expectOne(url);
    expect(post.request.method).toBe('POST');
    expect(post.request.body).toEqual(body);
    post.flush({ data: { status: 'ACTIVE' } });
  });
});
