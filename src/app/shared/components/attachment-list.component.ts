import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AttachmentService } from '../../core/services/attachment.service';

interface AttachmentItem {
  id: string;
  name: string;
  available: boolean;
  lookupFailed: boolean;
}

@Component({
  selector: 'app-attachment-list',
  standalone: true,
  imports: [CommonModule, NzIconModule],
  template: `
    <div class="flex flex-wrap gap-[6px]" *ngIf="items.length">
      <ng-container *ngFor="let item of items; trackBy: trackById">
        <a
          *ngIf="item.available; else missing"
          [href]="attachments.downloadUrl(item.id)"
          [attr.download]="item.name"
          class="inline-flex items-center gap-[6px] bg-regularBG dark:bg-[#323440] text-theme-gray dark:text-white/60 text-[13px] px-[10px] py-[4px] rounded-[15px] hover:text-primary"
        >
          <i nz-icon nzType="paper-clip" nzTheme="outline"></i>{{ item.name }}
        </a>
        <ng-template #missing>
          <span
            class="inline-flex items-center gap-[6px] bg-regularBG dark:bg-[#323440] text-light dark:text-white/40 text-[13px] px-[10px] py-[4px] rounded-[15px]"
            [title]="item.lookupFailed ? 'Không thể kiểm tra tệp đính kèm' : 'Không tìm thấy tệp'"
          >{{ item.name }}</span>
        </ng-template>
      </ng-container>
    </div>
  `
})
export class AttachmentListComponent implements OnChanges {
  /** Accepts the API's comma-separated ids or an array. */
  @Input() fileIds: string | string[] | null | undefined;

  items: AttachmentItem[] = [];

  constructor(public attachments: AttachmentService) {}

  ngOnChanges(): void {
    const ids = (Array.isArray(this.fileIds) ? this.fileIds : (this.fileIds ?? '').split(','))
      .map((id) => id.trim())
      .filter(Boolean);

    this.items = ids.map((id) => ({ id, name: id, available: false, lookupFailed: false }));
    for (const item of this.items) {
      this.attachments.getInfo(item.id).subscribe({
        next: (info) => {
          if (info) {
            item.name = info.originalName;
            item.available = true;
          }
        },
        error: () => {
          item.lookupFailed = true;
        }
      });
    }
  }

  trackById(_: number, item: AttachmentItem): string {
    return item.id;
  }
}
