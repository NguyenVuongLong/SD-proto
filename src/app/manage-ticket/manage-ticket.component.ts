import { Component, TemplateRef, OnInit, ViewChild, ElementRef } from '@angular/core';
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
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzGridModule } from 'ng-zorro-antd/grid';

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
  creatorDept: string;
  assignedUser: string;
  assignedName: string;
  assignedPhone: string;
  assignedDept: string;
  createdDate: string;
  dueDate: string;
  closedDate: string;
  response: string;
  topicName: string;
}

type SortField = 'id' | 'creatorName' | 'priority' | 'actions' | 'createdDate' | 'dueDate' | 'topicName';
type SortOrder = 'asc' | 'desc';

@Component({
  selector: 'manage-ticket',
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
    PerfectScrollbarModule,
    NzSkeletonModule,
    NzGridModule
  ],
  providers: [
    {
        provide: PERFECT_SCROLLBAR_CONFIG,
        useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ],
  styleUrls: ['./manage-ticket.component.scss'],
  template: `
    <ng-template #loadingSkeleton>
      <nz-skeleton class="bg-white dark:bg-white/10 rounded-6 p-[30px] pt-[15px]" nzShape="circle" [nzAvatar]="true" [nzActive]="true"
        [nzParagraph]="{ rows: 15 }"></nz-skeleton>
    </ng-template>
    <ng-container *ngIf="showContent; else loadingSkeleton">
    <div class="bg-white dark:bg-white/10 m-0 p-0 text-theme-gray dark:text-white/60 text-[15px] rounded-10 relative mb-[25px]">
      <div class="pt-[30px] pb-[9px] px-[25px] text-dark dark:text-white/[.87] font-medium text-[17px] flex items-center justify-between max-sm:flex-col max-sm:gap-[15px]">
        <h4 class="mb-0 text-[20px] leading-6 font-medium text-dark dark:text-white/[.87]">Quản lý Ticket</h4>
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
                (ngModelChange)="onStatusFilterChange($event)" nzPlaceHolder="Tìm theo trạng thái" nzAllowClear nzMode="multiple"
              >
                <nz-option-group nzLabel="Trạng thái xử lý">
                  <nz-option nzValue="open" nzLabel="Mở"></nz-option>
                  <nz-option nzValue="progress" nzLabel="Đang xử lý"></nz-option>
                  <nz-option nzValue="close" nzLabel="Hoàn thành"></nz-option>
                </nz-option-group>
                <nz-option-group nzLabel="Tiến độ">
                  <nz-option nzValue="ontrack" nzLabel="Đúng tiến độ"></nz-option>
                  <nz-option nzValue="overdue" nzLabel="Trễ hạn"></nz-option>
                </nz-option-group>
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
                    <th class="bg-regularBG dark:bg-[#323440] px-[20px] py-[16px] text-start text-dark dark:text-white/[.87] text-[15px] font-medium border-none before:hidden capitalize cursor-pointer select-none" (click)="toggleSort('creatorName')">Người tạo{{ sortArrow('creatorName') }}</th>
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
                        <img class="min-w-[34px] h-[34px] rounded-4" src="assets/images/avatars/{{person.creatorUser}}" alt="Samsung Galaxy S8 256GB">
                      </div>
                      <div>
                        <span class="font-medium capitalize text-dark dark:text-white/[.87] text-15 block">{{ person.creatorName }}</span>
                        <div class="text-[12px] leading-[1.6] text-light dark:text-white/60 whitespace-nowrap">
                          <div>{{ person.creatorPhone }}</div>
                          <div>{{ person.creatorDept }}</div>
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
                      <span
                        class="block mt-1 text-[11px] font-medium capitalize bg-{{ getScheduleStatusColor(person) }}/10 text-{{ getScheduleStatusColor(person) }} px-2 py-0.5 rounded-[15px] w-fit"
                      >
                        {{ getScheduleStatus(person) }}
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
    </ng-container>
    
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
            <span class="inline-flex items-center ms-1 text-[11px] font-medium capitalize bg-{{ getScheduleStatusColor(ticket) }}/10 text-{{ getScheduleStatusColor(ticket) }} px-2 py-0.5 rounded-[15px]">
              {{ getScheduleStatus(ticket) }}
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
                <span class="block text-[13px] text-theme-gray dark:text-white/60">{{ ticket.creatorDept }}</span>
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
                <span class="block text-[13px] text-theme-gray dark:text-white/60">{{ ticket.assignedDept }}</span>
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
            <div class="text-[13px] font-semibold text-theme-gray dark:text-white/60 mb-1">Ngày hoàn thành</div>
            <div class="text-[15px] text-dark dark:text-white/[.87]">{{ ticket.closedDate || 'Chưa hoàn thành' }}</div>
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
        <div class="flex flex-col gap-[10px]">
          <textarea
            class="w-full px-[15px] py-[10px] text-body dark:text-white/60 bg-white dark:bg-white/10 border-normal border-1 dark:border-white/10 rounded-[6px] resize-y"
            nz-input
            rows="4"
            placeholder="Nhập phản hồi..."
            name="newResponseText"
            [(ngModel)]="newResponseText"
          ></textarea>
          <input
            #responseFileInput
            type="file"
            multiple
            class="hidden"
            (change)="onResponseFilesSelected($event)"
          />
          <div class="flex items-center justify-between flex-wrap gap-[10px]">
            <button nz-button class="inline-flex items-center gap-[6px]" (click)="responseFileInput.click()">
              <i nz-icon nzType="paper-clip" nzTheme="outline"></i>
              <span>Đính kèm tệp</span>
            </button>
            <button nz-button nzType="primary" (click)="sendResponse()">Gửi</button>
          </div>
          <div class="flex flex-wrap gap-[8px]" *ngIf="newResponseFiles.length">
            <span
              *ngFor="let file of newResponseFiles; let i = index"
              class="inline-flex items-center gap-[6px] bg-regularBG dark:bg-[#323440] text-theme-gray dark:text-white/60 text-[13px] px-[10px] py-[4px] rounded-[15px]"
            >
              {{ file.name }}
              <i nz-icon nzType="close" nzTheme="outline" class="cursor-pointer" (click)="removeResponseFile(i)"></i>
            </span>
          </div>
        </div>
        <div class="flex flex-nowrap items-center justify-center gap-[10px] pt-[18px] border-t border-regular dark:border-white/10 overflow-x-auto whitespace-nowrap">
          <button nz-button (click)="openChangeAssigneeTopicModal()">Đổi người xử lý &amp; chủ đề</button>
          <button nz-button (click)="openChangePriorityModal()">Đổi ưu tiên</button>
          <button nz-button (click)="openChangeDueDateModal()">Đổi ngày đến hạn</button>
          <button *ngIf="ticket.actions !== 'Hoàn thành'" nz-button nzType="primary" nzDanger (click)="closeTicket()">Đánh dấu hoàn thành</button>
          <button *ngIf="ticket.actions === 'Hoàn thành'" nz-button nzType="primary" (click)="reopenTicket()">Mở lại ticket</button>
        </div>
      </div>
    </ng-template>
    <ng-template #detailTplFooter let-ref="modalRef">
      <div class="detail-footer">
        <button nz-button (click)="destroyDetailModal(ref)">
          Đóng
        </button>
      </div>
    </ng-template>
    <ng-template #assigneeTopicTplTitle>
      <span>Đổi người xử lý &amp; chủ đề</span>
    </ng-template>
    <ng-template #assigneeTopicTplContent>
      <div class="flex flex-col gap-[16px]">
        <div>
          <div class="text-[13px] font-semibold text-theme-gray dark:text-white/60 mb-1">Người xử lý</div>
          <nz-select
            class="w-full capitalize [&>nz-select-top-control]:border-normal dark:[&>nz-select-top-control]:border-white/10 [&>nz-select-top-control]:bg-white [&>nz-select-top-control]:dark:bg-white/10 [&>nz-select-top-control]:shadow-none [&>nz-select-top-control]:text-dark [&>nz-select-top-control]:dark:text-white/60 [&>nz-select-top-control]:h-[44px] [&>nz-select-top-control]:flex [&>nz-select-top-control]:items-center [&>nz-select-top-control]:rounded-[6px] [&>nz-select-top-control]:px-[15px]"
            [(ngModel)]="selectedNewAssignedUser"
            name="newAssignee"
            nzPlaceHolder="Chọn người xử lý"
          >
            <nz-option *ngFor="let a of assigneeOptions" [nzValue]="a.user" [nzLabel]="a.name"></nz-option>
          </nz-select>
        </div>
        <div>
          <div class="text-[13px] font-semibold text-theme-gray dark:text-white/60 mb-1">Chủ đề</div>
          <nz-select
            class="w-full capitalize [&>nz-select-top-control]:border-normal dark:[&>nz-select-top-control]:border-white/10 [&>nz-select-top-control]:bg-white [&>nz-select-top-control]:dark:bg-white/10 [&>nz-select-top-control]:shadow-none [&>nz-select-top-control]:text-dark [&>nz-select-top-control]:dark:text-white/60 [&>nz-select-top-control]:h-[44px] [&>nz-select-top-control]:flex [&>nz-select-top-control]:items-center [&>nz-select-top-control]:rounded-[6px] [&>nz-select-top-control]:px-[15px]"
            [(ngModel)]="selectedNewTopic"
            name="newTopic"
            nzPlaceHolder="Chọn chủ đề"
          >
            <nz-option *ngFor="let t of topicFilterOptions" [nzValue]="t" [nzLabel]="t"></nz-option>
          </nz-select>
        </div>
      </div>
    </ng-template>
    <ng-template #assigneeTopicTplFooter let-ref="modalRef">
      <button nz-button (click)="ref.destroy()">Hủy</button>
      <button nz-button nzType="primary" (click)="confirmChangeAssigneeTopic(ref)">Lưu</button>
    </ng-template>
    <ng-template #priorityTplTitle>
      <span>Đổi ưu tiên</span>
    </ng-template>
    <ng-template #priorityTplContent>
      <nz-select
        class="w-full capitalize [&>nz-select-top-control]:border-normal dark:[&>nz-select-top-control]:border-white/10 [&>nz-select-top-control]:bg-white [&>nz-select-top-control]:dark:bg-white/10 [&>nz-select-top-control]:shadow-none [&>nz-select-top-control]:text-dark [&>nz-select-top-control]:dark:text-white/60 [&>nz-select-top-control]:h-[44px] [&>nz-select-top-control]:flex [&>nz-select-top-control]:items-center [&>nz-select-top-control]:rounded-[6px] [&>nz-select-top-control]:px-[15px]"
        [(ngModel)]="selectedNewPriority"
        name="newPriority"
        nzPlaceHolder="Chọn mức độ ưu tiên"
      >
        <nz-option *ngFor="let p of priorityOptions" [nzValue]="p" [nzLabel]="p"></nz-option>
      </nz-select>
    </ng-template>
    <ng-template #priorityTplFooter let-ref="modalRef">
      <button nz-button (click)="ref.destroy()">Hủy</button>
      <button nz-button nzType="primary" (click)="confirmChangePriority(ref)">Lưu</button>
    </ng-template>
    <ng-template #dueDateTplTitle>
      <span>Đổi ngày hết hạn</span>
    </ng-template>
    <ng-template #dueDateTplContent>
      <nz-date-picker
        class="w-full h-[44px]"
        nzFormat="dd/MM/yyyy"
        [(ngModel)]="selectedNewDueDate"
        name="newDueDate"
      ></nz-date-picker>
    </ng-template>
    <ng-template #dueDateTplFooter let-ref="modalRef">
      <button nz-button (click)="ref.destroy()">Hủy</button>
      <button nz-button nzType="primary" (click)="confirmChangeDueDate(ref)">Lưu</button>
    </ng-template>
  `,
})

