import { Component, TemplateRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzUploadModule, NzUploadFile } from 'ng-zorro-antd/upload';

import { PerfectScrollbarModule } from 'ngx-om-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-om-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-om-perfect-scrollbar';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

interface Person {
  id: string;
  subject?: string;
  content: string;
  attachedFile: string;
  actions: string;
  status: string;
  priority: string;
  creatorUser: string;
  creatorName: string;
  creatorPhone: string;
  creatorEmail: string;
  assignedUser: string;
  assignedName: string;
  assignedPhone: string;
  assignedEmail: string;
  createdDate: string;
  dueDate: string;
  closedDate: string;
  response: string;
  topicName: string;
}

type SortField = 'id' | 'assignedName' | 'priority' | 'actions' | 'createdDate' | 'dueDate' | 'topicName';
type SortOrder = 'asc' | 'desc';

@Component({
  selector: 'ticket-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzInputModule,
    NzSelectModule,
    NzDatePickerModule,
    NzTableModule,
    NzPaginationModule,
    NzFormModule,
    NzButtonModule,
    NzIconModule,
    NzUploadModule,
    PerfectScrollbarModule
  ],
  providers: [
    {
        provide: PERFECT_SCROLLBAR_CONFIG,
        useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ],
  template: `
    <div class="bg-white dark:bg-white/10 m-0 p-0 text-theme-gray dark:text-white/60 text-[15px] rounded-10 relative mb-[25px]">
      <div class="pt-[30px] pb-[9px] px-[25px] text-dark dark:text-white/[.87] font-medium text-[17px] flex items-center justify-between max-sm:flex-col max-sm:gap-[15px]">
        <h4 class="mb-0 text-[20px] leading-6 font-medium text-dark dark:text-white/[.87]">My Tickets</h4>
          <button class="flex items-center px-[14px] text-sm text-white rounded-md font-semibold bg-primary border-primary h-10 gap-[6px]" nz-button (click)="createTplModal(tplTitle, tplContent, tplFooter)">
          <i class="text-[12px]" nz-icon nzType="plus"></i>
          <span class="m-0">Tạo Ticket</span>
        </button>
      </div>
      <div class="px-[25px] pb-[25px]">
        <div class="flex items-center justify-center w-full mt-5 mb-[25px] max-md:flex-col max-md:justify-center gap-[15px]">
          <div class="inline-flex items-center flex-wrap w-full gap-[20px] max-md:justify-center">
            <div class="inline-flex items-center">
              <input
                class="h-10 px-[20px] text-body dark:text-white/60 bg-white dark:bg-white/10 border-normal border-1 dark:border-white/10 rounded-[6px]"
                nz-input
                placeholder="Tìm theo mã ticket hoặc tên"
                [(ngModel)]="searchValue"
                (ngModelChange)="onSearchChange()"
              />
            </div>
            <div class="inline-flex items-center">
              <nz-select
                class="min-w-[180px] capitalize [&>nz-select-top-control]:border-normal dark:[&>nz-select-top-control]:border-white/10 [&>nz-select-top-control]:bg-white [&>nz-select-top-control]:dark:bg-white/10 [&>nz-select-top-control]:shadow-none [&>nz-select-top-control]:text-dark [&>nz-select-top-control]:dark:text-white/60 [&>nz-select-top-control]:h-[40px] [&>nz-select-top-control]:flex [&>nz-select-top-control]:items-center [&>nz-select-top-control]:rounded-[6px] [&>nz-select-top-control]:px-[20px] [&>.ant-select-arrow]:text-light dark:[&>.ant-select-arrow]:text-white/60"
                [(ngModel)]="topicFilter"
                (ngModelChange)="filterByTopic()" nzPlaceHolder="Tìm theo chủ đề" nzAllowClear
              >
                <nz-option *ngFor="let t of topicFilterOptions" [nzValue]="t" [nzLabel]="t"></nz-option>
              </nz-select>
            </div>
            <div class="inline-flex items-center">
              <nz-select
                class="min-w-[160px] capitalize [&>nz-select-top-control]:border-normal dark:[&>nz-select-top-control]:border-white/10 [&>nz-select-top-control]:bg-white [&>nz-select-top-control]:dark:bg-white/10 [&>nz-select-top-control]:shadow-none [&>nz-select-top-control]:text-dark [&>nz-select-top-control]:dark:text-white/60 [&>nz-select-top-control]:h-[40px] [&>nz-select-top-control]:flex [&>nz-select-top-control]:items-center [&>nz-select-top-control]:rounded-[6px] [&>nz-select-top-control]:px-[20px] [&>.ant-select-arrow]:text-light dark:[&>.ant-select-arrow]:text-white/60"
                [(ngModel)]="priorityFilter"
                (ngModelChange)="filterByPriority()" nzPlaceHolder="Tìm theo ưu tiên" nzAllowClear
              >
                <nz-option nzValue="Gấp" nzLabel="Gấp"></nz-option>
                <nz-option nzValue="Cao" nzLabel="Cao"></nz-option>
                <nz-option nzValue="Trung bình" nzLabel="Trung bình"></nz-option>
                <nz-option nzValue="Thấp" nzLabel="Thấp"></nz-option>
              </nz-select>
            </div>
            <div class="inline-flex items-center">
              <nz-select
                class="min-w-[180px] capitalize [&>nz-select-top-control]:border-normal dark:[&>nz-select-top-control]:border-white/10 [&>nz-select-top-control]:bg-white [&>nz-select-top-control]:dark:bg-white/10 [&>nz-select-top-control]:shadow-none [&>nz-select-top-control]:text-dark [&>nz-select-top-control]:dark:text-white/60 [&>nz-select-top-control]:h-[40px] [&>nz-select-top-control]:flex [&>nz-select-top-control]:items-center [&>nz-select-top-control]:rounded-[6px] [&>nz-select-top-control]:px-[20px] [&>.ant-select-arrow]:text-light dark:[&>.ant-select-arrow]:text-white/60"
                [(ngModel)]="statusFilter"
                (ngModelChange)="filterByStatus()" nzPlaceHolder="Tìm theo trạng thái" nzAllowClear
              >
                <nz-option nzValue="open" nzLabel="Mở"></nz-option>
                <nz-option nzValue="overdue" nzLabel="Quá hạn"></nz-option>
                <nz-option nzValue="close" nzLabel="Đóng"></nz-option>
              </nz-select>
            </div>
            <div class="inline-flex items-center">
              <nz-range-picker
                class="h-10"
                nzFormat="dd/MM/yyyy"
                [nzPlaceHolder]="['Từ ngày tạo', 'Đến ngày tạo']"
                [(ngModel)]="createdDateRange"
                (ngModelChange)="filterByCreatedDateRange()"
              ></nz-range-picker>
            </div>
            <div class="inline-flex items-center">
              <nz-range-picker
                class="h-10"
                nzFormat="dd/MM/yyyy"
                [nzPlaceHolder]="['Từ ngày đến hạn', 'Đến ngày đến hạn']"
                [(ngModel)]="dueDateRange"
                (ngModelChange)="filterByDueDateRange()"
              ></nz-range-picker>
            </div>
          </div>
        </div>
        <perfect-scrollbar>
            <div class="w-full max-2xl:overflow-x-auto max-h-[450px]">
              <nz-table #basicTable [nzData]="filteredPeople" [nzFrontPagination]="false" [nzShowPagination]="false">
                <thead>
                  <tr>
                    <th class="bg-regularBG dark:bg-[#323440] px-[20px] py-[16px] text-start text-dark dark:text-white/[.87] text-[15px] font-medium border-none before:hidden rounded-s-[10px] capitalize cursor-pointer select-none" (click)="toggleSort('id')">Mã Ticket{{ sortArrow('id') }}</th>
                    <th class="bg-regularBG dark:bg-[#323440] px-[20px] py-[16px] text-start text-dark dark:text-white/[.87] text-[15px] font-medium border-none before:hidden capitalize">Tiêu đề</th>
                    <th class="bg-regularBG dark:bg-[#323440] px-[20px] py-[16px] text-start text-dark dark:text-white/[.87] text-[15px] font-medium border-none before:hidden capitalize cursor-pointer select-none" (click)="toggleSort('topicName')">Chủ đề{{ sortArrow('topicName') }}</th>
                    <th class="bg-regularBG dark:bg-[#323440] px-[20px] py-[16px] text-start text-dark dark:text-white/[.87] text-[15px] font-medium border-none before:hidden capitalize cursor-pointer select-none" (click)="toggleSort('assignedName')">Người xử lý{{ sortArrow('assignedName') }}</th>
                    <th class="bg-regularBG dark:bg-[#323440] px-[20px] py-[16px] text-start text-dark dark:text-white/[.87] text-[15px] font-medium border-none before:hidden capitalize cursor-pointer select-none" (click)="toggleSort('priority')">Ưu tiên{{ sortArrow('priority') }}</th>
                    <th class="bg-regularBG dark:bg-[#323440] px-[20px] py-[16px] text-start text-dark dark:text-white/[.87] text-[15px] font-medium border-none before:hidden capitalize cursor-pointer select-none" (click)="toggleSort('actions')">Trạng thái{{ sortArrow('actions') }}</th>
                    <th class="bg-regularBG dark:bg-[#323440] px-[20px] py-[16px] text-start text-dark dark:text-white/[.87] text-[15px] font-medium border-none before:hidden capitalize cursor-pointer select-none" (click)="toggleSort('createdDate')">Ngày tạo{{ sortArrow('createdDate') }}</th>
                    <th class="bg-regularBG dark:bg-[#323440] px-[20px] py-[16px] text-start text-dark dark:text-white/[.87] text-[15px] font-medium border-none before:hidden capitalize cursor-pointer select-none" (click)="toggleSort('dueDate')">Ngày đến hạn{{ sortArrow('dueDate') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="group max-lg:whitespace-nowrap cursor-pointer" *ngFor="let person of pagedPeople" (click)="viewTicket(person)">
                    <td class="ltr:pr-[20px] rtl:pl-[20px] text-theme-gray dark:text-white/60 font-medium text-[15px] py-4 before:hidden border-none group-hover:bg-transparent">#{{ person.id }}</td>
                    <td class="ltr:pr-[20px] rtl:pl-[20px] text-theme-gray dark:text-white/60 font-medium text-[15px] py-4 before:hidden border-none group-hover:bg-transparent">{{ person.subject }}</td>
                    <td class="ltr:pr-[20px] rtl:pl-[20px] text-theme-gray dark:text-white/60 font-medium text-[15px] py-4 before:hidden border-none group-hover:bg-transparent">{{ person.topicName }}</td>
                    <td class="ltr:pr-[20px] rtl:pl-[20px] text-theme-gray dark:text-white/60 font-medium text-[15px] py-4 before:hidden border-none group-hover:bg-transparent">
                    <div class="flex items-center">
                      <div class="me-2.5 w-[34px] h-[34px]">
                        <img class="min-w-[34px] h-[34px] rounded-4" src="assets/images/avatars/{{person.assignedUser}}" alt="Samsung Galaxy S8 256GB">
                      </div>
                      <div>
                        <span class="font-medium capitalize text-dark dark:text-white/[.87] text-15 block">{{ person.assignedName }}</span>
                        <div class="text-[12px] leading-[1.6] text-light dark:text-white/60 whitespace-nowrap">
                          <div>{{ person.assignedPhone }}</div>
                          <div>{{ person.assignedEmail }}</div>
                        </div>
                      </div>
                    </div>
                    </td>
                    <td class="ltr:pr-[20px] rtl:pl-[20px] text-theme-gray dark:text-white/60 font-medium text-[15px] py-4 before:hidden border-none group-hover:bg-transparent">{{ person.priority }}</td>
                    <td class="ltr:pr-[20px] rtl:pl-[20px] text-theme-gray dark:text-white/60 font-medium text-[15px] py-4 before:hidden border-none group-hover:bg-transparent">
                    <span
                        class="inline-flex items-center justify-center bg-{{ person.status }}/10 text-{{ person.status }} min-h-[24px] px-3 text-xs font-medium rounded-[15px] capitalize"
                      >
                        {{ person.actions }}
                      </span>
                    </td>
                    <td class="ltr:pr-[20px] rtl:pl-[20px] text-theme-gray dark:text-white/60 font-medium text-[15px] py-4 before:hidden border-none group-hover:bg-transparent">{{ person.createdDate }}</td>
                    <td class="ltr:pr-[20px] rtl:pl-[20px] text-theme-gray dark:text-white/60 font-medium text-[15px] py-4 before:hidden border-none group-hover:bg-transparent">{{ person.dueDate }}</td>
                  </tr>
                </tbody>
              </nz-table>
            </div>
        </perfect-scrollbar>
        <div class="border-t border-regular dark:border-white/10 pt-[30px] mt-[10px] flex justify-center">
          <nz-pagination
            [(nzPageIndex)]="pageIndex"
            [nzPageSize]="pageSize"
            [nzTotal]="filteredPeople.length"
            (nzPageIndexChange)="onPageIndexChange($event)"
          ></nz-pagination>
        </div>
      </div>
    </div>
    <ng-template #tplTitle>
      <span>Tạo Ticket</span>
    </ng-template>
    <ng-template #tplContent let-params>
      <form nz-form nzLayout="vertical">
          <nz-form-item>
            <nz-form-control>
              <nz-form-label nzRequired class="text-[15px] font-semibold text-dark dark:text-white/[.87] capitalize mb-[10px]">Chủ đề:</nz-form-label>
              <nz-select class="min-w-[260px] capitalize [&>nz-select-top-control]:border-normal dark:[&>nz-select-top-control]:border-white/10 [&>nz-select-top-control]:bg-white [&>nz-select-top-control]:dark:bg-white/10 [&>nz-select-top-control]:shadow-none [&>nz-select-top-control]:text-dark [&>nz-select-top-control]:dark:text-white/60 [&>nz-select-top-control]:h-[50px] [&>nz-select-top-control]:flex [&>nz-select-top-control]:items-center [&>nz-select-top-control]:rounded-[5px] [&>nz-select-top-control]:px-[20px] [&>.ant-select-arrow]:text-theme-gray dark:[&>.ant-select-arrow]:text-white/60" [(ngModel)]="newTicketTopic" nzPlaceHolder="Chọn chủ đề" name="chuDe">
                <nz-option *ngFor="let topic of topicOptions" [nzValue]="topic" [nzLabel]="topic"></nz-option>
              </nz-select>
            </nz-form-control>
          </nz-form-item>
          <ng-container *ngIf="newTicketTopic">
          <nz-form-item>
            <nz-form-control>
              <nz-form-label nzRequired class="text-[15px] font-semibold text-dark dark:text-white/[.87] capitalize mb-[10px]">Tiêu đề:</nz-form-label>
              <input class="h-[50px] border-normal dark:border-white/10 px-[20px] placeholder-shown:text-light-extra dark:placeholder-shown:text-white/60 rounded-[5px] dark:bg-white/10 dark:text-white/[.87]" type="text" nz-input placeholder="Tiêu đề" name="tieuDe" ngModel>
            </nz-form-control>
          </nz-form-item>
          <nz-form-item>
            <nz-form-control>
            <nz-form-label nzRequired class="text-[15px] font-semibold text-dark dark:text-white/[.87] capitalize mb-[10px]">Ưu tiên:</nz-form-label>
              <nz-select class="min-w-[260px] capitalize [&>nz-select-top-control]:border-normal dark:[&>nz-select-top-control]:border-white/10 [&>nz-select-top-control]:bg-white [&>nz-select-top-control]:dark:bg-white/10 [&>nz-select-top-control]:shadow-none [&>nz-select-top-control]:text-dark [&>nz-select-top-control]:dark:text-white/60 [&>nz-select-top-control]:h-[50px] [&>nz-select-top-control]:flex [&>nz-select-top-control]:items-center [&>nz-select-top-control]:rounded-[5px] [&>nz-select-top-control]:px-[20px] [&>.ant-select-arrow]:text-theme-gray dark:[&>.ant-select-arrow]:text-white/60" nzPlaceHolder="Chọn mức độ ưu tiên" name="uuTien" ngModel>
                <nz-option nzValue="Gấp" nzLabel="Gấp"></nz-option>
                <nz-option nzValue="Cao" nzLabel="Cao"></nz-option>
                <nz-option nzValue="Trung bình" nzLabel="Trung bình"></nz-option>
                <nz-option nzValue="Thấp" nzLabel="Thấp"></nz-option>
              </nz-select>
            </nz-form-control>
          </nz-form-item>
          <nz-form-item>
            <nz-form-control>
            <nz-form-label nzRequired class="text-[15px] font-semibold text-dark dark:text-white/[.87] capitalize mb-[10px]">Nội dung:</nz-form-label>
              <textarea class="h-[118px] border-normal dark:border-white/10 px-[20px] placeholder-shown:text-light-extra dark:placeholder-shown:text-white/60 rounded-[5px] py-[15px] dark:bg-white/10 dark:text-white/60" nz-input placeholder="Nội dung" name="noiDung" ngModel></textarea>
            </nz-form-control>
          </nz-form-item>
          <nz-form-item class="mb-0">
            <nz-form-control>
              <div class="flex items-center flex-wrap gap-[15px]">
                <span class="text-[15px] font-semibold text-dark dark:text-white/[.87] capitalize">Tệp đính kèm:</span>
                <nz-upload
                  nzAction=""
                  [nzShowUploadList]="false"
                  [nzBeforeUpload]="beforeUploadTicketFile"
                >
                  <button nz-button type="button" class="flex items-center gap-[6px]">
                    <i nz-icon nzType="upload"></i>
                    <span>Chọn tệp</span>
                  </button>
                </nz-upload>
                <div *ngIf="newTicketAttachedFile" class="flex items-center gap-[8px] text-[13px] text-theme-gray dark:text-white/60">
                  <span>{{ newTicketAttachedFile }}</span>
                  <button nz-button nzType="text" nzSize="small" type="button" (click)="newTicketAttachedFile = null">
                    <i nz-icon nzType="close"></i>
                  </button>
                </div>
              </div>
            </nz-form-control>
          </nz-form-item>
          </ng-container>
        </form>
    </ng-template>
    <ng-template #tplFooter let-ref="modalRef">
      <button nz-button nzType="primary" (click)="destroyTplModal(ref)" [nzLoading]="tplModalButtonLoading">
        Submit Ticket
      </button>
    </ng-template>
    <ng-template #detailTplTitle>
      <span>Chi tiết Ticket #{{ selectedTicket?.id }}</span>
    </ng-template>
    <ng-template #detailTplContent>
      <div class="flex flex-col gap-[18px]" *ngIf="selectedTicket as ticket">
        <div class="flex items-center justify-between flex-wrap gap-[10px]">
          <span class="text-[13px] font-medium text-theme-gray dark:text-white/60">Trạng thái:
            <span class="inline-flex items-center justify-center bg-{{ ticket.status }}/10 text-{{ ticket.status }} min-h-[24px] px-3 text-xs font-medium rounded-[15px] capitalize">
              {{ ticket.actions }}
            </span>
          </span>
          <span class="text-[13px] font-medium text-theme-gray dark:text-white/60">Ưu tiên: <span class="font-semibold text-dark dark:text-white/[.87]">{{ ticket.priority }}</span></span>
          <span class="text-[13px] font-medium text-theme-gray dark:text-white/60">Chủ đề: <span class="font-semibold text-dark dark:text-white/[.87]">{{ ticket.topicName }}</span></span>
        </div>
        <div>
          <div class="text-[13px] font-semibold text-theme-gray dark:text-white/60 mb-1">Tiêu đề</div>
          <div class="text-[15px] font-medium text-dark dark:text-white/[.87]">{{ ticket.subject }}</div>
        </div>
        <div>
          <div class="text-[13px] font-semibold text-theme-gray dark:text-white/60 mb-1">Nội dung</div>
          <div class="text-[15px] text-dark dark:text-white/[.87] whitespace-pre-line">{{ ticket.content }}</div>
        </div>
        <div class="grid grid-cols-2 gap-[16px]">
          <div>
            <div class="text-[13px] font-semibold text-theme-gray dark:text-white/60 mb-1">Người tạo</div>
            <div class="flex items-center">
              <img class="w-[28px] h-[28px] rounded-4 me-2" src="assets/images/avatars/{{ ticket.creatorUser }}" alt="{{ ticket.creatorName }}">
              <div>
                <span class="block text-[15px] font-medium text-dark dark:text-white/[.87]">{{ ticket.creatorName }}</span>
                <span class="block text-[13px] text-theme-gray dark:text-white/60">{{ ticket.creatorPhone }}</span>
                <span class="block text-[13px] text-theme-gray dark:text-white/60">{{ ticket.creatorEmail }}</span>
              </div>
            </div>
          </div>
          <div>
            <div class="text-[13px] font-semibold text-theme-gray dark:text-white/60 mb-1">Người xử lý</div>
            <div class="flex items-center">
              <img class="w-[28px] h-[28px] rounded-4 me-2" src="assets/images/avatars/{{ ticket.assignedUser }}" alt="{{ ticket.assignedName }}">
              <div>
                <span class="block text-[15px] font-medium text-dark dark:text-white/[.87]">{{ ticket.assignedName }}</span>
                <span class="block text-[13px] text-theme-gray dark:text-white/60">{{ ticket.assignedPhone }}</span>
                <span class="block text-[13px] text-theme-gray dark:text-white/60">{{ ticket.assignedEmail }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-[16px]">
          <div>
            <div class="text-[13px] font-semibold text-theme-gray dark:text-white/60 mb-1">Ngày tạo</div>
            <div class="text-[15px] text-dark dark:text-white/[.87]">{{ ticket.createdDate }}</div>
          </div>
          <div>
            <div class="text-[13px] font-semibold text-theme-gray dark:text-white/60 mb-1">Ngày đến hạn</div>
            <div class="text-[15px] text-dark dark:text-white/[.87]">{{ ticket.dueDate }}</div>
          </div>
          <div>
            <div class="text-[13px] font-semibold text-theme-gray dark:text-white/60 mb-1">Ngày đóng</div>
            <div class="text-[15px] text-dark dark:text-white/[.87]">{{ ticket.closedDate || 'Chưa đóng' }}</div>
          </div>
        </div>
        <div *ngIf="ticket.attachedFile">
          <div class="text-[13px] font-semibold text-theme-gray dark:text-white/60 mb-1">Tệp đính kèm</div>
          <div class="text-[15px] text-primary font-medium">{{ ticket.attachedFile }}</div>
        </div>
        <div *ngIf="ticket.response" class="pt-[18px] border-t border-regular dark:border-white/10">
          <div class="text-[13px] font-semibold text-theme-gray dark:text-white/60 mb-[15px]">Phản hồi</div>
          <div class="flex items-start w-full gap-[10px]">
            <div class="rounded-full relative inline-flex items-center justify-center">
              <img src="assets/images/avatars/{{ ticket.assignedUser }}" class="bg-gray dark:bg-white/10 w-[30px] h-[30px] rounded-full" alt="{{ ticket.assignedName }}">
            </div>
            <div class="flex items-center justify-between flex-wrap w-full">
              <div>
                <h6 class="text-[14px] font-medium leading-[1.4285714286] text-dark dark:text-white/[.87]">{{ ticket.assignedName }}</h6>
                <div class="text-limit">
                  <p class="text-[16px] font-normal leading-[1.6875] text-theme-gray dark:text-white/60 whitespace-pre-line">{{ ticket.response }}</p>
                </div>
              </div>
              <div class="last-chat-time" *ngIf="ticket.closedDate">
                <small class="text-light dark:text-white/60">{{ ticket.closedDate }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ng-template>
    <ng-template #detailTplFooter let-ref="modalRef">
      <button nz-button (click)="destroyDetailModal(ref)">
        Đóng
      </button>
    </ng-template>
  `,
})

