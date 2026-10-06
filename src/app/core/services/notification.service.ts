import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  /**
   * Khởi tạo service hiển thị thông báo ngắn.
   */
  constructor(private message: NzMessageService) {}

  /**
   * Hiển thị thông báo thành công.
   */
  success(content: string): void {
    this.message.success(content);
  }

  /**
   * Hiển thị thông báo lỗi.
   */
  error(content: string): void {
    this.message.error(content);
  }

  /**
   * Hiển thị thông báo thông tin.
   */
  info(content: string): void {
    this.message.info(content);
  }
}
