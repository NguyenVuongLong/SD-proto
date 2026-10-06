import { Component, TemplateRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TopicService } from '../../../core/services/topic.service';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { DialogService } from '../../../core/services/dialog.service';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
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
import { PaginationState } from '@shared/utils';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

interface Department {
  departmentCode: string;
  departmentName: string;
}

interface Employee {
  employeeCode: string;
  employeeName: string;
  userName?: string;
  departmentCode: string;
  status: string;
}

interface Sla {
  SLAcode: string;
  SLApriority: string;
  SLAvalue: string;
}

interface Topic {
  id: string;
  topicName: string;
  topicDescription: string;
  departmentCode: string;
  status: string; // 'active' | 'inactive'
  assignedEmployee: string;
  SLA: string;
  slaPriority?: string;
  slaCode?: string;
}

type SortField = 'id' | 'topicName' | 'department' | 'assignedEmployee' | 'status';
type SortOrder = 'asc' | 'desc';

@Component({
  selector: 'app-manage-topic',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzInputModule,
    NzSelectModule,
    NzTableModule,
    NzPaginationModule,
    NzFormModule,
    NzButtonModule,
    NzIconModule,
    PerfectScrollbarModule,
    NzSkeletonModule,
    NzGridModule,
    EditorModule
  ],
  providers: [
    {
        provide: PERFECT_SCROLLBAR_CONFIG,
        useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ],
  styleUrls: ['./manage-topic.component.scss'],
  template: `
    <div nz-row [nzGutter]="25">
      <div nz-col nzXs="24" class="mb-[25px]">
        <ng-container>
          <ng-container>
          <div class="bg-white dark:bg-white/10 m-0 p-0 text-theme-gray dark:text-white/60 text-[15px] rounded-10 relative mb-[25px]">
            <div class="pt-[30px] pb-[9px] px-[25px] text-dark dark:text-white/[.87] font-medium text-[17px] flex items-center justify-between max-sm:flex-col max-sm:gap-[15px]">
              <h4 class="mb-0 text-[20px] leading-6 font-medium text-dark dark:text-white/[.87]">Quản lý Chủ đề</h4>
              <button class="flex items-center px-[14px] text-sm text-white rounded-md font-semibold bg-primary border-primary h-10 gap-[6px]" nz-button (click)="openAddTopicModal()">
                <i class="text-[12px]" nz-icon nzType="plus"></i>
                <span class="m-0">Thêm chủ đề</span>
              </button>
            </div>
            <div class="px-[25px] pb-[25px]">
              <div class="flex items-center justify-center w-full mt-5 mb-[25px] max-md:flex-col max-md:justify-center gap-[15px]">
                <div class="inline-flex items-center flex-wrap w-full gap-[20px] max-md:justify-center">
                  <div class="inline-flex items-center">
                    <input
                      class="h-10 px-[20px] text-body dark:text-white/60 bg-white dark:bg-white/10 border-normal border-1 dark:border-white/10 rounded-[6px]"
                      nz-input
                      placeholder="Tìm theo tên hoặc mô tả chủ đề"
                      [(ngModel)]="searchValue"
                      (ngModelChange)="onSearchChange()"
                    />
                  </div>
                  <div class="inline-flex items-center">
                    <nz-select
                      class="min-w-[200px] [&>nz-select-top-control]:border-normal dark:[&>nz-select-top-control]:border-white/10 [&>nz-select-top-control]:bg-white [&>nz-select-top-control]:dark:bg-white/10 [&>nz-select-top-control]:shadow-none [&>nz-select-top-control]:text-dark [&>nz-select-top-control]:dark:text-white/60 [&>nz-select-top-control]:h-[40px] [&>nz-select-top-control]:flex [&>nz-select-top-control]:items-center [&>nz-select-top-control]:rounded-[6px] [&>nz-select-top-control]:px-[20px] [&>.ant-select-arrow]:text-light dark:[&>.ant-select-arrow]:text-white/60"
                      [(ngModel)]="employeeFilter"
                      (ngModelChange)="filterByEmployee()" nzPlaceHolder="Tìm theo nhân viên phụ trách" nzAllowClear
                    >
                      <nz-option *ngFor="let e of employeeOptionsForDepartmentName(departmentFilter)" [nzValue]="e" [nzLabel]="getEmployeeLabel(e)"></nz-option>
                    </nz-select>
                  </div>
                  <div class="inline-flex items-center">
                    <nz-select
                      class="min-w-[200px] [&>nz-select-top-control]:border-normal dark:[&>nz-select-top-control]:border-white/10 [&>nz-select-top-control]:bg-white [&>nz-select-top-control]:dark:bg-white/10 [&>nz-select-top-control]:shadow-none [&>nz-select-top-control]:text-dark [&>nz-select-top-control]:dark:text-white/60 [&>nz-select-top-control]:h-[40px] [&>nz-select-top-control]:flex [&>nz-select-top-control]:items-center [&>nz-select-top-control]:rounded-[6px] [&>nz-select-top-control]:px-[20px] [&>.ant-select-arrow]:text-light dark:[&>.ant-select-arrow]:text-white/60"
                      [(ngModel)]="departmentFilter"
                      (ngModelChange)="filterByDepartment()"
                      nzPlaceHolder="Tìm theo phòng ban"
                      nzAllowClear
                    >
                      <nz-option *ngFor="let deptName of departmentOptions" [nzValue]="deptName" [nzLabel]="deptName"></nz-option>
                    </nz-select>
                  </div>
                  <div class="inline-flex items-center">
                    <nz-select
                      class="min-w-[160px] [&>nz-select-top-control]:border-normal dark:[&>nz-select-top-control]:border-white/10 [&>nz-select-top-control]:bg-white [&>nz-select-top-control]:dark:bg-white/10 [&>nz-select-top-control]:shadow-none [&>nz-select-top-control]:text-dark [&>nz-select-top-control]:dark:text-white/60 [&>nz-select-top-control]:h-[40px] [&>nz-select-top-control]:flex [&>nz-select-top-control]:items-center [&>nz-select-top-control]:rounded-[6px] [&>nz-select-top-control]:px-[20px] [&>.ant-select-arrow]:text-light dark:[&>.ant-select-arrow]:text-white/60"
                      [(ngModel)]="slaFilter"
                      (ngModelChange)="filterBySLA()" nzPlaceHolder="Tìm theo SLA" nzAllowClear
                    >
                      <nz-option *ngFor="let sla of slaOptions" [nzValue]="sla.SLAcode" [nzLabel]="formatSlaTime(sla.SLAvalue, sla.SLApriority, sla.SLAcode)"></nz-option>
                    </nz-select>
                  </div>
                  <div class="inline-flex items-center">
                    <nz-select
                      class="min-w-[180px] capitalize [&>nz-select-top-control]:border-normal dark:[&>nz-select-top-control]:border-white/10 [&>nz-select-top-control]:bg-white [&>nz-select-top-control]:dark:bg-white/10 [&>nz-select-top-control]:shadow-none [&>nz-select-top-control]:text-dark [&>nz-select-top-control]:dark:text-white/60 [&>nz-select-top-control]:h-[40px] [&>nz-select-top-control]:flex [&>nz-select-top-control]:items-center [&>nz-select-top-control]:rounded-[6px] [&>nz-select-top-control]:px-[20px] [&>.ant-select-arrow]:text-light dark:[&>.ant-select-arrow]:text-white/60"
                      [(ngModel)]="statusFilter"
                      (ngModelChange)="filterByStatus()" nzPlaceHolder="Tìm theo trạng thái" nzAllowClear
                    >
                      <nz-option nzValue="active" nzLabel="Hoạt động"></nz-option>
                      <nz-option nzValue="inactive" nzLabel="Ngừng hoạt động"></nz-option>
                    </nz-select>
                  </div>
                </div>
              </div>
              <perfect-scrollbar>
                  <div class="w-full max-2xl:overflow-x-auto max-h-[450px]">
                    <nz-table #basicTable [nzData]="filteredTopics" [nzFrontPagination]="false" [nzShowPagination]="false">
                      <thead>
                        <tr>
                          <th class="bg-regularBG dark:bg-[#323440] px-[20px] py-[16px] text-start text-dark dark:text-white/[.87] text-[15px] font-medium border-none before:hidden rounded-s-[10px] capitalize cursor-pointer select-none" (click)="toggleSort('id')">Mã{{ sortArrow('id') }}</th>
                          <th class="bg-regularBG dark:bg-[#323440] px-[20px] py-[16px] text-start text-dark dark:text-white/[.87] text-[15px] font-medium border-none before:hidden capitalize cursor-pointer select-none" (click)="toggleSort('topicName')">Tên chủ đề{{ sortArrow('topicName') }}</th>
                          <th class="bg-regularBG dark:bg-[#323440] px-[20px] py-[16px] text-start text-dark dark:text-white/[.87] text-[15px] font-medium border-none before:hidden capitalize">Mô tả</th>
                          <th class="bg-regularBG dark:bg-[#323440] px-[20px] py-[16px] text-start text-dark dark:text-white/[.87] text-[15px] font-medium border-none before:hidden capitalize cursor-pointer select-none" (click)="toggleSort('department')">Phòng ban{{ sortArrow('department') }}</th>
                          <th class="bg-regularBG dark:bg-[#323440] px-[20px] py-[16px] text-start text-dark dark:text-white/[.87] text-[15px] font-medium border-none before:hidden capitalize cursor-pointer select-none" (click)="toggleSort('assignedEmployee')">Nhân viên phụ trách{{ sortArrow('assignedEmployee') }}</th>
                          <th class="bg-regularBG dark:bg-[#323440] px-[20px] py-[16px] text-start text-dark dark:text-white/[.87] text-[15px] font-medium border-none before:hidden capitalize">SLA</th>
                          <th class="bg-regularBG dark:bg-[#323440] px-[20px] py-[16px] text-start text-dark dark:text-white/[.87] text-[15px] font-medium border-none before:hidden capitalize cursor-pointer select-none rounded-e-[10px]" (click)="toggleSort('status')">Trạng thái{{ sortArrow('status') }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr class="group max-lg:whitespace-nowrap cursor-pointer" *ngFor="let topic of pagedTopics" (click)="viewTopic(topic)">
                          <td class="ltr:pr-[20px] rtl:pl-[20px] text-theme-gray dark:text-white/60 font-medium text-[15px] py-4 before:hidden border-none group-hover:bg-transparent">#{{ topic.id }}</td>
                          <td class="ltr:pr-[20px] rtl:pl-[20px] font-medium text-[15px] py-4 before:hidden border-none group-hover:bg-transparent text-dark dark:text-white/[.87]">{{ topic.topicName }}</td>
                          <td class="ltr:pr-[20px] rtl:pl-[20px] text-theme-gray dark:text-white/60 font-medium text-[15px] py-4 before:hidden border-none group-hover:bg-transparent max-w-[280px] truncate" [innerHTML]="topic.topicDescription"></td>
                          <td class="ltr:pr-[20px] rtl:pl-[20px] text-theme-gray dark:text-white/60 font-medium text-[15px] py-4 before:hidden border-none group-hover:bg-transparent">{{ getDepartmentName(topic.departmentCode) }}</td>
                          <td class="ltr:pr-[20px] rtl:pl-[20px] text-theme-gray dark:text-white/60 font-medium text-[15px] py-4 before:hidden border-none group-hover:bg-transparent">{{ getEmployeeLabel(topic.assignedEmployee) }}</td>
                          <td class="ltr:pr-[20px] rtl:pl-[20px] text-[15px] py-4 before:hidden border-none group-hover:bg-transparent">
                            <ng-container *ngIf="topic.slaCode; else noSla" [ngSwitch]="getSlaPriorityLabel(topic.slaCode)">
                              <span *ngSwitchCase="'Thấp'" class="inline-flex items-center justify-center bg-primary/10 text-primary min-h-[22px] px-2.5 text-xs font-medium rounded-[12px] whitespace-nowrap">{{ formatSlaTime(topic.SLA, topic.slaPriority, topic.slaCode) }}</span>
                              <span *ngSwitchCase="'Trung bình'" class="inline-flex items-center justify-center bg-secondary/10 text-secondary min-h-[22px] px-2.5 text-xs font-medium rounded-[12px] whitespace-nowrap">{{ formatSlaTime(topic.SLA, topic.slaPriority, topic.slaCode) }}</span>
                              <span *ngSwitchCase="'Cao'" class="inline-flex items-center justify-center bg-warning/10 text-warning min-h-[22px] px-2.5 text-xs font-medium rounded-[12px] whitespace-nowrap">{{ formatSlaTime(topic.SLA, topic.slaPriority, topic.slaCode) }}</span>
                              <span *ngSwitchCase="'Gấp'" class="inline-flex items-center justify-center bg-danger/10 text-danger min-h-[22px] px-2.5 text-xs font-medium rounded-[12px] whitespace-nowrap">{{ formatSlaTime(topic.SLA, topic.slaPriority, topic.slaCode) }}</span>
                              <span *ngSwitchDefault class="inline-flex items-center justify-center bg-primary/10 text-primary min-h-[22px] px-2.5 text-xs font-medium rounded-[12px] whitespace-nowrap">{{ formatSlaTime(topic.SLA, topic.slaPriority, topic.slaCode) }}</span>
                            </ng-container>
                            <ng-template #noSla><span class="text-theme-gray dark:text-white/60">—</span></ng-template>
                          </td>
                          <td class="ltr:pr-[20px] rtl:pl-[20px] text-theme-gray dark:text-white/60 font-medium text-[15px] py-4 before:hidden border-none group-hover:bg-transparent">
                            <span
                              class="inline-flex items-center justify-center bg-{{ statusColorMap[topic.status] || 'light' }}/10 text-{{ statusColorMap[topic.status] || 'light' }} min-h-[24px] px-3 text-xs font-medium rounded-[15px] capitalize"
                            >
                              {{ statusLabelMap[topic.status] || topic.status }}
                            </span>
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
                  [nzTotal]="filteredTopics.length"
                  (nzPageIndexChange)="onPageIndexChange($event)"
                ></nz-pagination>
              </div>
            </div>
          </div>
          </ng-container>

          <ng-template #addTopicTplTitle>
            <span>Thêm chủ đề</span>
          </ng-template>
          <ng-template #addTopicTplContent>
            <form nz-form nzLayout="vertical">
              <nz-form-item>
                <nz-form-control>
                  <nz-form-label nzRequired class="text-[15px] font-semibold text-dark dark:text-white/[.87] capitalize mb-[10px]">Tên chủ đề:</nz-form-label>
                  <input
                    class="h-[50px] border-normal dark:border-white/10 px-[20px] placeholder-shown:text-light-extra dark:placeholder-shown:text-white/60 rounded-[5px] dark:bg-white/10 dark:text-white/[.87]"
                    type="text"
                    nz-input
                    placeholder="Tên chủ đề"
                    name="topicName"
                    [(ngModel)]="newTopicDraft.topicName"
                  />
                </nz-form-control>
              </nz-form-item>
              <nz-form-item>
                <nz-form-control>
                  <nz-form-label class="text-[15px] font-semibold text-dark dark:text-white/[.87] capitalize mb-[10px]">Mô tả:</nz-form-label>
                  <editor
                    apiKey="{{ TINYMCE_API_KEY }}"
                    [init]="DEFAULT_EDITOR_INIT"
                    placeholder="Mô tả"
                    name="topicDescription"
                    [(ngModel)]="newTopicDraft.topicDescription"
                  ></editor>
                </nz-form-control>
              </nz-form-item>
              <nz-form-item>
                <nz-form-control>
                  <nz-form-label class="text-[15px] font-semibold text-dark dark:text-white/[.87] capitalize mb-[10px]">Phòng ban:</nz-form-label>
                  <nz-select
                    class="w-full [&>nz-select-top-control]:border-normal dark:[&>nz-select-top-control]:border-white/10 [&>nz-select-top-control]:bg-white [&>nz-select-top-control]:dark:bg-white/10 [&>nz-select-top-control]:shadow-none [&>nz-select-top-control]:text-dark [&>nz-select-top-control]:dark:text-white/60 [&>nz-select-top-control]:h-[44px] [&>nz-select-top-control]:flex [&>nz-select-top-control]:items-center [&>nz-select-top-control]:rounded-[6px] [&>nz-select-top-control]:px-[15px]"
                    [(ngModel)]="newTopicDraft.departmentCode"
                    name="department"
                    nzPlaceHolder="Chọn phòng ban"
                  >
                    <nz-option *ngFor="let dept of departments" [nzValue]="dept.departmentCode" [nzLabel]="dept.departmentName"></nz-option>
                  </nz-select>
                </nz-form-control>
              </nz-form-item>
              <nz-form-item>
                <nz-form-control>
                  <nz-form-label class="text-[15px] font-semibold text-dark dark:text-white/[.87] capitalize mb-[10px]">Nhân viên phụ trách:</nz-form-label>
                  <nz-select
                    class="w-full [&>nz-select-top-control]:border-normal dark:[&>nz-select-top-control]:border-white/10 [&>nz-select-top-control]:bg-white [&>nz-select-top-control]:dark:bg-white/10 [&>nz-select-top-control]:shadow-none [&>nz-select-top-control]:text-dark [&>nz-select-top-control]:dark:text-white/60 [&>nz-select-top-control]:h-[44px] [&>nz-select-top-control]:flex [&>nz-select-top-control]:items-center [&>nz-select-top-control]:rounded-[6px] [&>nz-select-top-control]:px-[15px]"
                    [(ngModel)]="newTopicDraft.assignedEmployee"
                    name="assignedEmployee"
                    nzPlaceHolder="Chọn nhân viên phụ trách"
                  >
                    <nz-option *ngFor="let e of employeeOptionsForDepartment(newTopicDraft.departmentCode)" [nzValue]="e" [nzLabel]="getEmployeeLabel(e)"></nz-option>
                  </nz-select>
                </nz-form-control>
              </nz-form-item>
              <nz-form-item>
                <nz-form-control>
                  <nz-form-label class="text-[15px] font-semibold text-dark dark:text-white/[.87] capitalize mb-[10px]">SLA áp dụng:</nz-form-label>
                  <nz-select
                    class="w-full [&>nz-select-top-control]:border-normal dark:[&>nz-select-top-control]:border-white/10 [&>nz-select-top-control]:bg-white [&>nz-select-top-control]:dark:bg-white/10 [&>nz-select-top-control]:shadow-none [&>nz-select-top-control]:text-dark [&>nz-select-top-control]:dark:text-white/60 [&>nz-select-top-control]:h-[44px] [&>nz-select-top-control]:flex [&>nz-select-top-control]:items-center [&>nz-select-top-control]:rounded-[6px] [&>nz-select-top-control]:px-[15px]"
                    [(ngModel)]="newTopicDraft.SLA"
                    name="newTopicSla"
                    nzPlaceHolder="Chọn SLA áp dụng"
                  >
                      <nz-option *ngFor="let sla of slaOptions" [nzValue]="sla.SLAcode" [nzLabel]="formatSlaTime(sla.SLAvalue, sla.SLApriority, sla.SLAcode)"></nz-option>
                  </nz-select>
                </nz-form-control>
              </nz-form-item>
              <nz-form-item>
                <nz-form-control>
                  <nz-form-label class="text-[15px] font-semibold text-dark dark:text-white/[.87] capitalize mb-[10px]">Trạng thái:</nz-form-label>
                  <nz-select
                    class="w-full [&>nz-select-top-control]:border-normal dark:[&>nz-select-top-control]:border-white/10 [&>nz-select-top-control]:bg-white [&>nz-select-top-control]:dark:bg-white/10 [&>nz-select-top-control]:shadow-none [&>nz-select-top-control]:text-dark [&>nz-select-top-control]:dark:text-white/60 [&>nz-select-top-control]:h-[44px] [&>nz-select-top-control]:flex [&>nz-select-top-control]:items-center [&>nz-select-top-control]:rounded-[6px] [&>nz-select-top-control]:px-[15px]"
                    [(ngModel)]="newTopicDraft.status"
                    name="status"
                  >
                    <nz-option nzValue="active" nzLabel="Hoạt động"></nz-option>
                    <nz-option nzValue="inactive" nzLabel="Ngừng hoạt động"></nz-option>
                  </nz-select>
                </nz-form-control>
              </nz-form-item>
            </form>
          </ng-template>
          <ng-template #addTopicTplFooter let-ref="modalRef">
            <button nz-button (click)="ref.destroy()">Hủy</button>
            <button nz-button nzType="primary" (click)="confirmAddTopic(ref)">Lưu</button>
          </ng-template>

          <ng-template #detailTplTitle>
            <span>Chi tiết chủ đề #{{ selectedTopic?.id }}</span>
          </ng-template>
          <ng-template #detailTplContent>
            <div class="flex flex-col gap-[18px]" *ngIf="selectedTopic as topic">
              <div class="flex items-center justify-between flex-wrap gap-[10px]">
                <span class="text-[13px] font-medium text-theme-gray dark:text-white/60">Trạng thái:
                  <span class="inline-flex items-center justify-center bg-{{ statusColorMap[topic.status] || 'light' }}/10 text-{{ statusColorMap[topic.status] || 'light' }} min-h-[24px] px-3 text-xs font-medium rounded-[15px] capitalize">
                    {{ statusLabelMap[topic.status] || topic.status }}
                  </span>
                </span>
              </div>
              <div>
                <div class="text-[13px] font-semibold text-theme-gray dark:text-white/60 mb-1">Tên chủ đề</div>
                <div *ngIf="!editingTopicDetails" class="text-[15px] font-medium text-dark dark:text-white/[.87]">{{ topic.topicName }}</div>
                <input
                  *ngIf="editingTopicDetails"
                  class="h-[44px] w-full border-normal dark:border-white/10 px-[15px] rounded-[6px] dark:bg-white/10 dark:text-white/[.87]"
                  nz-input
                  placeholder="Tên chủ đề"
                  [(ngModel)]="editTopicName"
                />
              </div>
              <div>
                <div class="text-[13px] font-semibold text-theme-gray dark:text-white/60 mb-1">Mô tả</div>
                <div *ngIf="!editingTopicDetails" class="text-[15px] text-dark dark:text-white/[.87]" [innerHTML]="topic.topicDescription"></div>
                <editor
                  *ngIf="editingTopicDetails"
                  apiKey="{{ TINYMCE_API_KEY }}"
                  [init]="DEFAULT_EDITOR_INIT"
                  placeholder="Mô tả"
                  [(ngModel)]="editTopicDescription"
                ></editor>
              </div>
              <div>
                <div class="text-[13px] font-semibold text-theme-gray dark:text-white/60 mb-1">Phòng ban</div>
                <div *ngIf="!editingTopicDetails" class="text-[15px] font-medium text-dark dark:text-white/[.87]">{{ getDepartmentName(topic.departmentCode) }}</div>
                <nz-select
                  *ngIf="editingTopicDetails"
                  class="w-full [&>nz-select-top-control]:border-normal dark:[&>nz-select-top-control]:border-white/10 [&>nz-select-top-control]:bg-white [&>nz-select-top-control]:dark:bg-white/10 [&>nz-select-top-control]:shadow-none [&>nz-select-top-control]:text-dark [&>nz-select-top-control]:dark:text-white/60 [&>nz-select-top-control]:h-[44px] [&>nz-select-top-control]:flex [&>nz-select-top-control]:items-center [&>nz-select-top-control]:rounded-[6px] [&>nz-select-top-control]:px-[15px]"
                  [(ngModel)]="editTopicDepartment"
                  name="editTopicDepartment"
                  nzPlaceHolder="Chọn phòng ban"
                >
                  <nz-option *ngFor="let dept of departments" [nzValue]="dept.departmentCode" [nzLabel]="dept.departmentName"></nz-option>
                </nz-select>
              </div>
              <div>
                <div class="text-[13px] font-semibold text-theme-gray dark:text-white/60 mb-1">Nhân viên phụ trách</div>
                <div *ngIf="!editingTopicDetails" class="text-[15px] font-medium text-dark dark:text-white/[.87]">{{ getEmployeeLabel(topic.assignedEmployee) }}</div>
                <nz-select
                  *ngIf="editingTopicDetails"
                  class="w-full [&>nz-select-top-control]:border-normal dark:[&>nz-select-top-control]:border-white/10 [&>nz-select-top-control]:bg-white [&>nz-select-top-control]:dark:bg-white/10 [&>nz-select-top-control]:shadow-none [&>nz-select-top-control]:text-dark [&>nz-select-top-control]:dark:text-white/60 [&>nz-select-top-control]:h-[44px] [&>nz-select-top-control]:flex [&>nz-select-top-control]:items-center [&>nz-select-top-control]:rounded-[6px] [&>nz-select-top-control]:px-[15px]"
                  [(ngModel)]="editTopicAssignedEmployee"
                  name="editAssignedEmployee"
                  nzPlaceHolder="Chọn nhân viên phụ trách"
                >
                    <nz-option *ngFor="let e of employeeOptionsForDepartment(editTopicDepartment)" [nzValue]="e" [nzLabel]="getEmployeeLabel(e)"></nz-option>
                </nz-select>
              </div>
              <div>
                <div class="text-[13px] font-semibold text-theme-gray dark:text-white/60 mb-1">SLA áp dụng</div>
                <div *ngIf="!editingTopicDetails" class="flex flex-wrap gap-[8px]">
                  <ng-container *ngIf="topic.slaCode; else noSlaDetail" [ngSwitch]="getSlaPriorityLabel(topic.slaCode)">
                    <span *ngSwitchCase="'Thấp'" class="inline-flex items-center justify-center bg-primary/10 text-primary min-h-[24px] px-3 text-xs font-medium rounded-[15px] whitespace-nowrap">{{ formatSlaTime(topic.SLA, topic.slaPriority, topic.slaCode) }}</span>
                    <span *ngSwitchCase="'Trung bình'" class="inline-flex items-center justify-center bg-secondary/10 text-secondary min-h-[24px] px-3 text-xs font-medium rounded-[15px] whitespace-nowrap">{{ formatSlaTime(topic.SLA, topic.slaPriority, topic.slaCode) }}</span>
                    <span *ngSwitchCase="'Cao'" class="inline-flex items-center justify-center bg-warning/10 text-warning min-h-[24px] px-3 text-xs font-medium rounded-[15px] whitespace-nowrap">{{ formatSlaTime(topic.SLA, topic.slaPriority, topic.slaCode) }}</span>
                    <span *ngSwitchCase="'Gấp'" class="inline-flex items-center justify-center bg-danger/10 text-danger min-h-[24px] px-3 text-xs font-medium rounded-[15px] whitespace-nowrap">{{ formatSlaTime(topic.SLA, topic.slaPriority, topic.slaCode) }}</span>
                    <span *ngSwitchDefault class="inline-flex items-center justify-center bg-primary/10 text-primary min-h-[24px] px-3 text-xs font-medium rounded-[15px] whitespace-nowrap">{{ formatSlaTime(topic.SLA, topic.slaPriority, topic.slaCode) }}</span>
                  </ng-container>
                  <ng-template #noSlaDetail><span class="text-[13px] text-theme-gray dark:text-white/60">—</span></ng-template>
                </div>
                <nz-select
                  *ngIf="editingTopicDetails"
                  class="w-full [&>nz-select-top-control]:border-normal dark:[&>nz-select-top-control]:border-white/10 [&>nz-select-top-control]:bg-white [&>nz-select-top-control]:dark:bg-white/10 [&>nz-select-top-control]:shadow-none [&>nz-select-top-control]:text-dark [&>nz-select-top-control]:dark:text-white/60 [&>nz-select-top-control]:h-[44px] [&>nz-select-top-control]:flex [&>nz-select-top-control]:items-center [&>nz-select-top-control]:rounded-[6px] [&>nz-select-top-control]:px-[15px]"
                  [(ngModel)]="editTopicSLA"
                  name="editTopicSla"
                  nzPlaceHolder="Chọn SLA áp dụng"
                >
                  <nz-option *ngFor="let sla of slaOptions" [nzValue]="sla.SLAcode" [nzLabel]="formatSlaTime(sla.SLAvalue, sla.SLApriority, sla.SLAcode)"></nz-option>
                </nz-select>
              </div>
              <div class="flex flex-wrap items-center justify-left gap-[10px] pt-[18px] border-t border-regular dark:border-white/10">
                <div class="flex flex-wrap items-center gap-[10px]">
                  <button *ngIf="editingTopicDetails" nz-button nzType="primary" (click)="saveTopicDetails()">Lưu</button>
                  <button *ngIf="editingTopicDetails" nz-button (click)="cancelEditTopicDetails()">Hủy</button>
                  <button *ngIf="!editingTopicDetails" nz-button (click)="startEditTopicDetails()">Chỉnh sửa</button>
                </div>
                <div class="flex flex-wrap items-center gap-[10px]">
                  <button *ngIf="topic.status === 'active'" nz-button nzType="primary" nzDanger (click)="deactivateTopic()">Ngừng hoạt động</button>
                  <button *ngIf="topic.status !== 'active'" nz-button nzType="primary" (click)="activateTopic()">Kích hoạt lại</button>
                </div>
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

          <ng-template #assigneeTplTitle>
            <span>Đổi nhân viên phụ trách</span>
          </ng-template>
          <ng-template #assigneeTplContent>
            <nz-select
              class="w-full [&>nz-select-top-control]:border-normal dark:[&>nz-select-top-control]:border-white/10 [&>nz-select-top-control]:bg-white [&>nz-select-top-control]:dark:bg-white/10 [&>nz-select-top-control]:shadow-none [&>nz-select-top-control]:text-dark [&>nz-select-top-control]:dark:text-white/60 [&>nz-select-top-control]:h-[44px] [&>nz-select-top-control]:flex [&>nz-select-top-control]:items-center [&>nz-select-top-control]:rounded-[6px] [&>nz-select-top-control]:px-[15px]"
              [(ngModel)]="selectedNewAssignedEmployee"
              name="newAssignedEmployee"
              nzPlaceHolder="Chọn nhân viên phụ trách"
            >
                  <nz-option *ngFor="let e of employeeOptionsForDepartment(editTopicDepartment)" [nzValue]="e" [nzLabel]="getEmployeeLabel(e)"></nz-option>
            </nz-select>
          </ng-template>
          <ng-template #assigneeTplFooter let-ref="modalRef">
            <button nz-button (click)="ref.destroy()">Hủy</button>
            <button nz-button nzType="primary" (click)="confirmChangeAssignee(ref)">Lưu</button>
          </ng-template>

          <ng-template #slaTplTitle>
            <span>Đổi SLA áp dụng</span>
          </ng-template>
          <ng-template #slaTplContent>
            <nz-select
              class="w-full [&>nz-select-top-control]:border-normal dark:[&>nz-select-top-control]:border-white/10 [&>nz-select-top-control]:bg-white [&>nz-select-top-control]:dark:bg-white/10 [&>nz-select-top-control]:shadow-none [&>nz-select-top-control]:text-dark [&>nz-select-top-control]:dark:text-white/60 [&>nz-select-top-control]:h-[44px] [&>nz-select-top-control]:flex [&>nz-select-top-control]:items-center [&>nz-select-top-control]:rounded-[6px] [&>nz-select-top-control]:px-[15px]"
              [(ngModel)]="selectedTopicSLA"
              name="changeSla"
              nzPlaceHolder="Chọn SLA áp dụng"
            >
                  <nz-option *ngFor="let sla of slaOptions" [nzValue]="sla.SLAcode" [nzLabel]="formatSlaTime(sla.SLAvalue, sla.SLApriority, sla.SLAcode)"></nz-option>
            </nz-select>
          </ng-template>
          <ng-template #slaTplFooter let-ref="modalRef">
            <button nz-button (click)="ref.destroy()">Hủy</button>
            <button nz-button nzType="primary" (click)="confirmChangeSLA(ref)">Lưu</button>
          </ng-template>
        </ng-container>
      </div>
    </div>
  `,
})