export class TicketTableComponent implements OnInit {
  @ViewChild('tplTitle') tplTitle!: TemplateRef<{}>;
  @ViewChild('tplContent') tplContent!: TemplateRef<{}>;
  @ViewChild('tplFooter') tplFooter!: TemplateRef<{}>;
  @ViewChild('detailTplTitle') detailTplTitle!: TemplateRef<{}>;
  @ViewChild('detailTplContent') detailTplContent!: TemplateRef<{}>;
  @ViewChild('detailTplFooter') detailTplFooter!: TemplateRef<{}>;

  searchValue = '';
  statusFilter = '';
  priorityFilter = '';
  topicFilter = '';
  createdDateRange: Date[] | null = null;
  dueDateRange: Date[] | null = null;
  people: Person[] = [];
  filteredPeople: Person[] = [];
  modalRef?: NzModalRef;
  tplModalButtonLoading = false;

  viewModalRef?: NzModalRef;
  selectedTicket: Person | null = null;

  sortField: SortField | null = null;
  sortOrder: SortOrder = 'asc';

  pageIndex = 1;
  readonly pageSize = 10;

  // Options for the "Chủ đề" dropdown in the Tạo Ticket modal; the rest of
  // the form only renders once one of these has been picked.
  readonly topicOptions: string[] = ['P.CNTT', 'Hỗ trợ kĩ thuật', 'Hỗ trợ ứng dụng'];
  newTicketTopic: string | null = null;
  newTicketAttachedFile: string | null = null;

