import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export class RestClient {
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0'
  });

  /**
   * Khởi tạo client REST với HttpClient và base URL của API.
   */
  constructor(private readonly http: HttpClient, private readonly baseUrl: string) {}

  /**
   * Gửi yêu cầu GET đến endpoint đã cho.
   */
  get<T>(path: string): Observable<T> {
    return this.http.get<T>(this.buildUrl(path), { headers: this.headers });
  }

  /**
   * Gửi yêu cầu POST với body dữ liệu cho endpoint đã cho.
   */
  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(this.buildUrl(path), body, { headers: this.headers });
  }

  /**
   * Tạo URL đầy đủ từ base URL và path request.
   */
  private buildUrl(path: string): string {
    return `${this.baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
  }
}