export class ManageTopicComponent implements OnInit {
  readonly DEFAULT_EDITOR_INIT = DEFAULT_EDITOR_INIT;
  readonly TINYMCE_API_KEY = TINYMCE_API_KEY;
  @ViewChild('addTopicTplTitle') addTopicTplTitle!: TemplateRef<{}>;
  @ViewChild('addTopicTplContent') addTopicTplContent!: TemplateRef<{}>;
  @ViewChild('addTopicTplFooter') addTopicTplFooter!: TemplateRef<{}>;
  @ViewChild('detailTplTitle') detailTplTitle!: TemplateRef<{}>;
  @ViewChild('detailTplContent') detailTplContent!: TemplateRef<{}>;
  @ViewChild('detailTplFooter') detailTplFooter!: TemplateRef<{}>;
  @ViewChild('assigneeTplTitle') assigneeTplTitle!: TemplateRef<{}>;
  @ViewChild('assigneeTplContent') assigneeTplContent!: TemplateRef<{}>;
  @ViewChild('assigneeTplFooter') assigneeTplFooter!: TemplateRef<{}>;
  @ViewChild('slaTplTitle') slaTplTitle!: TemplateRef<{}>;
  @ViewChild('slaTplContent') slaTplContent!: TemplateRef<{}>;
  @ViewChild('slaTplFooter') slaTplFooter!: TemplateRef<{}>;