  // Maps the dropdown's filter values to the actual Vietnamese/English
  // values stored in the `actions` field of the JSON data.
  private readonly statusMap: { [key: string]: string } = {
    open: 'Mở',
    close: 'Đóng',
    overdue: 'Quá hạn'
  };

  // Custom priority ranking so "Gấp" sorts above "Cao", "Trung bình", and "Thấp"
  // instead of relying on alphabetical order.
  private readonly priorityRank: { [key: string]: number } = {
    'Gấp': 4,
    'Cao': 3,
    'Trung bình': 2,
    'Thấp': 1
  };

  // Custom status ranking so the Trạng thái column sorts in a logical
  // lifecycle order (Mở -> Quá hạn -> Đóng) instead of alphabetically.
  private readonly statusRank: { [key: string]: number } = {
    'Mở': 1,
    'Quá hạn': 2,
    'Đóng': 3
  };

  constructor(private http: HttpClient, private modal: NzModalService) {}

  /** The slice of filteredPeople shown on the current page (10 items per page). */
  get pagedPeople(): Person[] {
    const start = (this.pageIndex - 1) * this.pageSize;
    return this.filteredPeople.slice(start, start + this.pageSize);
  }

  /** Unique list of topic names present in the loaded ticket data, used for
   * the topic filter dropdown. */
  get topicFilterOptions(): string[] {
    const seen = new Set<string>();
    for (const p of this.people) {
      if (p.topicName) {
        seen.add(p.topicName);
      }
    }
    return Array.from(seen.values());
  }

