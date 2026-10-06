import { Injectable } from '@angular/core';
import { ModalOptions, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

@Injectable({ providedIn: 'root' })
export class DialogService {
  constructor(private modal: NzModalService) {}

  create<T>(options: ModalOptions<T>): NzModalRef<T> {
    return this.modal.create(options);
  }
}
