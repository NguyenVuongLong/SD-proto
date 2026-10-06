import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export class RestClient {
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0'
  });

  constructor(private readonly http: HttpClient, private readonly baseUrl: string) {}

  get<T>(path: string): Observable<T> {
    return this.http.get<T>(this.buildUrl(path), { headers: this.headers });
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(this.buildUrl(path), body, { headers: this.headers });
  }

  private buildUrl(path: string): string {
    return `${this.baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
  }
}