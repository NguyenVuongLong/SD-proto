import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzGridModule } from 'ng-zorro-antd/grid';
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
import { finalize, of, switchMap } from 'rxjs';
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
import { EditorModule } from '@tinymce/tinymce-angular';
import { DEFAULT_EDITOR_INIT, TINYMCE_API_KEY } from '@shared/config';
import { buildTopicFilterGroups, createEmployeeLookups, formatEmployeeName, isTopicActive, keepLatestPerGroup, LoadingState, PaginationState } from '@shared/utils';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

interface Person {
  ticketId: string;
  id: string;
  topicId?: string;
  departmentCode?: string;
  ticketName?: string;
  ticketContent?: string;
  slaCode?: string;
  statusCode: string;
  assignedDate?: string;
  assignedTo?: string;
  closedBy?: string;
  createdBy?: string;
  subject: string;
  content: string;
  attachedFile: string;
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
  createdTime?: string;
  dueDate: string;
  dueTime?: string;
  closedDate: string;
  closedTime?: string;
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

interface Topic {
  id: string;
  topicName: string;
  SLA: string;
  departmentCode: string;
  status?: string;
}

type SortField = 'id' | 'assignedName' | 'priority' | 'statusCode' | 'createdDate' | 'dueDate' | 'topicName';
type SortOrder = 'asc' | 'desc';

@Component({
  selector: 'app-my-tickets',
  standalone: true,
  imports: 
  [ CommonModule, 
    NzSkeletonModule, 
    NzGridModule,
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
    PerfectScrollbarModule,
    EditorModule,
    AttachmentListComponent
  ],
  providers: [
    {
        provide: PERFECT_SCROLLBAR_CONFIG,
        useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ],
  styleUrls: ['./my-tickets.component.scss'],
  template: `
    <div nz-row [nzGutter]="25">
    <div nz-col nzXs="24" class="mb-[25px]">
      <ng-container>
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
                    <nz-option-group *ngFor="let group of topicFilterGroups" [nzLabel]="group.departmentName">
                      <nz-option *ngFor="let topic of group.topics" [nzValue]="topic" [nzLabel]="topic"></nz-option>
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
                        <th class="bg-regularBG dark:bg-[#323440] px-[20px] py-[16px] text-start text-dark dark:text-white/[.87] text-[15px] font-medium border-none before:hidden capitalize cursor-pointer select-none" (click)="toggleSort('assignedName')">Người xử lý{{ sortArrow('assignedName') }}</th>
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
                            <img class="min-w-[34px] h-[34px] rounded-4" src="assets/images/avatars/{{person.assignedUser}}" alt="Samsung Galaxy S8 256GB">
                          </div>
                          <div>
                            <span class="font-medium capitalize text-dark dark:text-white/[.87] text-15 block">{{ person.assignedName }}</span>
                            <div class="text-[12px] leading-[1.6] text-light dark:text-white/60 whitespace-nowrap">
                              <div>{{ person.assignedPhone }}</div>
                              <div>{{ departmentNameByCode[person.assignedDept] || person.assignedDept }}</div>
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
        <ng-template #tplTitle>
          <span>Tạo Ticket</span>
        </ng-template>
        <ng-template #tplContent let-params>
          <form nz-form nzLayout="vertical">
              <nz-form-item>
                <nz-form-control>
                  <nz-form-label nzRequired class="text-[15px] font-semibold text-dark dark:text-white/[.87] capitalize mb-[10px]">Phòng ban:</nz-form-label>
                  <nz-select class="min-w-[260px] capitalize [&>nz-select-top-control]:border-normal dark:[&>nz-select-top-control]:border-white/10 [&>nz-select-top-control]:bg-white [&>nz-select-top-control]:dark:bg-white/10 [&>nz-select-top-control]:shadow-none [&>nz-select-top-control]:text-dark [&>nz-select-top-control]:dark:text-white/60 [&>nz-select-top-control]:h-[50px] [&>nz-select-top-control]:flex [&>nz-select-top-control]:items-center [&>nz-select-top-control]:rounded-[5px] [&>nz-select-top-control]:px-[20px] [&>.ant-select-arrow]:text-theme-gray dark:[&>.ant-select-arrow]:text-white/60" [(ngModel)]="newTicketDepartment" (ngModelChange)="onNewTicketDepartmentChange()" nzPlaceHolder="Chọn phòng ban" name="phongBan">
                    <nz-option *ngFor="let dept of departmentOptions" [nzValue]="dept" [nzLabel]="dept"></nz-option>
                  </nz-select>
                </nz-form-control>
              </nz-form-item>
              <nz-form-item *ngIf="newTicketDepartment">
                <nz-form-control>
                  <nz-form-label nzRequired class="text-[15px] font-semibold text-dark dark:text-white/[.87] capitalize mb-[10px]">Chủ đề:</nz-form-label>
                  <nz-select class="min-w-[260px] capitalize [&>nz-select-top-control]:border-normal dark:[&>nz-select-top-control]:border-white/10 [&>nz-select-top-control]:bg-white [&>nz-select-top-control]:dark:bg-white/10 [&>nz-select-top-control]:shadow-none [&>nz-select-top-control]:text-dark [&>nz-select-top-control]:dark:text-white/60 [&>nz-select-top-control]:h-[50px] [&>nz-select-top-control]:flex [&>nz-select-top-control]:items-center [&>nz-select-top-control]:rounded-[5px] [&>nz-select-top-control]:px-[20px] [&>.ant-select-arrow]:text-theme-gray dark:[&>.ant-select-arrow]:text-white/60" [(ngModel)]="newTicketTopic" (ngModelChange)="onNewTicketTopicChange()" nzPlaceHolder="Chọn chủ đề" name="chuDe">
                    <nz-option *ngFor="let topic of newTicketTopicOptions" [nzValue]="topic" [nzLabel]="topic"></nz-option>
                  </nz-select>
                </nz-form-control>
              </nz-form-item>
              <ng-container *ngIf="newTicketTopic">
              <nz-form-item>
                <nz-form-control>
                <nz-form-label nzRequired class="text-[15px] font-semibold text-dark dark:text-white/[.87] capitalize mb-[10px]">Ưu tiên:</nz-form-label>
                  <input class="h-[50px] border-normal dark:border-white/10 px-[20px] placeholder-shown:text-light-extra dark:placeholder-shown:text-white/60 rounded-[5px] dark:bg-white/10 dark:text-white/[.87] bg-white dark:bg-slate-800" nz-input [value]="newTicketPriority || ''" disabled placeholder="Ưu tiên tự động theo chủ đề" />
                </nz-form-control>
              </nz-form-item>
              <nz-form-item>
                <nz-form-control>
                  <nz-form-label nzRequired class="text-[15px] font-semibold text-dark dark:text-white/[.87] capitalize mb-[10px]">Tiêu đề:</nz-form-label>
                  <input class="h-[50px] border-normal dark:border-white/10 px-[20px] placeholder-shown:text-light-extra dark:placeholder-shown:text-white/60 rounded-[5px] dark:bg-white/10 dark:text-white/[.87]" type="text" nz-input placeholder="Tiêu đề" name="tieuDe" [(ngModel)]="newTicketTitle">
                </nz-form-control>
              </nz-form-item>
              <nz-form-item>
                <nz-form-control>
                <nz-form-label nzRequired class="text-[15px] font-semibold text-dark dark:text-white/[.87] capitalize mb-[10px]">Nội dung:</nz-form-label>
                  <editor
                    apiKey="{{ TINYMCE_API_KEY }}"
                    [init]="DEFAULT_EDITOR_INIT"
                    placeholder="Nội dung"
                    name="noiDung"
                    [(ngModel)]="newTicketContent"
                  ></editor>
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
                      <button nz-button nzType="text" nzSize="small" type="button" (click)="clearNewTicketFile()">
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
          <button nz-button nzType="primary" (click)="submitTicket(ref)" [nzLoading]="tplModalButtonLoading">
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
              <div class="space-y-[18px]">
                <div *ngFor="let response of selectedTicketResponses" class="flex items-start w-full gap-[10px]">
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
      </ng-container>
    </div>
  </div>
`
})

export class MyTicketsComponent implements OnInit {
  readonly DEFAULT_EDITOR_INIT = DEFAULT_EDITOR_INIT;
  readonly TINYMCE_API_KEY = TINYMCE_API_KEY;
  @ViewChild('tplTitle') tplTitle!: TemplateRef<{}>;
  @ViewChild('tplContent') tplContent!: TemplateRef<{}>;
  @ViewChild('tplFooter') tplFooter!: TemplateRef<{}>;
  @ViewChild('detailTplTitle') detailTplTitle!: TemplateRef<{}>;
  @ViewChild('detailTplContent') detailTplContent!: TemplateRef<{}>;
  @ViewChild('detailTplFooter') detailTplFooter!: TemplateRef<{}>;
  @ViewChild('actionHistoryTplContent') actionHistoryTplContent!: TemplateRef<{}>;

  searchValue = '';
  statusFilter: string[] = [];
  priorityFilter = '';
  topicFilter = '';
  createdDateRange: Date[] | null = null;
  dueDateRange: Date[] | null = null;
  people: Person[] = [];
  filteredPeople: Person[] = [];
  modalRef?: NzModalRef;
  private readonly submitLoading = new LoadingState();

  get tplModalButtonLoading(): boolean {
    return this.submitLoading.isLoading;
  }

  viewModalRef?: NzModalRef;
  selectedTicket: Person | null = null;
  selectedTicketResponses: TicketResponse[] = [];
  selectedTicketActionLogs: any[] = [];
  responseMap: { [ticketId: string]: TicketResponse[] } = {};
  newResponseText = '';
  newResponseFiles: File[] = [];
  responseSending = false;

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

  // Các tùy chọn cho dropdown "Phòng ban" trong modal Tạo Ticket;
  // trường "Chủ đề" chỉ hiển thị sau khi đã chọn phòng ban.
  departmentOptions: string[] = [];
  departmentNameByCode: { [key: string]: string } = {};
  departmentCodeByName: { [key: string]: string } = {};
  newTicketDepartment: string | null = null;

  allTopics: Topic[] = [];
  employeeCodeByUserName: { [key: string]: string } = {};
  employeeNameByUserName: { [key: string]: string } = {};
  newTicketTopicOptions: string[] = [];

  // Dữ liệu SLA gốc dùng để suy ra giá trị ưu tiên từ mã SLA.
  slaOptions: string[] = [];
  slaPriorityByCode: { [key: string]: string } = {};
  slaPriorityByValue: { [key: string]: string } = {};
  slaCodeByPriority: { [key: string]: string } = {};
  priorityOptions: string[] = [];
  topicByName: { [key: string]: Topic } = {};
  newTicketPriority: string | null = null;

  // Các tùy chọn cho dropdown "Chủ đề" trong modal Tạo Ticket;
  // phần còn lại của biểu mẫu chỉ hiển thị sau khi đã chọn chủ đề.
  topicOptions: string[] = [];
  topicNameById: { [key: string]: string } = {};
  newTicketTopic: string | null = null;
  newTicketAttachedFile: string | null = null;
  newTicketFile: File | null = null;
  newTicketTitle = '';
  newTicketContent = '';

  statusOptions: { statusCode: string; statusName: string }[] = [];
  statusNameByCode: { [key: string]: string } = {
    open: 'Mở',
    processing: 'Đang xử lý',
    closed: 'Hoàn thành'
  };
  private readonly statusActionCodes: string[] = ['open', 'processing', 'closed'];

  // Màu badge cho từng giá trị `statusCode`.
  // Dữ liệu JSON hiện tại không chứa trường `status` riêng biệt,
  // nên màu badge được xác định trực tiếp từ `statusCode`.
  private readonly statusCodeColorMap: { [key: string]: string } = {
    open: 'secondary',
    processing: 'warning',
    closed: 'success'
  };

  // Ánh xạ các giá trị bộ lọc tiến độ sang nhãn do getScheduleStatus() trả về.
  private readonly scheduleStatusMap: { [key: string]: string } = {
    ontrack: 'Đúng tiến độ',
    overdue: 'Trễ hạn'
  };

  // Thứ tự ưu tiên tùy chỉnh để "Gấp" đứng trên "Cao", "Trung bình", "Thấp"
  // thay vì sắp theo thứ tự chữ cái.
  private readonly priorityRank: { [key: string]: number } = {
    'Gấp': 4,
    'Cao': 3,
    'Trung bình': 2,
    'Thấp': 1
  };

  // Thứ tự trạng thái tùy chỉnh để cột Trạng thái sắp xếp theo vòng đời:
  // Mở -> Đang xử lý -> Hoàn thành.
  private readonly statusRank: { [key: string]: number } = {
    open: 1,
    processing: 2,
    closed: 3
  };

  constructor(
    private tickets: TicketService,
    private auth: AuthService,
    private dialog: DialogService,
    private attachments: AttachmentService,
    private notifications: NotificationService
  ) {}

  /** Danh sách ticket đã lọc cho trang hiện tại (10 mục mỗi trang). */
  get pagedPeople(): Person[] {
    const start = (this.pageIndex - 1) * this.pageSize;
    return this.filteredPeople.slice(start, start + this.pageSize);
  }

  topicFilterGroups: { departmentName: string; topics: string[] }[] = [];

  /** Cập nhật chỉ số trang khi người dùng đổi trang phân trang. */
  onPageIndexChange(pageIndex: number): void {
    this.pageIndex = pageIndex;
  }

  /** Mở modal hiển thị chi tiết ticket và các phản hồi liên quan. */
  viewTicket(person: Person): void {
    this.selectedTicket = person;
    this.selectedTicketResponses = this.getResponsesByTicketId(person.id);
    this.selectedTicketActionLogs = [];
    this.newResponseText = '';
    this.newResponseFiles = [];
    this.viewModalRef = this.dialog.create({
      nzTitle: this.detailTplTitle,
      nzContent: this.detailTplContent,
      nzFooter: this.detailTplFooter,
      nzMaskClosable: true,
      nzClosable: true,
      nzWidth: 730
    });
    // Chỉ xóa ticket đã chọn khi modal đã đóng hoàn toàn
    // (bằng bất kỳ cách nào), để nội dung không mất giữa chừng.
    this.viewModalRef.afterClose.subscribe(() => {
      this.selectedTicket = null;
      this.selectedTicketResponses = [];
    });
  }

  /** Đóng modal chi tiết nếu có tham chiếu modal hợp lệ. */
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

  /** Tải dữ liệu JSON ban đầu và thiết lập trạng thái, chủ đề, SLA, phòng ban và ticket. */
  ngOnInit(): void {
    this.tickets.getSupportData().subscribe(
      ({ tickets, statuses, topics, departments, employees, sla, responses }) => {
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

        this.allTopics = topics;
        this.topicOptions = topics
          .filter((topic) => isTopicActive(topic) && topic?.topicName)
          .map((topic) => topic.topicName);

        this.topicByName = topics.reduce((map, topic) => {
          map[topic.topicName] = topic;
          return map;
        }, {} as { [key: string]: Topic });

        this.topicFilterGroups = buildTopicFilterGroups(topics, this.departmentNameByCode);

        this.topicNameById = topics.reduce((map, topic) => {
          map[topic.id] = topic.topicName;
          return map;
        }, {} as { [key: string]: string });

        this.departmentOptions = departments
          .filter((department) => department?.departmentName)
          .map((department) => department.departmentName);

        this.departmentNameByCode = departments.reduce((map, department) => {
          map[department.departmentCode] = department.departmentName;
          return map;
        }, {} as { [key: string]: string });

        this.departmentCodeByName = departments.reduce((map, department) => {
          map[department.departmentName] = department.departmentCode;
          return map;
        }, {} as { [key: string]: string });

        this.slaPriorityByCode = sla.reduce((map, item) => {
          map[item.SLAcode] = item.SLApriority;
          return map;
        }, {} as { [key: string]: string });

        this.slaPriorityByValue = sla.reduce((map, item) => {
          map[item.SLAvalue] = item.SLApriority;
          return map;
        }, {} as { [key: string]: string });

        this.slaCodeByPriority = sla.reduce((map, item) => {
          map[item.SLApriority] = item.SLAcode;
          return map;
        }, {} as { [key: string]: string });

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

  /** Chuẩn hóa dữ liệu ticket JSON về định dạng Person đồng nhất để sử dụng trong bảng. */
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
      createdDate: item.createdDate ?? '',
      createdTime: item.createdTime ?? '',
      dueDate: item.dueDate ?? '',
      dueTime: item.dueTime ?? '',
      closedDate: item.closedDate ?? '',
      closedTime: item.closedTime ?? ''
    } as Person));
  }

  /** Lấy danh sách phản hồi cho ticket theo ticketId. */
  private getResponsesByTicketId(ticketId: string): TicketResponse[] {
    return this.responseMap[ticketId] ?? [];
  }

  loadTicketActionLogs(ticketId: string): void {
    this.tickets.getTicketActionLogs(ticketId).subscribe((logs) => {
      this.selectedTicketActionLogs = (Array.isArray(logs) ? logs : [])
        .map((action) => ({
          ...action,
          createdDate: action.createdDate || action.actionDate || action.created_at || ''
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

  getCurrentUserName(): string {
    return this.auth.currentUserName();
  }

  getCreatorName(person: Person): string {
    const creatorName = (person.creatorName ?? '').trim();
    if (!creatorName || creatorName.includes(' - ')) {
      return creatorName;
    }

    const employeeCode = this.employeeCodeByUserName[creatorName.toLowerCase()];
    const employeeName = this.employeeNameByUserName[creatorName.toLowerCase()];
    return employeeCode || employeeName
      ? formatEmployeeName(employeeCode ?? creatorName, employeeName ?? creatorName)
      : creatorName;
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
    const createdBy = response.createdBy ?? response.CreatedBy ?? '';
    const normalizedCreatedBy = createdBy.trim();

    if (!normalizedCreatedBy) {
      return fallbackName;
    }

    const byUserName = normalizedCreatedBy.toLowerCase();
    const employeeCode = this.employeeCodeByUserName[byUserName];
    const employeeName = this.employeeNameByUserName[byUserName];

    if (employeeName) {
      return formatEmployeeName(employeeCode ?? normalizedCreatedBy, employeeName);
    }

    return normalizedCreatedBy;
  }

  /** Áp dụng tìm kiếm mới và đưa về trang 1. */
  onSearchChange(): void {
    this.refreshFilteredPeople();
  }

  /** Áp dụng lọc trạng thái và đưa về trang 1. */
  filterByStatus(): void {
    this.refreshFilteredPeople();
  }

  /**
   * Bộ lọc Trạng thái có hai nhóm độc lập ("Trạng thái xử lý" và "Tiến độ").
   * Chọn giá trị mới trong một nhóm sẽ thay thế giá trị trước đó trong cùng nhóm,
   * nên mỗi nhóm chỉ giữ tối đa một giá trị đang được chọn.
   */
  onStatusFilterChange(values: string[]): void {
    const previous = this.statusFilter;
    let constrained = keepLatestPerGroup(values, previous, this.statusActionCodes);
    constrained = keepLatestPerGroup(constrained, previous, Object.keys(this.scheduleStatusMap));
    this.statusFilter = constrained;
    this.filterByStatus();
  }

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

  /** Được gọi khi dropdown "Sắp xếp theo" thay đổi; giữ thứ tự hiện tại hoặc mặc định là asc. */
  onSortFieldChange(): void {
    this.filteredPeople = this.applyAll();
  }

  /** Được gọi khi nhấp tiêu đề cột; nhấp lại cùng cột sẽ đổi thứ tự asc/desc. */
  toggleSort(field: SortField): void {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'asc';
    }
    this.filteredPeople = this.applyAll();
  }

  /** Trả về mũi tên chỉ thị cho cột đang được sắp xếp, dùng trong template. */
  sortArrow(field: SortField): string {
    if (this.sortField !== field) {
      return '';
    }
    return this.sortOrder === 'asc' ? ' ▲' : ' ▼';
  }

  /** Chuyển chuỗi "dd/MM/yyyy" thành thời gian thực để cột ngày có thể sắp xếp theo thứ tự thời gian. */
  private parseDate(dateStr: string): number {
    const [day, month, year] = dateStr.split('/').map(Number);
    if (!day || !month || !year) {
      return 0;
    }
    return new Date(year, month - 1, day).getTime();
  }

  /**
   * Trạng thái tiến độ hiển thị dưới "Trạng thái":
   * - Ticket đã đóng so sánh closedDate với dueDate (đóng muộn = Trễ hạn).
   * - Ticket mở so sánh ngày hôm nay với dueDate (quá hạn nhưng chưa đóng = Trễ hạn).
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

  /** Màu badge cho trạng thái tiến độ, khớp với mẫu bg-{color}/10 text-{color}. */
  getScheduleStatusColor(person: Person): string {
    return this.getScheduleStatus(person) === 'Trễ hạn' ? 'danger' : 'success';
  }

  /** Màu badge cho trạng thái hành động ticket, dựa trực tiếp trên `statusCode`. */
  getStatusColor(statusCode: string): string {
    return this.statusCodeColorMap[statusCode] ?? 'secondary';
  }

  /** Kiểm tra xem chuỗi ngày "dd/MM/yyyy" có nằm trong khoảng [start, end] hay không (bao gồm, chính xác đến ngày). */
  private isWithinRange(dateStr: string, range: Date[] | null): boolean {
    if (!range || range.length !== 2 || !range[0] || !range[1]) {
      return true;
    }
    const value = this.parseDate(dateStr);
    const start = new Date(range[0].getFullYear(), range[0].getMonth(), range[0].getDate()).getTime();
    const end = new Date(range[1].getFullYear(), range[1].getMonth(), range[1].getDate()).getTime();
    return value >= start && value <= end;
  }

  /** Chạy pipeline kết hợp: tìm kiếm theo mã/tên -> lọc theo trạng thái/ưu tiên/ngày -> sắp xếp. */
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

  createTplModal(tplTitle?: TemplateRef<{}>, tplContent?: TemplateRef<{}>, tplFooter?: TemplateRef<{}>): void {
    this.newTicketDepartment = null;
    this.newTicketTopic = null;
    this.newTicketAttachedFile = null;
    this.newTicketFile = null;
    this.newTicketTitle = '';
    this.newTicketContent = '';
    this.modalRef = this.dialog.create({
      nzTitle: tplTitle,
      nzContent: tplContent,
      nzFooter: tplFooter,
      nzMaskClosable: true,
      nzClosable: true,
      nzWidth: 620,
    });
  }

  destroyTplModal(modalRef?: NzModalRef): void {
    if (modalRef) {
      modalRef.destroy();
    }
    this.newTicketDepartment = null;
    this.newTicketTopic = null;
    this.newTicketAttachedFile = null;
    this.newTicketFile = null;
    this.newTicketTitle = '';
    this.newTicketContent = '';
  }

  submitTicket(modalRef?: NzModalRef): void {
    const topic = this.newTicketTopic ? this.topicByName[this.newTicketTopic] : undefined;
    const ticketName = this.newTicketTitle.trim();
    const ticketContent = this.newTicketContent.trim();
    if (!topic?.id || !isTopicActive(topic) || !ticketName || !ticketContent || this.tplModalButtonLoading) {
      return;
    }

    this.submitLoading.start();
    const upload$ = this.newTicketFile
      ? this.attachments.uploadAll([this.newTicketFile], this.auth.currentUsername())
      : of([]);
    upload$.pipe(
      switchMap((uploaded) => this.tickets.createTicket({
        topicId: topic.id,
        ticketName,
        ticketContent,
        attachedFile: this.newTicketAttachedFile,
        fileIds: uploaded.map((file) => file.fileId)
      }))
    ).subscribe({
      next: (created) => {
        this.people = [this.normalizeTicketData([created])[0], ...this.people];
        this.filteredPeople = this.applyAll();
        modalRef?.destroy();
      },
      error: (error) => {
        this.submitLoading.stop();
        this.notifications.error(this.attachments.errorMessage(error, 'Không thể tạo ticket. Vui lòng thử lại.'));
        console.error('Unable to create ticket:', error);
      },
      complete: () => {
        this.submitLoading.stop();
      }
    });
  }

  /** Xóa chủ đề đã chọn trước đó khi phòng ban thay đổi,
   * để không giữ lại lựa chọn Chủ đề cũ từ phòng ban khác. */
  onNewTicketDepartmentChange(): void {
    this.newTicketTopic = null;
    this.newTicketPriority = null;
    const deptCode = this.newTicketDepartment ? this.departmentCodeByName[this.newTicketDepartment] : undefined;
    this.newTicketTopicOptions = deptCode
      ? this.allTopics
          .filter((topic) => isTopicActive(topic) && topic.departmentCode === deptCode)
          .map((topic) => topic.topicName)
      : [];
  }

  /** Cập nhật ưu tiên tự động khi người dùng chọn Chủ đề mới trong modal. */
  onNewTicketTopicChange(): void {
    const selectedTopic = this.newTicketTopic ? this.topicByName[this.newTicketTopic] : undefined;
    if (!selectedTopic) {
      this.newTicketPriority = null;
      return;
    }

    const slaValue = selectedTopic.SLA;
    this.newTicketPriority = this.slaPriorityByValue[slaValue] ?? null;
  }

  /** Giữ tệp đã chọn sau khi kiểm tra dung lượng; tệp chỉ được tải lên khi gửi ticket. */
  beforeUploadTicketFile = (file: NzUploadFile): boolean => {
    const selected = (file.originFileObj ?? file) as unknown as File;
    const error = this.attachments.validate(selected);
    if (error) {
      this.notifications.error(error);
      this.clearNewTicketFile();
      return false;
    }

    this.newTicketFile = selected;
    this.newTicketAttachedFile = selected.name;
    return false;
  };

  clearNewTicketFile(): void {
    this.newTicketFile = null;
    this.newTicketAttachedFile = null;
  }

  onResponseFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selected = Array.from(input.files ?? []);
    if (selected.length) {
      const valid = this.attachments.filterValid(selected, (message) => this.notifications.error(message));
      this.newResponseFiles.push(...valid);
    }
    input.value = '';
  }

  removeResponseFile(index: number): void {
    this.newResponseFiles.splice(index, 1);
  }

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
        const responses = this.responseMap[ticketId] ??= [];
        responses.push(response as TicketResponse);
        this.selectedTicketResponses = [...responses];
        this.newResponseText = '';
        this.newResponseFiles = [];
      },
      error: (error) => this.notifications.error(this.attachments.errorMessage(error, 'Không thể gửi phản hồi. Vui lòng thử lại.'))
    });
  }
}