export class ManageTicketComponent implements OnInit {
  @ViewChild('tplTitle') tplTitle!: TemplateRef<{}>;
  @ViewChild('tplContent') tplContent!: TemplateRef<{}>;
  @ViewChild('tplFooter') tplFooter!: TemplateRef<{}>;
  @ViewChild('detailTplTitle') detailTplTitle!: TemplateRef<{}>;
  @ViewChild('detailTplContent') detailTplContent!: TemplateRef<{}>;
  @ViewChild('detailTplFooter') detailTplFooter!: TemplateRef<{}>;
  @ViewChild('assigneeTopicTplTitle') assigneeTopicTplTitle!: TemplateRef<{}>;
  @ViewChild('assigneeTopicTplContent') assigneeTopicTplContent!: TemplateRef<{}>;
  @ViewChild('assigneeTopicTplFooter') assigneeTopicTplFooter!: TemplateRef<{}>;
  @ViewChild('priorityTplTitle') priorityTplTitle!: TemplateRef<{}>;
  @ViewChild('priorityTplContent') priorityTplContent!: TemplateRef<{}>;
  @ViewChild('priorityTplFooter') priorityTplFooter!: TemplateRef<{}>;
  @ViewChild('dueDateTplTitle') dueDateTplTitle!: TemplateRef<{}>;
  @ViewChild('dueDateTplContent') dueDateTplContent!: TemplateRef<{}>;
  @ViewChild('dueDateTplFooter') dueDateTplFooter!: TemplateRef<{}>;