  searchValue = '';
  statusFilter = '';
  employeeFilter = '';
  departmentFilter = '';
  slaFilter = '';
  topics: Topic[] = [];
  filteredTopics: Topic[] = [];

  viewModalRef?: NzModalRef;
  selectedTopic: Topic | null = null;
  addTopicModalRef?: NzModalRef;
  editingTopicDetails = false;
  editTopicName = '';
  editTopicDescription = '';
  editTopicDepartment = '';
  editTopicAssignedEmployee = '';
  editTopicSLA = '';

  newTopicDraft: { topicName: string; topicDescription: string; departmentCode: string; status: string; assignedEmployee: string; SLA: string } = {
    topicName: '',
    topicDescription: '',
    departmentCode: '',
    status: 'active',
    assignedEmployee: '',
    SLA: ''
  };

  // Các modal con được mở từ trong dialog chi tiết chủ đề.
  subModalRef?: NzModalRef;
  selectedNewAssignedEmployee: string | null = null;
  selectedTopicSLA = '';

  slaOptions: Sla[] = [];
  slaByCode: Record<string, Sla> = {};

  sortField: SortField | null = null;
  sortOrder: SortOrder = 'asc';

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

  // Map giá trị `status` thô từ JSON sang nhãn hiển thị
  // và hậu tố token màu Tailwind (bg-{color}/10, text-{color}) cho badge.
  readonly statusLabelMap: { [key: string]: string } = {
    active: 'Hoạt động',
    inactive: 'Ngừng hoạt động'
  };
  
