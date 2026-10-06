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

  constructor(private http: HttpClient) {}

  /** Returns a user-facing error, or null when the file may be uploaded. */
  validate(file: File): string | null {
    if (file.size <= 0) {
      return `Tệp "${file.name}" không có nội dung.`;
    }
    return file.size > MAX_ATTACHMENT_BYTES
      ? `Tệp "${file.name}" vượt quá ${MAX_ATTACHMENT_BYTES / (1024 * 1024)} MB.`
      : null;
  }

  /** Keeps the valid files and reports each rejected one through `onReject`. */
  filterValid(files: File[], onReject: (message: string) => void): File[] {
    return files.filter((file) => {
      const error = this.validate(file);
      if (error) {
        onReject(error);
      }
      return !error;
    });
  }

  upload(file: File, uploadedBy: string): Observable<AttachmentInfo> {
    const body = new FormData();
    body.append('file', file, file.name);
    body.append('uploadedBy', uploadedBy);
    return this.http.post<AttachmentInfo>(this.baseUrl, body);
  }

  /** Uploads sequentially-independent files together; any failure fails the whole batch. */
  uploadAll(files: File[], uploadedBy: string): Observable<AttachmentInfo[]> {
    return files.length ? forkJoin(files.map((file) => this.upload(file, uploadedBy))) : of([]);
  }

  /** Emits null when the file no longer exists on the server. */
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

  downloadUrl(fileId: string): string {
    return `${this.baseUrl}/${encodeURIComponent(fileId)}`;
  }

  /** Prefers the API's own message (for example the size limit) over a generic one. */
  errorMessage(error: unknown, fallback = 'Không thể tải tệp lên. Vui lòng thử lại.'): string {
    const message = (error as { error?: { message?: unknown } })?.error?.message;
    return typeof message === 'string' && message ? message : fallback;
  }
}
