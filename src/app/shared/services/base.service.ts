import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RestClient } from './rest-client';

export class BaseService {
  protected readonly restClient: RestClient;
  protected readonly damtcVersion = 'damtc';

  constructor(http: HttpClient) {
    this.restClient = new RestClient(http, environment.INET_URI);
  }
}