  onPageIndexChange(pageIndex: number): void {
    this.pageIndex = pageIndex;
  }

  viewTicket(person: Person): void {
    this.selectedTicket = person;
    this.viewModalRef = this.modal.create({
      nzTitle: this.detailTplTitle,
      nzContent: this.detailTplContent,
      nzFooter: this.detailTplFooter,
      nzMaskClosable: true,
      nzClosable: true,
      nzWidth: 620
    });
    // Only clear the selected ticket once the modal has fully finished closing
    // (whichever way it was closed), so the content doesn't disappear mid-animation.
    this.viewModalRef.afterClose.subscribe(() => {
      this.selectedTicket = null;
    });
  }

  destroyDetailModal(modalRef?: NzModalRef): void {
    if (modalRef) {
      modalRef.destroy();
    }
  }

  ngOnInit(): void {
    this.http.get<Person[]>('assets/data/features/ticket-table.json').subscribe(
      (data) => {
        this.people = data;
        this.filteredPeople = this.applyAll();
      },
      (error) => {
        console.log('Error reading JSON file:', error);
      }
    );
  }

  onSearchChange(): void {
    this.pageIndex = 1;
    this.filteredPeople = this.applyAll();
  }

  filterByStatus(): void {
    this.pageIndex = 1;
    this.filteredPeople = this.applyAll();
  }

