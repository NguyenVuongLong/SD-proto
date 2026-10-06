import { Injectable } from '@angular/core';
import { ModalOptions, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

@Injectable({ providedIn: 'root' })
export class DialogService {
  /**
   * Khởi tạo service quản lý modal.
   */
  constructor(private modal: NzModalService) {}

  /**
   * Tạo một modal mới dựa trên cấu hình được truyền vào.
   */
  create<T>(options: ModalOptions<T>): NzModalRef<T> {
    return this.modal.create(options);
  }
}
