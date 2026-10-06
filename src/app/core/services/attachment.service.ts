import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of, shareReplay, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AttachmentInfo } from '../models';

export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

@Injectable({ providedIn: 'root' })
export class AttachmentService {
  private readonly baseUrl = `${environment.apiUrl}/attachments`;
  private readonly infoCache = new Map<string, Observable<AttachmentInfo | null>>();

  /**
   * Khởi tạo service upload tệp và inject HttpClient.
   */
  constructor(private http: HttpClient) {}

  /**
   * Kiểm tra tính hợp lệ của tệp trước khi upload.
   */
  validate(file: File): string | null {
    if (file.size <= 0) {
      return `Tệp "${file.name}" không có nội dung.`;
    }
    return file.size > MAX_ATTACHMENT_BYTES
      ? `Tệp "${file.name}" vượt quá ${MAX_ATTACHMENT_BYTES / (1024 * 1024)} MB.`
      : null;
  }

  /**
   * Lọc các tệp hợp lệ và thông báo cho các tệp bị từ chối.
   */
  filterValid(files: File[], onReject: (message: string) => void): File[] {
    return files.filter((file) => {
      const error = this.validate(file);
      if (error) {
        onReject(error);
      }
      return !error;
    });
  }

  /**
   * Tải một tệp lên server kèm thông tin người upload.
   */
  upload(file: File, uploadedBy: string): Observable<AttachmentInfo> {
    const body = new FormData();
    body.append('file', file, file.name);
    body.append('uploadedBy', uploadedBy);
    return this.http.post<AttachmentInfo>(this.baseUrl, body);
  }

  /**
   * Tải nhiều tệp cùng lúc trong một batch.
   */
  uploadAll(files: File[], uploadedBy: string): Observable<AttachmentInfo[]> {
    return files.length ? forkJoin(files.map((file) => this.upload(file, uploadedBy))) : of([]);
  }

  /**
   * Lấy thông tin chi tiết của tệp theo ID, nếu tệp không còn tồn tại thì trả về null.
   */
  getInfo(fileId: string): Observable<AttachmentInfo | null> {
    let info$ = this.infoCache.get(fileId);
    if (!info$) {
      info$ = this.http.get<AttachmentInfo>(`${this.baseUrl}/${encodeURIComponent(fileId)}/info`).pipe(
        map((info): AttachmentInfo | null => info),
        catchError((error: HttpErrorResponse) =>
          error.status === 404 ? of(null) : throwError(() => error)
        ),
        shareReplay(1)
      );
      this.infoCache.set(fileId, info$);
    }
    return info$;
  }

  /**
   * Tạo đường dẫn tải xuống cho một tệp cụ thể.
   */
  downloadUrl(fileId: string): string {
    return `${this.baseUrl}/${encodeURIComponent(fileId)}`;
  }

  /**
   * Trả về thông báo lỗi thân thiện từ API hoặc fallback mặc định.
   */
  errorMessage(error: unknown, fallback = 'Không thể tải tệp lên. Vui lòng thử lại.'): string {
    const message = (error as { error?: { message?: unknown } })?.error?.message;
    return typeof message === 'string' && message ? message : fallback;
  }
}