  searchValue = '';
  statusFilter: string[] = [];
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

  // Sub-dialogs launched from within the ticket detail dialog.
  subModalRef?: NzModalRef;
  selectedNewAssignedUser: string | null = null;
  selectedNewPriority: string | null = null;
  selectedNewTopic: string | null = null;
  selectedNewDueDate: Date | null = null;
  newResponseText = '';
  newResponseFiles: File[] = [];

  readonly priorityOptions: string[] = ['Gấp', 'Cao', 'Trung bình', 'Thấp'];

  sortField: SortField | null = null;
  sortOrder: SortOrder = 'asc';

  pageIndex = 1;
  readonly pageSize = 10;

  // Options for the "Chủ đề" dropdown in the Tạo Ticket modal; the rest of
  // the form only renders once one of these has been picked.
  readonly topicOptions: string[] = ['P.CNTT', 'Hỗ trợ kĩ thuật', 'Hỗ trợ ứng dụng'];
  newTicketTopic: string | null = null;

  // Maps the dropdown's filter values to the actual Vietnamese/English
  // values stored in the `actions` field of the JSON data.
  private readonly statusMap: { [key: string]: string } = {
    open: 'Mở',
    close: 'Hoàn thành',
    progress: 'Đang xử lý'
  };

  // Maps the dropdown's schedule-status filter values to the labels
  // returned by getScheduleStatus().
  private readonly scheduleStatusMap: { [key: string]: string } = {
    ontrack: 'Đúng tiến độ',
    overdue: 'Trễ hạn'
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
    'Đang xử lý': 2,
    'Hoàn thành': 3
  };