  readonly statusColorMap: { [key: string]: string } = {
    active: 'success',
    inactive: 'danger'
  };

  departments: Department[] = [];
  employees: Employee[] = [];
  departmentMap: Record<string, string> = {};

  // Bảng xếp hạng trạng thái tùy chỉnh để cột Trạng thái sắp xếp
  // `active` trước `inactive` thay vì theo thứ tự chữ cái.
  private readonly statusRank: { [key: string]: number } = {
    active: 1,
    inactive: 2
  };

  constructor(private topicService: TopicService, private dialog: DialogService) {}

  /** Phần tử của `filteredTopics` hiển thị trên trang hiện tại (10 mục/trang). */
  get pagedTopics(): Topic[] {
    const start = (this.pageIndex - 1) * this.pageSize;
    return this.filteredTopics.slice(start, start + this.pageSize);
  }

  /** Danh sách duy nhất các nhân viên được giao ít nhất một chủ đề, lấy từ dữ liệu. */
  get employeeOptions(): string[] {
    const uniqueEmployees = new Map<string, Employee>();
    for (const employee of this.employees) {
      const employeeCode = employee.employeeCode?.trim();
      const employeeName = employee.employeeName?.trim();
      const departmentCode = employee.departmentCode?.trim() ?? '';
      if (!employeeName) {
        continue;
      }

      const key = employeeCode || employeeName;
      if (!uniqueEmployees.has(key)) {
        uniqueEmployees.set(key, { employeeCode, employeeName, departmentCode, status: employee.status });
      }
    }

    return Array.from(uniqueEmployees.values())
      .sort((left, right) =>
        left.departmentCode.localeCompare(right.departmentCode) ||
        left.employeeName.localeCompare(right.employeeName) ||
        left.employeeCode.localeCompare(right.employeeCode)
      )
      .map((employee) => employee.employeeCode);
  }