  filterByPriority(): void {
    this.pageIndex = 1;
    this.filteredPeople = this.applyAll();
  }

  filterByTopic(): void {
    this.pageIndex = 1;
    this.filteredPeople = this.applyAll();
  }

  filterByCreatedDateRange(): void {
    this.pageIndex = 1;
    this.filteredPeople = this.applyAll();
  }

  filterByDueDateRange(): void {
    this.pageIndex = 1;
    this.filteredPeople = this.applyAll();
  }

  /** Called when the "Sắp xếp theo" dropdown changes; keeps current order (or defaults to asc). */
  onSortFieldChange(): void {
    this.filteredPeople = this.applyAll();
  }

  /** Called when a table header is clicked. Clicking the same field flips asc/desc. */
  toggleSort(field: SortField): void {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'asc';
    }
    this.filteredPeople = this.applyAll();
  }

  /** Returns a small arrow indicator for the currently active sort column, used in the template. */
  sortArrow(field: SortField): string {
    if (this.sortField !== field) {
      return '';
    }
    return this.sortOrder === 'asc' ? ' ▲' : ' ▼';
  }

  /** Parses a "dd/MM/yyyy" string into a real Date so date columns sort chronologically, not alphabetically. */
  private parseDate(dateStr: string): number {
    const [day, month, year] = dateStr.split('/').map(Number);
    if (!day || !month || !year) {
      return 0;
    }
    return new Date(year, month - 1, day).getTime();
  }

  /** Checks whether a "dd/MM/yyyy" date string falls within a [start, end] range (inclusive, day-level precision). */
  private isWithinRange(dateStr: string, range: Date[] | null): boolean {
    if (!range || range.length !== 2 || !range[0] || !range[1]) {
      return true;
    }
    const value = this.parseDate(dateStr);
    const start = new Date(range[0].getFullYear(), range[0].getMonth(), range[0].getDate()).getTime();
    const end = new Date(range[1].getFullYear(), range[1].getMonth(), range[1].getDate()).getTime();
    return value >= start && value <= end;
  }

  /** Runs the combined pipeline: search by id-or-name -> filter by status/priority/date ranges -> sort. */
  private applyAll(): Person[] {
    const searchQuery = this.searchValue.trim().toLowerCase();
    const mappedStatus = this.statusFilter && this.statusFilter !== 'all'
      ? this.statusMap[this.statusFilter]
      : null;

    let result = this.people.filter((person) => {
      const matchesSearch = !searchQuery ||
        person.id.toLowerCase().includes(searchQuery) ||
        person.creatorName.toLowerCase().includes(searchQuery) ||
        person.assignedName.toLowerCase().includes(searchQuery);
      const matchesStatus = !mappedStatus || person.actions === mappedStatus;
      const matchesPriority = !this.priorityFilter || person.priority === this.priorityFilter;
      const matchesTopic = !this.topicFilter || person.topicName === this.topicFilter;
      const matchesCreatedRange = this.isWithinRange(person.createdDate, this.createdDateRange);
      const matchesDueRange = this.isWithinRange(person.dueDate, this.dueDateRange);
      return matchesSearch && matchesStatus && matchesPriority && matchesTopic && matchesCreatedRange && matchesDueRange;
    });

    if (this.sortField) {
      result = this.sortPeople(result, this.sortField, this.sortOrder);
    }

    return result;
  }

  private sortPeople(list: Person[], field: SortField, order: SortOrder): Person[] {
    const sorted = [...list].sort((a, b) => {
      let comparison = 0;

      switch (field) {
        case 'id':
          comparison = a.id.localeCompare(b.id, undefined, { numeric: true });
          break;
        case 'assignedName':
          comparison = a.assignedName.localeCompare(b.assignedName);
          break;
        case 'priority':
          comparison = (this.priorityRank[a.priority] ?? 0) - (this.priorityRank[b.priority] ?? 0);
          break;
        case 'topicName':
          comparison = a.topicName.localeCompare(b.topicName);
          break;
        case 'actions':
          comparison = (this.statusRank[a.actions] ?? 0) - (this.statusRank[b.actions] ?? 0);
          break;
        case 'createdDate':
          comparison = this.parseDate(a.createdDate) - this.parseDate(b.createdDate);
          break;
        case 'dueDate':
          comparison = this.parseDate(a.dueDate) - this.parseDate(b.dueDate);
          break;
      }

      return order === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }

  createTplModal(tplTitle?: TemplateRef<{}>, tplContent?: TemplateRef<{}>, tplFooter?: TemplateRef<{}>): void {
    this.newTicketTopic = null;
    this.newTicketAttachedFile = null;
    this.modalRef = this.modal.create({
      nzTitle: tplTitle,
      nzContent: tplContent,
      nzFooter: tplFooter,
      nzMaskClosable: true,
      nzClosable: true,
      nzWidth: 620,
      nzOnOk: () => console.log('Click ok')
    });
  }

  destroyTplModal(modalRef?: NzModalRef): void {
    if (modalRef) {
      modalRef.destroy();
    }
    this.newTicketTopic = null;
    this.newTicketAttachedFile = null;
  }

  /** Captures the chosen file's name for the create-ticket form without actually
   * uploading it anywhere — returning false stops NG-ZORRO's default upload behavior. */
  beforeUploadTicketFile = (file: NzUploadFile): boolean => {
    this.newTicketAttachedFile = file.name;
    return false;
  };
}