  constructor(private http: HttpClient, private modal: NzModalService) {}

  /** The slice of filteredPeople shown on the current page (10 items per page). */
  get pagedPeople(): Person[] {
    const start = (this.pageIndex - 1) * this.pageSize;
    return this.filteredPeople.slice(start, start + this.pageSize);
  }

  /** Unique list of people who can be assigned a ticket, derived from everyone
   * who has ever been an assignee in the loaded data. */
  get assigneeOptions(): { user: string; name: string; phone: string; email: string }[] {
    const seen = new Map<string, { user: string; name: string; phone: string; email: string }>();
    for (const p of this.people) {
      if (!seen.has(p.assignedUser)) {
        seen.set(p.assignedUser, { user: p.assignedUser, name: p.assignedName, phone: p.assignedPhone, email: p.assignedDept });
      }
    }
    return Array.from(seen.values());
  }

  /** Unique list of topic names present in the loaded ticket data, used for
   * both the topic filter dropdown and the "Đổi chủ đề" change dialog. */
  get topicFilterOptions(): string[] {
    const seen = new Set<string>();
    for (const p of this.people) {
      if (p.topicName) {
        seen.add(p.topicName);
      }
    }
    return Array.from(seen.values());
  }

  isLoading = true;
  showContent = false;

  loadData() {
    // Simulate an asynchronous data loading operation
    setTimeout(() => {
      this.isLoading = false;
      this.showContent = true;
    }, 500);
  }