  getEmployeeLabel(employeeValue: string): string {
    const value = employeeValue.trim().toLowerCase();
    const employee = this.employees.find((item) => {
      const identifiers = [item.employeeCode, item.employeeName, item.userName]
        .filter(Boolean)
        .map((identifier) => identifier!.trim().toLowerCase());
      return identifiers.includes(value) || `${item.employeeCode} - ${item.employeeName}`.toLowerCase() === value;
    });
    return employee ? `${employee.employeeCode} - ${employee.employeeName}` : employeeValue;
  }

  employeeOptionsForDepartment(departmentCode: string): string[] {
    const selectedDepartment = departmentCode.trim();
    return this.employeeOptions.filter((employeeCode) => {
      if (!selectedDepartment) {
        return true;
      }
      return this.employees.some((employee) =>
        employee.employeeCode === employeeCode && employee.departmentCode === selectedDepartment
      );
    });
  }

  employeeOptionsForDepartmentName(departmentName: string): string[] {
    const department = this.departments.find((item) => item.departmentName === departmentName);
    return this.employeeOptionsForDepartment(department?.departmentCode ?? '');
  }

  /** Danh sách duy nhất các phòng ban xuất hiện trong dữ liệu chủ đề. */
  get departmentOptions(): string[] {
    return Array.from(new Set(this.topics.map((t) => this.getDepartmentName(t.departmentCode)))).filter(Boolean);
  }

