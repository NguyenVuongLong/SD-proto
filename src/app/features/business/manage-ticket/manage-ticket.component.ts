import { Component, TemplateRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../../core/services/ticket.service';
import { AuthService } from '../../../shared/services/auth.service';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { DialogService } from '../../../core/services/dialog.service';
import { AttachmentService } from '../../../core/services/attachment.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AttachmentListComponent } from '../../../shared/components/attachment-list.component';
import { finalize, switchMap } from 'rxjs';
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
import { EditorModule } from '@tinymce/tinymce-angular';
import { DEFAULT_EDITOR_INIT, TINYMCE_API_KEY } from '@shared/config';
import { buildTopicFilterGroups, createEmployeeLookups, formatEmployeeName, formatVnDate, isTopicActive, keepLatestPerGroup, parseVnDate, PaginationState } from '@shared/utils';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

interface Person {
  ticketId: string;
  id: string;
  topicId?: string;
  departmentCode: string;
  ticketName?: string;
  ticketContent?: string;
  slaCode: string;
  priority: string;
  statusCode: string;
  assignedDate?: string;
  assignedTo?: string;
  closedBy?: string;
  createdBy?: string;
  subject: string;
  content: string;
  attachedFile: string;
  creatorUser: string;
  creatorName: string;
  creatorPhone: string;
  creatorDept: string;
  assignedUser: string;
  assignedName: string;
  assignedPhone: string;
  assignedDept: string;
  createdDate: string;
  createdTime?: string;
  dueDate: string;
  dueTime?: string;
  closedDate: string;
  closedTime?: string;
  response?: string;
  topicName: string;
}

interface TicketResponse {
  ticketId: string;
  responseId: string;
  content: string;
  createdDate?: string;
  createdBy?: string;
  CreatedBy?: string;
  attachedFiles?: string[];
}

type SortField = 'id' | 'creatorName' | 'priority' | 'statusCode' | 'createdDate' | 'dueDate' | 'topicName';
type SortOrder = 'asc' | 'desc';

@Component({
  selector: 'app-manage-ticket',
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
    NzGridModule,
    EditorModule,
    AttachmentListComponent
  ],
  providers: [
    {
        provide: PERFECT_SCROLLBAR_CONFIG,
        useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ],
  styleUrls: ['./manage-ticket.component.scss'],
  template: `
    <div nz-row [nzGutter]="25">
      <!-- skeleton -->
      <div nz-col nzXs="24" class="mb-[25px]">
        <ng-container>
          <ng-container>
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
                      <nz-option-group *ngFor="let group of topicFilterGroups" [nzLabel]="group.departmentName">
                        <nz-option *ngFor="let t of group.topics" [nzValue]="t" [nzLabel]="t"></nz-option>
                      </nz-option-group>
                    </nz-select>
                  </div>
                  <div class="inline-flex items-center">
                    <nz-select
                      class="min-w-[160px] capitalize [&>nz-select-top-control]:border-normal dark:[&>nz-select-top-control]:border-white/10 [&>nz-select-top-control]:bg-white [&>nz-select-top-control]:dark:bg-white/10 [&>nz-select-top-control]:shadow-none [&>nz-select-top-control]:text-dark [&>nz-select-top-control]:dark:text-white/60 [&>nz-select-top-control]:h-[40px] [&>nz-select-top-control]:flex [&>nz-select-top-control]:items-center [&>nz-select-top-control]:rounded-[6px] [&>nz-select-top-control]:px-[20px] [&>.ant-select-arrow]:text-light dark:[&>.ant-select-arrow]:text-white/60"
                      [(ngModel)]="priorityFilter"
                      (ngModelChange)="filterByPriority()" nzPlaceHolder="Tìm theo ưu tiên" nzAllowClear
                    >
                      <nz-option *ngFor="let p of priorityOptions" [nzValue]="p" [nzLabel]="p"></nz-option>
                    </nz-select>
                  </div>
                  <div class="inline-flex items-center">
                    <nz-select
                      class="min-w-[180px] capitalize [&>nz-select-top-control]:border-normal dark:[&>nz-select-top-control]:border-white/10 [&>nz-select-top-control]:bg-white [&>nz-select-top-control]:dark:bg-white/10 [&>nz-select-top-control]:shadow-none [&>nz-select-top-control]:text-dark [&>nz-select-top-control]:dark:text-white/60 [&>nz-select-top-control]:h-[40px] [&>nz-select-top-control]:flex [&>nz-select-top-control]:items-center [&>nz-select-top-control]:rounded-[6px] [&>nz-select-top-control]:px-[20px] [&>.ant-select-arrow]:text-light dark:[&>.ant-select-arrow]:text-white/60"
                      [(ngModel)]="statusFilter"
                      (ngModelChange)="onStatusFilterChange($event)" nzPlaceHolder="Tìm theo trạng thái" nzAllowClear nzMode="multiple"
                    >
                      <nz-option-group nzLabel="Trạng thái xử lý">
                        <nz-option *ngFor="let status of statusOptions" [nzValue]="status.statusCode" [nzLabel]="status.statusName"></nz-option>
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
                          <th class="bg-regularBG dark:bg-[#323440] px-[20px] py-[16px] text-start text-dark dark:text-white/[.87] text-[15px] font-medium border-none before:hidden capitalize cursor-pointer select-none" (click)="toggleSort('statusCode')">Trạng thái{{ sortArrow('statusCode') }}</th>
                          <th class="bg-regularBG dark:bg-[#323440] px-[20px] py-[16px] text-start text-dark dark:text-white/[.87] text-[15px] font-medium border-none before:hidden capitalize cursor-pointer select-none" (click)="toggleSort('createdDate')">Ngày tạo{{ sortArrow('createdDate') }}</th>
                          <th class="bg-regularBG dark:bg-[#323440] px-[20px] py-[16px] text-start text-dark dark:text-white/[.87] text-[15px] font-medium border-none before:hidden capitalize cursor-pointer select-none" (click)="toggleSort('dueDate')">Ngày đến hạn{{ sortArrow('dueDate') }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr class="table-row-separator group max-lg:whitespace-nowrap cursor-pointer" *ngFor="let person of pagedPeople" (click)="viewTicket(person)">
                          <td class="ltr:pr-[20px] rtl:pl-[20px] text-theme-gray dark:text-white/60 font-medium text-[15px] py-4 before:hidden border-none group-hover:bg-transparent">#{{ person.id }}</td>
                          <td class="ltr:pr-[20px] rtl:pl-[20px] text-theme-gray dark:text-white/60 font-medium text-[15px] py-4 before:hidden border-none group-hover:bg-transparent">{{ person.subject }}</td>
                          <td class="ltr:pr-[20px] rtl:pl-[20px] text-theme-gray dark:text-white/60 font-medium text-[15px] py-4 before:hidden border-none group-hover:bg-transparent">{{ person.topicName }}</td>
                          <td class="ltr:pr-[20px] rtl:pl-[20px] text-theme-gray dark:text-white/60 font-medium text-[15px] py-4 before:hidden border-none group-hover:bg-transparent">
                          <div class="flex items-center">
                            <div class="me-2.5 w-[34px] h-[34px]">
                              <img class="min-w-[34px] h-[34px] rounded-4" src="assets/images/avatars/{{person.creatorUser}}" alt="Samsung Galaxy S8 256GB">
                            </div>
                            <div>
                              <span class="font-medium capitalize text-dark dark:text-white/[.87] text-15 block">{{ getCreatorName(person) }}</span>
                              <div class="text-[12px] leading-[1.6] text-light dark:text-white/60 whitespace-nowrap">
                                <div>{{ person.creatorPhone }}</div>
                                <div>{{ departmentNameByCode[person.creatorDept] || person.creatorDept }}</div>
                              </div>
                            </div>
                          </div>
                          </td>
                          <td class="ltr:pr-[20px] rtl:pl-[20px] text-theme-gray dark:text-white/60 font-medium text-[15px] py-4 before:hidden border-none group-hover:bg-transparent">{{ person.priority }}</td>
                          <td class="ltr:pr-[20px] rtl:pl-[20px] text-theme-gray dark:text-white/60 font-medium text-[15px] py-4 before:hidden border-none group-hover:bg-transparent">
                            <div class="flex flex-col items-center gap-1">
                              <span
                                class="inline-flex w-[110px] h-[24px] max-md:w-[100px] max-md:h-[22px] max-sm:w-[90px] max-sm:h-[20px] items-center justify-center text-center bg-{{ getStatusColor(person.statusCode) }}/10 text-{{ getStatusColor(person.statusCode) }} text-[15px] max-md:text-[13px] max-sm:text-[11px] font-medium rounded-[15px] capitalize whitespace-nowrap"
                              >
                                {{ statusNameByCode[person.statusCode] || person.statusCode }}
                              </span>
                              <span
                                class="inline-flex w-[110px] h-[24px] max-md:w-[100px] max-md:h-[22px] max-sm:w-[90px] max-sm:h-[20px] items-center justify-center text-center text-[15px] max-md:text-[13px] max-sm:text-[11px] font-medium capitalize bg-{{ getScheduleStatusColor(person) }}/10 text-{{ getScheduleStatusColor(person) }} rounded-[15px] whitespace-nowrap"
                              >
                                {{ getScheduleStatus(person) }}
                              </span>
                            </div>
                          </td>
                          <td class="ltr:pr-[20px] rtl:pl-[20px] text-theme-gray dark:text-white/60 font-medium text-[15px] py-4 before:hidden border-none group-hover:bg-transparent">
                            <div>{{ person.createdDate }}</div>
                            <small *ngIf="person.createdTime" class="block text-[12px] text-light dark:text-white/50">{{ person.createdTime }}</small>
                          </td>
                          <td class="ltr:pr-[20px] rtl:pl-[20px] text-theme-gray dark:text-white/60 font-medium text-[15px] py-4 before:hidden border-none group-hover:bg-transparent">
                            <div>{{ person.dueDate }}</div>
                            <small *ngIf="person.dueTime" class="block text-[12px] text-light dark:text-white/50">{{ person.dueTime }}</small>
                          </td>
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
                  <span class="inline-flex items-center justify-center bg-{{ getStatusColor(ticket.statusCode) }}/10 text-{{ getStatusColor(ticket.statusCode) }} min-h-[24px] px-3 text-xs font-medium rounded-[15px] capitalize">
                    {{ statusNameByCode[ticket.statusCode] || ticket.statusCode }}
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
                <div class="text-[15px] text-dark dark:text-white/[.87]" [innerHTML]="ticket.content"></div>
              </div>
              <div class="grid grid-cols-2 gap-[16px]">
                <div>
                  <div class="text-[13px] font-semibold text-theme-gray dark:text-white/60 mb-1">Người tạo</div>
                  <div class="flex items-center">
                    <img class="w-[28px] h-[28px] rounded-4 me-2" src="assets/images/avatars/{{ ticket.creatorUser }}" alt="{{ ticket.creatorName }}">
                    <div>
                      <span class="block text-[15px] font-medium text-dark dark:text-white/[.87]">{{ getCreatorName(ticket) }}</span>
                      <span class="block text-[13px] text-theme-gray dark:text-white/60">{{ ticket.creatorPhone }}</span>
                      <span class="block text-[13px] text-theme-gray dark:text-white/60">{{ departmentNameByCode[ticket.creatorDept] || ticket.creatorDept }}</span>
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
                      <span class="block text-[13px] text-theme-gray dark:text-white/60">{{ departmentNameByCode[ticket.assignedDept] || ticket.assignedDept }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="grid grid-cols-3 gap-[16px]">
                <div>
                  <div class="text-[13px] font-semibold text-theme-gray dark:text-white/60 mb-1">Ngày tạo</div>
                  <div class="text-[15px] text-dark dark:text-white/[.87]">{{ ticket.createdDate }}</div>
                  <small *ngIf="ticket.createdTime" class="block text-[12px] text-light dark:text-white/50">{{ ticket.createdTime }}</small>
                </div>
                <div>
                  <div class="text-[13px] font-semibold text-theme-gray dark:text-white/60 mb-1">Ngày đến hạn</div>
                  <div class="text-[15px] text-dark dark:text-white/[.87]">{{ ticket.dueDate }}</div>
                  <small *ngIf="ticket.dueTime" class="block text-[12px] text-light dark:text-white/50">{{ ticket.dueTime }}</small>
                </div>
                <div>
                  <div class="text-[13px] font-semibold text-theme-gray dark:text-white/60 mb-1">Ngày hoàn thành</div>
                  <div class="text-[15px] text-dark dark:text-white/[.87]">{{ ticket.closedDate || 'Chưa hoàn thành' }}</div>
                  <small *ngIf="ticket.closedTime" class="block text-[12px] text-light dark:text-white/50">{{ ticket.closedTime }}</small>
                </div>
              </div>
              <div *ngIf="ticket.attachedFile">
                <div class="text-[13px] font-semibold text-theme-gray dark:text-white/60 mb-1">Tệp đính kèm</div>
                <app-attachment-list [fileIds]="ticket.attachedFile"></app-attachment-list>
              </div>
              <div *ngIf="selectedTicketResponses.length" class="pt-[18px] border-t border-regular dark:border-white/10">
                <div class="text-[13px] font-semibold text-theme-gray dark:text-white/60 mb-[15px]">Phản hồi</div>
                <div *ngFor="let response of selectedTicketResponses" class="flex items-start w-full gap-[10px] mb-[12px] last:mb-0">
                  <div class="rounded-full relative inline-flex items-center justify-center">
                    <img src="assets/images/avatars/{{ ticket.assignedUser }}" class="bg-gray dark:bg-white/10 w-[30px] h-[30px] rounded-full" alt="{{ ticket.assignedName }}">
                  </div>
                  <div class="flex items-center justify-between flex-wrap w-full">
                    <div>
                      <div class="flex items-center gap-[8px]">
                        <h6 class="text-[14px] font-medium leading-[1.4285714286] text-dark dark:text-white/[.87]">{{ getResponseAuthor(response, ticket.assignedName) }}</h6>
                        <small class="text-light dark:text-white/60">{{ response.createdDate || 'Chưa có thời gian' }}</small>
                      </div>
                      <div class="text-limit">
                        <div class="text-[16px] font-normal leading-[1.6875] text-theme-gray dark:text-white/60" [innerHTML]="response.content"></div>
                      </div>
                      <div class="mt-2" *ngIf="response.attachedFiles?.length">
                        <app-attachment-list [fileIds]="response.attachedFiles"></app-attachment-list>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex flex-col gap-[10px]">
                <editor
                  apiKey="{{ TINYMCE_API_KEY }}"
                  [init]="DEFAULT_EDITOR_INIT"
                  placeholder="Nhập phản hồi..."
                  name="newResponseText"
                  [(ngModel)]="newResponseText"
                ></editor>
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
                  <button nz-button nzType="primary" [nzLoading]="responseSending" (click)="sendResponse()">Gửi</button>
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
                <button *ngIf="ticket.statusCode !== 'closed'" nz-button nzType="primary" nzDanger (click)="closeTicket()">Đánh dấu hoàn thành</button>
                <button *ngIf="ticket.statusCode === 'closed'" nz-button nzType="primary" (click)="reopenTicket()">Mở lại ticket</button>
              </div>
            </div>
          </ng-template>
          <ng-template #detailTplFooter let-ref="modalRef">
            <div class="detail-footer flex items-center justify-between gap-[12px] w-full">
              <button nz-button nzType="default" (click)="openActionHistory()">
                <i nz-icon nzType="history" nzTheme="outline"></i>
                Xem lịch sử thao tác
              </button>
              <button nz-button (click)="destroyDetailModal(ref)">
                Đóng
              </button>
            </div>
          </ng-template>
          <ng-template #actionHistoryTplContent>
            <div class="action-history-dialog">
              <div class="text-[13px] text-theme-gray dark:text-white/60 mb-[12px]">
                Ticket #{{ selectedTicket?.id }}
              </div>
              <ul *ngIf="selectedTicketActionLogs.length; else noActionLogs" class="space-y-[10px] max-h-[420px] overflow-y-auto pr-[4px]">
                <li *ngFor="let action of selectedTicketActionLogs" class="border-b border-regular dark:border-white/10 pb-[10px] last:border-b-0 last:pb-0">
                  <div class="text-[12px] text-theme-gray dark:text-white/60">
                    {{ action.createdDate || action.actionDate || action.created_at }}
                  </div>
                  <div class="text-[13px] text-dark dark:text-white/[.87] mt-[2px]">
                    {{ getActionAuthor(action.actionBy || action.createdBy) }} - {{ action.actionName || action.actionCode }}
                  </div>
                </li>
              </ul>
              <ng-template #noActionLogs>
                <div class="text-[13px] text-theme-gray dark:text-white/60">Chưa có lịch sử thao tác.</div>
              </ng-template>
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
                  [nzDisabled]="true"
                  nzPlaceHolder="Chọn người xử lý"
                >
                  <nz-option *ngIf="selectedNewAssignedUser && !hasAssigneeOption(selectedNewAssignedUser)" [nzValue]="selectedNewAssignedUser" [nzLabel]="getAssigneeName(selectedNewAssignedUser)"></nz-option>
                  <nz-option *ngFor="let a of assigneeOptions" [nzValue]="a.user" [nzLabel]="getAssigneeName(a.user)"></nz-option>
                </nz-select>
              </div>
              <div>
                <div class="text-[13px] font-semibold text-theme-gray dark:text-white/60 mb-1">Chủ đề</div>
                <nz-select
                  class="w-full capitalize [&>nz-select-top-control]:border-normal dark:[&>nz-select-top-control]:border-white/10 [&>nz-select-top-control]:bg-white [&>nz-select-top-control]:dark:bg-white/10 [&>nz-select-top-control]:shadow-none [&>nz-select-top-control]:text-dark [&>nz-select-top-control]:dark:text-white/60 [&>nz-select-top-control]:h-[44px] [&>nz-select-top-control]:flex [&>nz-select-top-control]:items-center [&>nz-select-top-control]:rounded-[6px] [&>nz-select-top-control]:px-[15px]"
                  [(ngModel)]="selectedNewTopic"
                  (ngModelChange)="onNewTopicChange()"
                  name="newTopic"
                  nzDropdownClassName="topic-change-dropdown"
                  nzPlaceHolder="Chọn chủ đề"
                >
                  <nz-option-group *ngFor="let group of activeTopicGroups" [nzLabel]="group.departmentName">
                    <nz-option *ngFor="let t of group.topics" [nzValue]="t" [nzLabel]="t"></nz-option>
                  </nz-option-group>
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
              nzDropdownClassName="priority-change-dropdown"
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
        </ng-container>
      </div>
    </div>

  `,
})

export class ManageTicketComponent implements OnInit {
  readonly DEFAULT_EDITOR_INIT = DEFAULT_EDITOR_INIT;
  readonly TINYMCE_API_KEY = TINYMCE_API_KEY;
  @ViewChild('tplTitle') tplTitle!: TemplateRef<{}>;
  @ViewChild('tplContent') tplContent!: TemplateRef<{}>;
  @ViewChild('tplFooter') tplFooter!: TemplateRef<{}>;
  @ViewChild('detailTplTitle') detailTplTitle!: TemplateRef<{}>;
  @ViewChild('detailTplContent') detailTplContent!: TemplateRef<{}>;
  @ViewChild('detailTplFooter') detailTplFooter!: TemplateRef<{}>;
  @ViewChild('actionHistoryTplContent') actionHistoryTplContent!: TemplateRef<{}>;
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
  viewModalRef?: NzModalRef;
  selectedTicket: Person | null = null;
  selectedTicketResponses: TicketResponse[] = [];
  selectedTicketActionLogs: any[] = [];
  responseMap: { [ticketId: string]: TicketResponse[] } = {};
  employeeCodeByUserName: { [key: string]: string } = {};
  employeeNameByUserName: { [key: string]: string } = {};

  subModalRef?: NzModalRef;
  selectedNewAssignedUser: string | null = null;
  selectedNewPriority: string | null = null;
  selectedNewTopic: string | null = null;
  selectedNewDueDate: Date | null = null;
  newResponseText = '';
  newResponseFiles: File[] = [];
  responseSending = false;

  slaOptions: string[] = [];
  slaPriorityByCode: { [key: string]: string } = {};
  slaCodeByPriority: { [key: string]: string } = {};
  slaValueByCode: { [key: string]: number } = {};
  priorityOptions: string[] = [];

  sortField: SortField = 'createdDate';
  sortOrder: SortOrder = 'desc';

  private readonly pagination = new PaginationState(10);

  get pageIndex(): number {
    return this.pagination.pageIndex;
  }

  set pageIndex(value: number) {
    this.pagination.setPage(value);
  }

  get pageSize(): number {
    return this.pagination.pageSize;
  }

  // Tùy chọn cho dropdown "Chủ đề" trong modal Tạo Ticket; phần form còn lại
  // chỉ hiển thị khi đã chọn một chủ đề.
  topicOptions: string[] = [];
  topicFilterGroups: { departmentName: string; topics: string[] }[] = [];
  activeTopicGroups: { departmentName: string; topics: string[] }[] = [];
  topicNameById: { [key: string]: string } = {};
  topicAssigneeByName: { [key: string]: string } = {};
  departmentNameByCode: { [key: string]: string } = {};
  newTicketTopic: string | null = null;

  statusOptions: { statusCode: string; statusName: string }[] = [];
  statusNameByCode: { [key: string]: string } = {
    open: 'Mở',
    processing: 'Đang xử lý',
    closed: 'Hoàn thành'
  };
  statusRank: { [key: string]: number } = {
    open: 1,
    processing: 2,
    closed: 3
  };
  private readonly statusActionCodes: string[] = ['open', 'processing', 'closed'];

  // Mã màu (phù hợp với pattern badge `bg-{color}/10 text-{color}`) cho từng
  // giá trị `statusCode`. JSON không còn trường `status` riêng — màu badge được
  // suy ra trực tiếp từ `statusCode`.
  private readonly statusCodeColorMap: { [key: string]: string } = {
    'open': 'secondary',
    'processing': 'warning',
    'closed': 'success'
  };

  // Map các giá trị filter trạng thái lịch (schedule-status) trong dropdown
  // tới nhãn trả về bởi `getScheduleStatus()`.
  private readonly scheduleStatusMap: { [key: string]: string } = {
    ontrack: 'Đúng tiến độ',
    overdue: 'Trễ hạn'
  };

  // Xếp hạng ưu tiên tuỳ chỉnh để "Gấp" đứng trên "Cao", "Trung bình" và "Thấp"
  // thay vì dựa vào thứ tự chữ cái.
  private readonly priorityRank: { [key: string]: number } = {
    'Gấp': 4,
    'Cao': 3,
    'Trung bình': 2,
    'Thấp': 1
  };

  constructor(
    private tickets: TicketService,
    private auth: AuthService,
    private dialog: DialogService,
    private attachments: AttachmentService,
    private notifications: NotificationService
  ) {}

  /** Phần cắt của `filteredPeople` hiển thị ở trang hiện tại (10 mục mỗi trang). */
  get pagedPeople(): Person[] {
    const start = (this.pageIndex - 1) * this.pageSize;
    return this.filteredPeople.slice(start, start + this.pageSize);
  }

  /** Danh sách duy nhất các người có thể được phân công ticket, trích từ
   * những người từng là assignee trong dữ liệu đã load. */
  get assigneeOptions(): { user: string; name: string; phone: string; email: string }[] {
    const seen = new Map<string, { user: string; name: string; phone: string; email: string }>();
    for (const p of this.people) {
      if (!seen.has(p.assignedUser)) {
        seen.set(p.assignedUser, { user: p.assignedUser, name: p.assignedName, phone: p.assignedPhone, email: p.assignedDept });
      }
    }
    return Array.from(seen.values());
  }

  // Gom các chủ đề theo phòng/ban để hiển thị trong dropdown nhóm.
  // Chú thích ngắn: trả về mảng nhóm { departmentName, topics[] } đã sắp xếp.
  onPageIndexChange(pageIndex: number): void {
    this.pageIndex = pageIndex;
  }

  // Chú thích ngắn: cập nhật chỉ số trang khi pagination thay đổi.

  viewTicket(person: Person): void {
    this.selectedTicket = person;
    this.selectedTicketResponses = this.getResponsesByTicketId(person.id);
    this.newResponseText = '';
    this.newResponseFiles = [];
    this.viewModalRef = this.dialog.create({
      nzTitle: this.detailTplTitle,
      nzContent: this.detailTplContent,
      nzFooter: this.detailTplFooter,
      nzMaskClosable: true,
      nzClosable: true,
      nzWidth: 700
    });
    // Chỉ xoá `selectedTicket` sau khi modal đã đóng hoàn toàn (bằng mọi cách),
    // tránh việc nội dung biến mất trong khi animation đang chạy.
    this.viewModalRef.afterClose.subscribe(() => {
      this.selectedTicket = null;
      this.selectedTicketResponses = [];
    });
  }

  destroyDetailModal(modalRef?: NzModalRef): void {
    if (modalRef) {
      modalRef.destroy();
    }
  }

  openActionHistory(): void {
    const ticketId = this.selectedTicket?.id;
    if (!ticketId) {
      return;
    }

    this.selectedTicketActionLogs = [];
    this.loadTicketActionLogs(ticketId);
    this.dialog.create({
      nzTitle: 'Lịch sử thao tác',
      nzContent: this.actionHistoryTplContent,
      nzFooter: null,
      nzMaskClosable: true,
      nzClosable: true,
      nzWidth: 560
    });
  }

  loadTicketActionLogs(ticketId: string): void {
    this.tickets.getTicketActionLogs(ticketId).subscribe((logs) => {
      this.selectedTicketActionLogs = (Array.isArray(logs) ? logs : [])
        .map((action) => ({
          ...action,
          createdDate: action.createdDate || action.actionDate || action['created_at'] || ''
        }))
        .sort((left, right) => this.actionTimestamp(right) - this.actionTimestamp(left));
    });
  }

  private actionTimestamp(action: any): number {
    const value = action.createdDate || action.actionDate || action.created_at;
    if (!value) {
      return 0;
    }

    const [datePart, timePart = '00:00:00'] = String(value).split(' ');
    const [day, month, year] = datePart.split('/').map(Number);
    return new Date(year, month - 1, day, ...timePart.split(':').map(Number)).getTime();
  }

  // Chú thích ngắn: huỷ modal chi tiết nếu có.

  // --- Change Người xử lý & Chủ đề ---
  openChangeAssigneeTopicModal(): void {
    if (!this.selectedTicket) {
      return;
    }
    this.selectedNewAssignedUser = this.selectedTicket.assignedUser;
    this.selectedNewTopic = this.selectedTicket.topicName;
    this.subModalRef = this.dialog.create({
      nzTitle: this.assigneeTopicTplTitle,
      nzContent: this.assigneeTopicTplContent,
      nzFooter: this.assigneeTopicTplFooter,
      nzMaskClosable: true,
      nzClosable: true,
      nzWidth: 420
    });
  }

  // Chú thích ngắn: mở dialog thay đổi người xử lý và chủ đề, dùng modal con.

  confirmChangeAssigneeTopic(modalRef?: NzModalRef): void {
    if (this.selectedTicket && this.selectedNewTopic !== this.selectedTicket.topicName) {
      const changes: any = {};
      if (this.selectedNewTopic) {
        changes.topicName = this.selectedNewTopic;
        const assignedEmployee = this.topicAssigneeByName[this.selectedNewTopic];
        if (assignedEmployee) {
          this.selectedNewAssignedUser = assignedEmployee;
          changes.assignedUser = assignedEmployee;
        }
      }
      this.updateSelectedTicket(changes);
    }
    if (modalRef) {
      modalRef.destroy();
    }
  }

  onNewTopicChange(): void {
    const assignedUser = this.selectedNewTopic
      ? this.topicAssigneeByName[this.selectedNewTopic] ?? null
      : null;
    this.selectedNewAssignedUser = null;
    queueMicrotask(() => {
      this.selectedNewAssignedUser = assignedUser;
    });
  }

  // Chú thích ngắn: xác nhận thay đổi người xử lý/chủ đề cho ticket đang chọn.

  // --- Change Ưu tiên ---
  openChangePriorityModal(): void {
    if (!this.selectedTicket) {
      return;
    }
    this.selectedNewPriority = this.selectedTicket.priority;
    this.subModalRef = this.dialog.create({
      nzTitle: this.priorityTplTitle,
      nzContent: this.priorityTplContent,
      nzFooter: this.priorityTplFooter,
      nzMaskClosable: true,
      nzClosable: true,
      nzWidth: 380
    });
  }

  // Chú thích ngắn: mở dialog thay đổi mức độ ưu tiên cho ticket.

  confirmChangePriority(modalRef?: NzModalRef): void {
    if (this.selectedTicket && this.selectedNewPriority && this.selectedNewPriority !== this.selectedTicket.priority) {
      const newCode = this.slaCodeByPriority[this.selectedNewPriority];
      this.updateSelectedTicket(newCode ? { priority: this.selectedNewPriority, slaCode: newCode } : {});
    }
    if (modalRef) {
      modalRef.destroy();
    }
  }

  // Chú thích ngắn: xác nhận và áp dụng mức ưu tiên mới cho ticket.

  // --- Change Ngày hết hạn ---
  openChangeDueDateModal(): void {
    if (!this.selectedTicket) {
      return;
    }
    this.selectedNewDueDate = parseVnDate(this.selectedTicket.dueDate);
    this.subModalRef = this.dialog.create({
      nzTitle: this.dueDateTplTitle,
      nzContent: this.dueDateTplContent,
      nzFooter: this.dueDateTplFooter,
      nzMaskClosable: true,
      nzClosable: true,
      nzWidth: 380
    });
  }

  // Chú thích ngắn: mở dialog để chọn ngày đến hạn mới cho ticket.

  confirmChangeDueDate(modalRef?: NzModalRef): void {
    const selectedDueDate = this.selectedNewDueDate ? formatVnDate(this.selectedNewDueDate) : '';
    if (this.selectedTicket && selectedDueDate && selectedDueDate !== this.selectedTicket.dueDate) {
      this.updateSelectedTicket({ dueDate: selectedDueDate });
    }
    if (modalRef) {
      modalRef.destroy();
    }
  }

  // Chú thích ngắn: xác nhận và cập nhật ngày đến hạn cho ticket.

  // --- Close ticket ---
  closeTicket(): void {
    if (!this.selectedTicket || this.selectedTicket.statusCode === 'closed') {
      return;
    }
    this.updateSelectedTicket({ statusCode: 'closed' });
  }

  // Chú thích ngắn: đánh dấu ticket là đóng và lưu ngày đóng hiện tại.

  // --- Reopen ticket ---
  reopenTicket(): void {
    if (!this.selectedTicket || this.selectedTicket.statusCode !== 'closed') {
      return;
    }
    const statusCode = this.selectedTicket.assignedUser?.trim() ? 'processing' : 'open';
    this.updateSelectedTicket({ statusCode, closedDate: '' });
  }

  // Chú thích ngắn: mở lại ticket (chuyển trạng thái về 'open').

  // --- Send Phản hồi ---
  onResponseFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selected = Array.from(input.files ?? []);
    if (selected.length) {
      const valid = this.attachments.filterValid(selected, (message) => this.notifications.error(message));
      this.newResponseFiles.push(...valid);
    }
    input.value = '';
  }

  // Chú thích ngắn: xử lý lựa chọn tệp đính kèm cho phản hồi mới.

  removeResponseFile(index: number): void {
    this.newResponseFiles.splice(index, 1);
  }

  // Chú thích ngắn: xoá tệp đính kèm ở chỉ số `index` khỏi danh sách phản hồi mới.

  sendResponse(): void {
    const text = this.newResponseText.trim();
    if (!this.selectedTicket || (!text && !this.newResponseFiles.length) || this.responseSending) {
      return;
    }

    const ticketId = this.selectedTicket.id;
    this.responseSending = true;

    this.attachments.uploadAll(this.newResponseFiles, this.auth.currentUsername()).pipe(
      switchMap((uploaded) => this.tickets.createResponse(
        ticketId,
        text,
        uploaded.map((file) => file.originalName),
        uploaded.map((file) => file.fileId)
      )),
      finalize(() => this.responseSending = false)
    ).subscribe({
      next: (response) => {
        const newResponse = response as TicketResponse;
        const responses = this.responseMap[ticketId] ??= [];
        responses.push(newResponse);
        this.selectedTicketResponses = [...responses];
        this.newResponseText = '';
        this.newResponseFiles = [];
      },
      error: (error) => this.notifications.error(this.attachments.errorMessage(error, 'Không thể gửi phản hồi. Vui lòng thử lại.'))
    });
  }

  private updateSelectedTicket(changes: any): void {
    if (!this.selectedTicket || !Object.keys(changes).length) return;
    this.tickets.updateTicket(this.selectedTicket.id, changes).subscribe((updated) => {
      const normalized = this.normalizeTicketData([updated])[0];
      if (this.selectedTicket) {
        this.selectedTicket = normalized;
      }
      this.people = this.people.map((ticket) => ticket.id === normalized.id ? normalized : ticket);
      this.filteredPeople = this.applyAll();
    });
  }

  // Chú thích ngắn: tạo phản hồi mới, thêm vào `responseMap` và cập nhật hiển thị.

  // Trả về danh sách phản hồi cho một ticket theo `ticketId`.
  // Chú thích ngắn: tra `responseMap`, trả mảng rỗng nếu không tồn tại.
  private getCurrentUserName(): string {
    return this.auth.currentUserName();
  }

  getCreatorName(person: Person): string {
    const creatorName = (person.creatorName ?? '').trim();
    if (!creatorName || creatorName.includes(' - ')) return creatorName;
    const key = creatorName.toLowerCase();
    const employeeCode = this.employeeCodeByUserName[key];
    const employeeName = this.employeeNameByUserName[key];
    return employeeCode || employeeName
      ? formatEmployeeName(employeeCode ?? creatorName, employeeName ?? creatorName)
      : creatorName;
  }

  getAssigneeName(identifier: string): string {
    const key = (identifier ?? '').trim().toLowerCase();
    const employeeCode = this.employeeCodeByUserName[key];
    const employeeName = this.employeeNameByUserName[key];
    return employeeCode || employeeName
      ? formatEmployeeName(employeeCode ?? identifier, employeeName ?? identifier)
      : identifier;
  }

  hasAssigneeOption(identifier: string): boolean {
    return this.assigneeOptions.some((assignee) => assignee.user === identifier);
  }

  getActionAuthor(actor: string): string {
    const username = (actor ?? '').trim();
    if (!username || username.includes(' - ')) return username;
    const key = username.toLowerCase();
    const employeeCode = this.employeeCodeByUserName[key];
    const employeeName = this.employeeNameByUserName[key];
    return employeeCode || employeeName
      ? formatEmployeeName(employeeCode ?? username, employeeName ?? username)
      : username;
  }

  getResponseAuthor(response: TicketResponse, fallbackName: string): string {
    const createdBy = (response.createdBy ?? response.CreatedBy ?? '').trim();
    if (!createdBy) return fallbackName;
    const key = createdBy.toLowerCase();
    const employeeCode = this.employeeCodeByUserName[key];
    const employeeName = this.employeeNameByUserName[key];
    if (employeeName) {
      return formatEmployeeName(employeeCode ?? createdBy, employeeName);
    }

    return createdBy;
  }

  private getResponsesByTicketId(ticketId: string): TicketResponse[] {
    return this.responseMap[ticketId] ?? [];
  }

  ngOnInit(): void {
    this.tickets.getSupportData().subscribe(
      ({ tickets, responses, statuses, topics, departments, employees, sla }) => {
        this.statusOptions = statuses;
        const employeeLookups = createEmployeeLookups(employees ?? []);
        this.employeeCodeByUserName = employeeLookups.codes;
        this.employeeNameByUserName = employeeLookups.names;
        this.statusNameByCode = statuses.reduce((map, item) => {
          map[item.statusCode] = item.statusName;
          return map;
        }, { ...this.statusNameByCode });

        this.responseMap = responses.reduce((map, item) => {
          if (!map[item.ticketId]) {
            map[item.ticketId] = [];
          }
          map[item.ticketId].push(item);
          return map;
        }, {} as { [ticketId: string]: TicketResponse[] });

        this.topicOptions = topics
          .filter((topic) => isTopicActive(topic))
          .map((topic) => topic.topicName)
          .filter((topicName): topicName is string => !!topicName);

        this.departmentNameByCode = departments.reduce((map, department) => {
          map[department.departmentCode] = department.departmentName;
          return map;
        }, {} as { [key: string]: string });

        this.topicFilterGroups = buildTopicFilterGroups(topics, this.departmentNameByCode);
        this.activeTopicGroups = buildTopicFilterGroups(
          topics.filter((topic) => isTopicActive(topic)),
          this.departmentNameByCode
        );

        this.topicNameById = topics.reduce((map, topic) => {
          map[topic.id] = topic.topicName;
          return map;
        }, {} as { [key: string]: string });

        this.topicAssigneeByName = topics.reduce((map, topic) => {
          if (topic.topicName && topic.assignedEmployee) {
            const assignedEmployee = employees?.find((employee) =>
              employee.employeeCode?.toLowerCase() === topic.assignedEmployee?.toLowerCase() ||
              employee.userName?.toLowerCase() === topic.assignedEmployee?.toLowerCase());
            map[topic.topicName] = assignedEmployee?.userName ?? topic.assignedEmployee;
          }
          return map;
        }, {} as { [key: string]: string });

        this.slaPriorityByCode = sla.reduce((map, item) => {
          map[item.SLAcode] = item.SLApriority;
          return map;
        }, {} as { [key: string]: string });

        this.slaCodeByPriority = sla.reduce((map, item) => {
          map[item.SLApriority] = item.SLAcode;
          return map;
        }, {} as { [key: string]: string });

        this.slaValueByCode = sla.reduce((map, item) => {
          const value = Number(item.SLAvalue);
          if (!Number.isNaN(value)) {
            map[item.SLAcode] = value;
          }
          return map;
        }, {} as { [key: string]: number });

        this.priorityOptions = sla.map((item) => item.SLApriority);
        this.slaOptions = sla.map((item) => item.SLAcode);

        this.people = this.normalizeTicketData(tickets);
        this.filteredPeople = this.applyAll();
        this.tickets.getResponsesForTickets(this.people).subscribe((loadedResponses) => {
          this.responseMap = loadedResponses.reduce((map, item) => {
            (map[item.ticketId] ??= []).push(item);
            return map;
          }, {} as { [ticketId: string]: TicketResponse[] });
        });
      },
      (error) => {
        console.log('Error reading JSON file:', error);
      }
    );
  }

  private normalizeTicketData(data: any[]): Person[] {
    return data.map((item) => ({
      ...item,
      ticketId: item.ticketId ?? item.id ?? '',
      id: item.id ?? item.ticketId ?? '',
      topicId: item.topicId ?? undefined,
      topicName: this.topicNameById[item.topicId] ?? item.topicName ?? item.topicId ?? '',
      departmentCode: item.departmentCode ?? item.creatorDept ?? item.assignedDept ?? '',
      ticketName: item.ticketName ?? item.subject ?? '',
      subject: item.subject ?? item.ticketName ?? '',
      ticketContent: item.ticketContent ?? item.content ?? '',
      content: item.content ?? item.ticketContent ?? '',
      slaCode: item.slaCode ?? item.SLAcode ?? '',
      priority: this.slaPriorityByCode[item.slaCode ?? item.SLAcode ?? ''] ?? '',
      statusCode: item.statusCode ?? '',
      assignedDate: item.assignedDate ?? undefined,
      assignedTo: item.assignedTo ?? item.assignedUser ?? '',
      assignedUser: item.assignedUser ?? item.assignedTo ?? '',
      createdBy: item.createdBy ?? item.creatorName ?? '',
      creatorName: item.creatorName ?? item.createdBy ?? '',
      creatorDept: item.creatorDept ?? item.departmentCode ?? '',
      assignedDept: item.assignedDept ?? item.departmentCode ?? '',
      creatorUser: item.creatorUser ?? item.createdBy ?? undefined,
      closedBy: item.closedBy ?? undefined,
      attachedFile: item.attachedFile ?? '',
      response: item.response ?? '',
      createdDate: item.createdDate ?? '',
      createdTime: item.createdTime ?? '',
      dueDate: item.dueDate ?? '',
      dueTime: item.dueTime ?? '',
      closedDate: item.closedDate ?? '',
      closedTime: item.closedTime ?? ''
    } as Person));
  }

  // Chú thích ngắn: chuẩn hoá dữ liệu ticket từ JSON để phù hợp với giao diện.

  onSearchChange(): void {
    this.refreshFilteredPeople();
  }

  filterByStatus(): void {
    this.refreshFilteredPeople();
  }

  /**
   * Bộ lọc `Trạng thái` gồm hai nhóm độc lập ("Trạng thái xử lý" và "Tiến độ").
   * Chọn giá trị mới trong cùng một nhóm sẽ thay thế giá trị cũ trong nhóm đó,
   * do đó mỗi nhóm chỉ có thể có tối đa một giá trị đang được chọn.
   */
  onStatusFilterChange(values: string[]): void {
    const previous = this.statusFilter;
    let constrained = keepLatestPerGroup(values, previous, this.statusActionCodes);
    constrained = keepLatestPerGroup(constrained, previous, Object.keys(this.scheduleStatusMap));
    this.statusFilter = constrained;
    this.filterByStatus();
  }

  /** Within a single option group, keeps only the most recently added value (or the last one if none is new). */
  filterByPriority(): void {
    this.refreshFilteredPeople();
  }

  filterByTopic(): void {
    this.refreshFilteredPeople();
  }

  filterByCreatedDateRange(): void {
    this.refreshFilteredPeople();
  }

  filterByDueDateRange(): void {
    this.refreshFilteredPeople();
  }

  private refreshFilteredPeople(): void {
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

  /** Chuyển chuỗi "dd/MM/yyyy" thành timestamp để cột ngày có thể sắp xếp theo thứ tự thời gian. */
  // Chú thích ngắn: trả về `0` nếu chuỗi không hợp lệ.
  private parseDate(dateStr: string): number {
    const [day, month, year] = dateStr.split('/').map(Number);
    if (!day || !month || !year) {
      return 0;
    }
    return new Date(year, month - 1, day).getTime();
  }
  /**
   * Trạng thái tiến độ hiển thị dưới "Trạng thái":
   * - Ticket đã đóng: so sánh `closedDate` với `dueDate` (đóng trễ = Trễ hạn).
   * - Ticket đang mở: so sánh ngày hiện tại với `dueDate` (qua hạn và vẫn mở = Trễ hạn).
   */
  // Chú thích ngắn: trả về 'Đúng tiến độ' hoặc 'Trễ hạn'.
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

  /** Mã màu cho trạng thái tiến độ (phù hợp pattern `bg-{color}/10 text-{color}`). */
  // Chú thích ngắn: 'Trễ hạn' -> 'danger', ngược lại -> 'success'.
  getScheduleStatusColor(person: Person): string {
    return this.getScheduleStatus(person) === 'Trễ hạn' ? 'danger' : 'success';
  }

  /** Mã màu cho trạng thái hành động của ticket, suy ra từ `statusCode`. */
  // Chú thích ngắn: lấy từ `statusCodeColorMap`, mặc định 'secondary'.
  getStatusColor(statusCode: string): string {
    return this.statusCodeColorMap[statusCode] ?? 'secondary';
  }

  /** Kiểm tra chuỗi ngày "dd/MM/yyyy" có nằm trong khoảng [start, end] (bao gồm, chính xác tới ngày) hay không. */
  // Chú thích ngắn: nếu range không hợp lệ thì luôn trả về true.
  private isWithinRange(dateStr: string, range: Date[] | null): boolean {
    if (!range || range.length !== 2 || !range[0] || !range[1]) {
      return true;
    }
    const value = this.parseDate(dateStr);
    const start = new Date(range[0].getFullYear(), range[0].getMonth(), range[0].getDate()).getTime();
    const end = new Date(range[1].getFullYear(), range[1].getMonth(), range[1].getDate()).getTime();
    return value >= start && value <= end;
  }

  /** Chạy pipeline kết hợp: tìm kiếm theo mã/tên -> lọc theo trạng thái/ưu tiên/khoảng ngày -> sắp xếp. */
  // Chú thích ngắn: trả về mảng `Person` đã lọc và sắp xếp.
  private applyAll(): Person[] {
    const searchQuery = this.searchValue.trim().toLowerCase();
    const selectedAction = this.statusFilter.find((v) => this.statusActionCodes.includes(v));
    const selectedSchedule = this.statusFilter.find((v) => this.scheduleStatusMap[v]);

    let result = this.people.filter((person) => {
      const matchesSearch = !searchQuery ||
        person.id.toLowerCase().includes(searchQuery) ||
        person.creatorName.toLowerCase().includes(searchQuery) ||
        person.assignedName.toLowerCase().includes(searchQuery);
      const matchesStatus =
        (!selectedAction || person.statusCode === selectedAction) &&
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

  // Sắp xếp danh sách `Person` theo trường `field` và thứ tự `order`.
  // Chú thích ngắn: hỗ trợ sắp xếp theo id, tên, ưu tiên, trạng thái và ngày.
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
        case 'statusCode':
          comparison = (this.statusRank[a.statusCode] ?? 0) - (this.statusRank[b.statusCode] ?? 0);
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

  // Mở modal theo template (tiêu đề, nội dung, footer) dùng cho Tạo Ticket.
  // Chú thích ngắn: reset `newTicketTopic` và lưu `modalRef` trả về.
  createTplModal(tplTitle?: TemplateRef<{}>, tplContent?: TemplateRef<{}>, tplFooter?: TemplateRef<{}>): void {
    this.newTicketTopic = null;
    this.modalRef = this.dialog.create({
      nzTitle: tplTitle,
      nzContent: tplContent,
      nzFooter: tplFooter,
      nzMaskClosable: true,
      nzClosable: true,
      nzWidth: 620
    });
  }

  // Huỷ modal mẫu nếu có và reset trạng thái liên quan.
  destroyTplModal(modalRef?: NzModalRef): void {
    if (modalRef) {
      modalRef.destroy();
    }
    this.newTicketTopic = null;
  }
}