  onPageIndexChange(pageIndex: number): void {
    this.pageIndex = pageIndex;
  }

  viewTicket(person: Person): void {
    this.selectedTicket = person;
    this.newResponseText = '';
    this.newResponseFiles = [];
    this.viewModalRef = this.modal.create({
      nzTitle: this.detailTplTitle,
      nzContent: this.detailTplContent,
      nzFooter: this.detailTplFooter,
      nzMaskClosable: true,
      nzClosable: true,
      nzWidth: 700
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

  // --- Change Người xử lý & Chủ đề ---
  openChangeAssigneeTopicModal(): void {
    if (!this.selectedTicket) {
      return;
    }
    this.selectedNewAssignedUser = this.selectedTicket.assignedUser;
    this.selectedNewTopic = this.selectedTicket.topicName;
    this.subModalRef = this.modal.create({
      nzTitle: this.assigneeTopicTplTitle,
      nzContent: this.assigneeTopicTplContent,
      nzFooter: this.assigneeTopicTplFooter,
      nzMaskClosable: true,
      nzClosable: true,
      nzWidth: 420
    });
  }

  confirmChangeAssigneeTopic(modalRef?: NzModalRef): void {
    if (this.selectedTicket) {
      if (this.selectedNewAssignedUser) {
        const chosen = this.assigneeOptions.find((a) => a.user === this.selectedNewAssignedUser);
        if (chosen) {
          this.selectedTicket.assignedUser = chosen.user;
          this.selectedTicket.assignedName = chosen.name;
          this.selectedTicket.assignedPhone = chosen.phone;
          this.selectedTicket.assignedDept = chosen.email;
        }
      }
      if (this.selectedNewTopic) {
        this.selectedTicket.topicName = this.selectedNewTopic;
      }
    }
    if (modalRef) {
      modalRef.destroy();
    }
  }

  // --- Change Ưu tiên ---
  openChangePriorityModal(): void {
    if (!this.selectedTicket) {
      return;
    }
    this.selectedNewPriority = this.selectedTicket.priority;
    this.subModalRef = this.modal.create({
      nzTitle: this.priorityTplTitle,
      nzContent: this.priorityTplContent,
      nzFooter: this.priorityTplFooter,
      nzMaskClosable: true,
      nzClosable: true,
      nzWidth: 380
    });
  }

  confirmChangePriority(modalRef?: NzModalRef): void {
    if (this.selectedTicket && this.selectedNewPriority) {
      this.selectedTicket.priority = this.selectedNewPriority;
    }
    if (modalRef) {
      modalRef.destroy();
    }
  }

  // --- Change Ngày hết hạn ---
  openChangeDueDateModal(): void {
    if (!this.selectedTicket) {
      return;
    }
    this.selectedNewDueDate = this.parseDateToDate(this.selectedTicket.dueDate);
    this.subModalRef = this.modal.create({
      nzTitle: this.dueDateTplTitle,
      nzContent: this.dueDateTplContent,
      nzFooter: this.dueDateTplFooter,
      nzMaskClosable: true,
      nzClosable: true,
      nzWidth: 380
    });
  }

  confirmChangeDueDate(modalRef?: NzModalRef): void {
    if (this.selectedTicket && this.selectedNewDueDate) {
      this.selectedTicket.dueDate = this.formatDateForStorage(this.selectedNewDueDate);
    }
    if (modalRef) {
      modalRef.destroy();
    }
  }

  // --- Close ticket ---
  closeTicket(): void {
    if (!this.selectedTicket || this.selectedTicket.actions === 'Hoàn thành') {
      return;
    }
    this.selectedTicket.actions = 'Hoàn thành';
    this.selectedTicket.status = 'success';
    this.selectedTicket.closedDate = this.formatDateForStorage(new Date());
  }

  // --- Reopen ticket ---
  reopenTicket(): void {
    if (!this.selectedTicket || this.selectedTicket.actions !== 'Hoàn thành') {
      return;
    }
    this.selectedTicket.actions = 'Mở';
    this.selectedTicket.status = 'secondary';
    this.selectedTicket.closedDate = '';
  }

  // --- Send Phản hồi ---
  onResponseFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.newResponseFiles.push(...Array.from(input.files));
    }
    input.value = '';
  }

  removeResponseFile(index: number): void {
    this.newResponseFiles.splice(index, 1);
  }

  sendResponse(): void {
    const text = this.newResponseText.trim();
    if (!this.selectedTicket || (!text && !this.newResponseFiles.length)) {
      return;
    }
    this.selectedTicket.response = text;
    this.newResponseText = '';
    this.newResponseFiles = [];
  }

  /** Parses a "dd/MM/yyyy" string into a Date for pre-filling a date picker. */
  private parseDateToDate(dateStr: string): Date | null {
    if (!dateStr) {
      return null;
    }
    const [day, month, year] = dateStr.split('/').map(Number);
    if (!day || !month || !year) {
      return null;
    }
    return new Date(year, month - 1, day);
  }

  /** Formats a Date back into the "dd/MM/yyyy" string format used throughout the ticket data. */
  private formatDateForStorage(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  ngOnInit(): void {
    this.loadData();
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

  /**
   * The Trạng thái filter has two independent option sets ("Trạng thái xử lý" and
   * "Tiến độ"). Picking a new option within a set replaces whichever was already
   * selected in that same set, so at most one value per set can be active at once.
   */
  onStatusFilterChange(values: string[]): void {
    const previous = this.statusFilter;
    let constrained = this.keepLatestPerGroup(values, previous, Object.keys(this.statusMap));
    constrained = this.keepLatestPerGroup(constrained, previous, Object.keys(this.scheduleStatusMap));
    this.statusFilter = constrained;
    this.filterByStatus();
  }

  /** Within a single option group, keeps only the most recently added value (or the last one if none is new). */
  private keepLatestPerGroup(values: string[], previous: string[], group: string[]): string[] {
    const selectedInGroup = values.filter((v) => group.includes(v));
    if (selectedInGroup.length <= 1) {
      return values;
    }
    const newlyAdded = selectedInGroup.find((v) => !previous.includes(v));
    const keep = newlyAdded ?? selectedInGroup[selectedInGroup.length - 1];
    return values.filter((v) => !group.includes(v) || v === keep);
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

  /**
   * Schedule status shown under "Trạng thái":
   * - Closed tickets compare their closedDate against dueDate (closed late = Overdue).
   * - Open tickets compare today's date against dueDate (past due, still open = Overdue).
   */
  getScheduleStatus(person: Person): 'Đúng tiến độ' | 'Trễ hạn' {
    const due = this.parseDate(person.dueDate);
    if (!due) {
      return 'Đúng tiến độ';
    }
    if (person.closedDate) {
      const closed = this.parseDate(person.closedDate);
      return closed > due ? 'Trễ hạn' : 'Đúng tiến độ';
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.getTime() > due ? 'Trễ hạn' : 'Đúng tiến độ';
  }

  /** Color token (matches the existing bg-{color}/10 text-{color} badge pattern) for the schedule status. */
  getScheduleStatusColor(person: Person): string {
    return this.getScheduleStatus(person) === 'Trễ hạn' ? 'danger' : 'success';
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
    const selectedAction = this.statusFilter.find((v) => this.statusMap[v]);
    const selectedSchedule = this.statusFilter.find((v) => this.scheduleStatusMap[v]);

    let result = this.people.filter((person) => {
      const matchesSearch = !searchQuery ||
        person.id.toLowerCase().includes(searchQuery) ||
        person.creatorName.toLowerCase().includes(searchQuery) ||
        person.assignedName.toLowerCase().includes(searchQuery);
      const matchesStatus =
        (!selectedAction || person.actions === this.statusMap[selectedAction]) &&
        (!selectedSchedule || this.getScheduleStatus(person) === this.scheduleStatusMap[selectedSchedule]);
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
        case 'creatorName':
          comparison = a.creatorName.localeCompare(b.creatorName);
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
  }
}