  /** Khởi tạo component: tải dữ liệu `topics` và `departments` từ các file JSON. */
  ngOnInit(): void {
    this.topicService.getSupportData().subscribe(
      ({ topics, departments, employees, sla }) => {
        this.departments = departments;
        this.employees = employees;
        this.slaOptions = sla as Sla[];
        this.slaByCode = this.slaOptions.reduce((map, item) => {
          map[item.SLAcode] = item;
          return map;
        }, {} as Record<string, Sla>);
        this.departmentMap = this.departments.reduce((map, department) => {
          map[department.departmentCode] = department.departmentName;
          return map;
        }, {} as Record<string, string>);

        this.topics = topics.map((topic) => this.normalizeTopic(topic));
        this.filteredTopics = this.applyAll();
      },
      (error) => {
        console.log('Error reading JSON files:', error);
      }
    );
  }

  onPageIndexChange(pageIndex: number): void {
    this.pageIndex = pageIndex;
  }

  onSearchChange(): void {
    this.refreshFilteredTopics();
  }

  filterByStatus(): void {
    this.refreshFilteredTopics();
  }

  filterByEmployee(): void {
    this.refreshFilteredTopics();
  }

  filterByDepartment(): void {
    if (this.employeeFilter && !this.employeeOptionsForDepartmentName(this.departmentFilter).includes(this.employeeFilter)) {
      this.employeeFilter = '';
    }
    this.refreshFilteredTopics();
  }

  /** Trả về tên phòng ban từ mã; nếu không tìm thấy trả về mã hoặc chuỗi rỗng. */
  getDepartmentName(departmentCode: string): string {
    return this.departmentMap[departmentCode] || departmentCode || '';
  }

  filterBySLA(): void {
    this.refreshFilteredTopics();
  }

  private refreshFilteredTopics(): void {
    this.pageIndex = 1;
    this.filteredTopics = this.applyAll();
  }

