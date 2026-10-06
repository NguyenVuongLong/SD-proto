import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private message: NzMessageService) {}

  success(content: string): void {
    this.message.success(content);
  }

  error(content: string): void {
    this.message.error(content);
  }

  info(content: string): void {
    this.message.info(content);
  }
}