  /** Gọi khi click header bảng. Click lại cùng trường sẽ đổi asc/desc. */
  toggleSort(field: SortField): void {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'asc';
    }
    this.filteredTopics = this.applyAll();
  }

  /** Trả về mũi tên chỉ thị cho cột đang được sắp xếp (dùng trong template). */
  sortArrow(field: SortField): string {
    if (this.sortField !== field) {
      return '';
    }
    return this.sortOrder === 'asc' ? ' ▲' : ' ▼';
  }

  /** Thực thi pipeline kết hợp: tìm kiếm -> lọc theo status/department/employee/SLA -> sắp xếp. */
  private applyAll(): Topic[] {
    const searchQuery = this.searchValue.trim().toLowerCase();

    let result = this.topics.filter((topic) => {
      const departmentName = this.getDepartmentName(topic.departmentCode);
      const matchesSearch = !searchQuery ||
        topic.topicName.toLowerCase().includes(searchQuery) ||
        topic.topicDescription.toLowerCase().includes(searchQuery) ||
        topic.assignedEmployee.toLowerCase().includes(searchQuery) ||
        departmentName.toLowerCase().includes(searchQuery);
      const matchesStatus = !this.statusFilter || topic.status === this.statusFilter;
      const matchesDepartment = !this.departmentFilter || departmentName === this.departmentFilter;
      const matchesEmployee = !this.employeeFilter || topic.assignedEmployee === this.employeeFilter;
      const matchesSLA = !this.slaFilter || topic.slaCode === this.slaFilter;
      return matchesSearch && matchesStatus && matchesDepartment && matchesEmployee && matchesSLA;
    });

    if (this.sortField) {
      result = this.sortTopics(result, this.sortField, this.sortOrder);
    }

    return result;
  }

  /** Sắp xếp danh sách chủ đề theo trường và thứ tự (asc/desc). */
  private sortTopics(list: Topic[], field: SortField, order: SortOrder): Topic[] {
    const sorted = [...list].sort((a, b) => {
      let comparison = 0;

      switch (field) {
        case 'id':
          comparison = a.id.localeCompare(b.id, undefined, { numeric: true });
          break;
        case 'topicName':
          comparison = a.topicName.localeCompare(b.topicName);
          break;
        case 'department':
          comparison = this.getDepartmentName(a.departmentCode).localeCompare(this.getDepartmentName(b.departmentCode));
          break;
        case 'assignedEmployee':
          comparison = a.assignedEmployee.localeCompare(b.assignedEmployee);
          break;
        case 'status':
          comparison = (this.statusRank[a.status] ?? 0) - (this.statusRank[b.status] ?? 0);
          break;
      }

      return order === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }

  /** Chuẩn hóa chủ đề: nếu `SLA` là mảng thì lấy phần tử đầu, đảm bảo là chuỗi. */
  private normalizeTopic(topic: Topic): Topic {
    const slaCode = topic.slaCode ?? (topic as any).SlaCode ?? '';
    const sla = this.slaByCode[slaCode];
    const rawSla = sla?.SLAvalue ?? (Array.isArray(topic.SLA) ? (topic.SLA[0] ?? '') : topic.SLA);
    const employee = this.employees.find((item) =>
      item.employeeCode === topic.assignedEmployee || item.employeeName === topic.assignedEmployee
    );
    return {
      ...topic,
      assignedEmployee: employee?.employeeCode ?? topic.assignedEmployee,
      slaCode,
      slaPriority: sla?.SLApriority || topic.slaPriority || (topic as any).SlaPriority || (topic as any).SLApriority || '',
      SLA: rawSla ? rawSla.toString().trim() : ''
    };
  }

  /** Định dạng hiển thị SLA kèm nhãn ưu tiên, ví dụ: "Cao: 24 giờ". */
  formatSlaTime(value: string, priority?: string, slaCode?: string): string {
    const sla = slaCode ? this.slaByCode[slaCode] : undefined;
    const displayValue = sla?.SLAvalue ?? value;
    const displayPriority = sla?.SLApriority ?? priority ?? '';
    return displayPriority ? `${displayPriority} - ${displayValue} giờ` : `${displayValue} giờ`;
  }

  /** Trả về nhãn ưu tiên (Thấp/Trung bình/Cao/Gấp) dựa trên vị trí trong danh sách SLA. */
  getSlaPriorityLabel(slaCode: string): string {
    return this.slaByCode[slaCode]?.SLApriority ?? '';
  }

  /** Mở modal chi tiết cho `topic` đã chọn và thiết lập trạng thái chỉnh sửa. */
  viewTopic(topic: Topic): void {
    this.selectedTopic = topic;
    this.editingTopicDetails = false;
    this.loadTopicIntoEditFields(topic);
    this.viewModalRef = this.dialog.create({
      nzTitle: this.detailTplTitle,
      nzContent: this.detailTplContent,
      nzFooter: this.detailTplFooter,
      nzMaskClosable: true,
      nzClosable: true,
      nzWidth: 620
    });
    // Only clear the selected topic once the modal has fully finished closing
    // (whichever way it was closed), so the content doesn't disappear mid-animation.
    this.viewModalRef.afterClose.subscribe(() => {
      this.selectedTopic = null;
    });
  }

  /** Bắt đầu chế độ chỉnh sửa thông tin chủ đề trong dialog chi tiết. */
  startEditTopicDetails(): void {
    if (!this.selectedTopic) {
      return;
    }
    this.loadTopicIntoEditFields(this.selectedTopic);
    this.editingTopicDetails = true;
  }

  /** Lưu các thay đổi thông tin chủ đề (trong modal) vào bộ nhớ local và làm mới danh sách. */
  saveTopicDetails(): void {
    if (!this.selectedTopic) {
      return;
    }

    const updatedName = this.editTopicName.trim();
    if (!updatedName) {
      return;
    }

    const updatedTopic = {
      ...this.selectedTopic,
      topicName: updatedName,
      topicDescription: this.editTopicDescription.trim(),
      departmentCode: this.editTopicDepartment.trim(),
      assignedEmployee: this.editTopicAssignedEmployee.trim(),
      SLA: this.slaByCode[this.editTopicSLA]?.SLAvalue || this.editTopicSLA,
      slaCode: this.editTopicSLA
    };
    this.topicService.updateTopic(this.selectedTopic.id, this.toApiTopic(updatedTopic)).subscribe((saved) => {
      this.selectedTopic = this.normalizeTopic(saved);
      this.topics = this.topics.map((topic) => topic.id === this.selectedTopic!.id ? this.selectedTopic! : topic);
      this.editingTopicDetails = false;
      this.filteredTopics = this.applyAll();
    });
  }

  /** Hủy chỉnh sửa và phục hồi các trường về giá trị ban đầu của chủ đề đã chọn. */
  cancelEditTopicDetails(): void {
    if (!this.selectedTopic) {
      return;
    }
    this.loadTopicIntoEditFields(this.selectedTopic);
    this.editingTopicDetails = false;
  }

  private loadTopicIntoEditFields(topic: Topic): void {
    this.editTopicName = topic.topicName;
    this.editTopicDescription = topic.topicDescription;
    this.editTopicDepartment = topic.departmentCode;
    this.editTopicAssignedEmployee = topic.assignedEmployee;
    this.editTopicSLA = topic.slaCode || topic.SLA;
  }

  /** Mở modal để tạo chủ đề mới, và thiết lập draft mặc định. */
  openAddTopicModal(): void {
    this.newTopicDraft = {
      topicName: '',
      topicDescription: '',
      departmentCode: '',
      status: 'active',
      assignedEmployee: '',
      SLA: ''
    };

    this.addTopicModalRef = this.dialog.create({
      nzTitle: this.addTopicTplTitle,
      nzContent: this.addTopicTplContent,
      nzFooter: this.addTopicTplFooter,
      nzMaskClosable: true,
      nzClosable: true,
      nzWidth: 640
    });
  }

  /** Xác nhận tạo chủ đề mới, thêm vào danh sách và cập nhật bảng. */
  confirmAddTopic(modalRef?: NzModalRef): void {
    const topicName = this.newTopicDraft.topicName.trim();
    if (!topicName) {
      return;
    }

    const createdTopic: Topic = {
      id: '',
      topicName,
      topicDescription: this.newTopicDraft.topicDescription.trim(),
      departmentCode: this.newTopicDraft.departmentCode.trim(),
      status: this.newTopicDraft.status || 'active',
      assignedEmployee: this.newTopicDraft.assignedEmployee.trim(),
      SLA: this.slaByCode[this.newTopicDraft.SLA]?.SLAvalue || this.newTopicDraft.SLA,
      slaCode: this.newTopicDraft.SLA
    };

    this.topicService.createTopic(this.toApiTopic(createdTopic)).subscribe((saved) => {
      this.topics = [this.normalizeTopic(saved), ...this.topics];
      this.pageIndex = 1;
      this.filteredTopics = this.applyAll();
      if (modalRef) modalRef.destroy();
    });
  }

  /** Đóng modal chi tiết nếu tham số được cung cấp. */
  destroyDetailModal(modalRef?: NzModalRef): void {
    if (modalRef) {
      modalRef.destroy();
    }
  }

  // --- Thay đổi nhân viên phụ trách ---
  /** Mở modal con để đổi nhân viên phụ trách cho chủ đề đang chọn. */
  openChangeAssigneeModal(): void {
    if (!this.selectedTopic) {
      return;
    }
    this.selectedNewAssignedEmployee = this.selectedTopic.assignedEmployee;
    this.subModalRef = this.dialog.create({
      nzTitle: this.assigneeTplTitle,
      nzContent: this.assigneeTplContent,
      nzFooter: this.assigneeTplFooter,
      nzMaskClosable: true,
      nzClosable: true,
      nzWidth: 420
    });
  }

  /** Áp dụng thay đổi nhân viên phụ trách và đóng modal con. */
  confirmChangeAssignee(modalRef?: NzModalRef): void {
    if (this.selectedTopic && this.selectedNewAssignedEmployee) {
      const updated = { ...this.selectedTopic, assignedEmployee: this.selectedNewAssignedEmployee };
      this.topicService.updateTopic(updated.id, this.toApiTopic(updated)).subscribe((saved) => {
        this.selectedTopic = this.normalizeTopic(saved);
        this.topics = this.topics.map((topic) => topic.id === this.selectedTopic!.id ? this.selectedTopic! : topic);
        this.filteredTopics = this.applyAll();
      });
    }
    if (modalRef) {
      modalRef.destroy();
    }
  }

  // --- Thay đổi SLA ---
  /** Mở modal con để thay đổi SLA áp dụng cho chủ đề đang chọn. */
  openChangeSLAModal(): void {
    if (!this.selectedTopic) {
      return;
    }
    this.selectedTopicSLA = this.selectedTopic.slaCode || this.selectedTopic.SLA;
    this.subModalRef = this.dialog.create({
      nzTitle: this.slaTplTitle,
      nzContent: this.slaTplContent,
      nzFooter: this.slaTplFooter,
      nzMaskClosable: true,
      nzClosable: true,
      nzWidth: 380
    });
  }

  /** Áp dụng SLA mới cho chủ đề đang chọn và đóng modal con. */
  confirmChangeSLA(modalRef?: NzModalRef): void {
    if (this.selectedTopic) {
      const selectedSla = this.slaByCode[this.selectedTopicSLA];
      const updated = {
        ...this.selectedTopic,
        slaCode: selectedSla?.SLAcode || this.selectedTopicSLA,
        SLA: selectedSla?.SLAvalue || this.selectedTopicSLA,
        slaPriority: selectedSla?.SLApriority || this.selectedTopic.slaPriority
      };
      this.topicService.updateTopic(updated.id, this.toApiTopic(updated)).subscribe((saved) => {
        this.selectedTopic = this.normalizeTopic(saved);
        this.topics = this.topics.map((topic) => topic.id === this.selectedTopic!.id ? this.selectedTopic! : topic);
        this.filteredTopics = this.applyAll();
      });
    }
    if (modalRef) {
      modalRef.destroy();
    }
  }

  // --- Kích hoạt / Ngừng hoạt động ---
  /** Đặt trạng thái chủ đề thành `inactive` (ngừng hoạt động). */
  deactivateTopic(): void {
    if (!this.selectedTopic || this.selectedTopic.status === 'inactive') {
      return;
    }
    this.topicService.deleteTopic(this.selectedTopic.id).subscribe(() => {
      this.selectedTopic!.status = 'inactive';
      this.filteredTopics = this.applyAll();
    });
  }

  /** Đặt trạng thái chủ đề thành `active` (kích hoạt). */
  activateTopic(): void {
    if (!this.selectedTopic || this.selectedTopic.status === 'active') {
      return;
    }
    const updated = { ...this.selectedTopic, status: 'active' };
    this.topicService.updateTopic(updated.id, this.toApiTopic(updated)).subscribe((saved) => {
      this.selectedTopic = this.normalizeTopic(saved);
      this.topics = this.topics.map((topic) => topic.id === this.selectedTopic!.id ? this.selectedTopic! : topic);
      this.filteredTopics = this.applyAll();
    });
  }

  private toApiTopic(topic: Topic): any {
    return {
      topicName: topic.topicName,
      topicDescription: topic.topicDescription,
      departmentCode: topic.departmentCode,
      status: topic.status,
      assignedEmployee: topic.assignedEmployee,
      slaCode: topic.slaCode || '',
      slaHours: topic.SLA
    };
  }
}