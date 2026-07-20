import { Component, TemplateRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
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
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';

import { PerfectScrollbarModule } from 'ngx-om-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-om-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-om-perfect-scrollbar';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

interface Topic {
  id: string;
  topicName: string;
  topicDescription: string;
  status: string; // 'active' | 'inactive'
  assignedEmployee: string;
  prioritySLA: Record<string, string>;
  SLA?: string[];
}

type SortField = 'id' | 'topicName' | 'assignedEmployee' | 'status';
type SortOrder = 'asc' | 'desc';

@Component({
  selector: 'manage-topic',
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
    NzCheckboxModule,
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
  styleUrls: ['./manage-topic.component.scss'],
  template: `
    <ng-template #loadingSkeleton>
      <nz-skeleton class="bg-white dark:bg-white/10 rounded-6 p-[30px] pt-[15px]" nzShape="circle" [nzAvatar]="true" [nzActive]="true"
        [nzParagraph]="{ rows: 15 }"></nz-skeleton>
    </ng-template>
    <ng-container *ngIf="showContent; else loadingSkeleton">
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
                <nz-option *ngFor="let e of employeeOptions" [nzValue]="e" [nzLabel]="e"></nz-option>
              </nz-select>
            </div>
            <div class="inline-flex items-center">
              <input
                class="h-10 min-w-[160px] px-[20px] text-body dark:text-white/60 bg-white dark:bg-white/10 border-normal border-1 dark:border-white/10 rounded-[6px]"
                nz-input
                placeholder="Tìm theo SLA"
                [(ngModel)]="slaFilter"
                (ngModelChange)="filterBySLA()"
              />
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
                    <th class="bg-regularBG dark:bg-[#323440] px-[20px] py-[16px] text-start text-dark dark:text-white/[.87] text-[15px] font-medium border-none before:hidden capitalize cursor-pointer select-none" (click)="toggleSort('assignedEmployee')">Nhân viên phụ trách{{ sortArrow('assignedEmployee') }}</th>
                    <th class="bg-regularBG dark:bg-[#323440] px-[20px] py-[16px] text-start text-dark dark:text-white/[.87] text-[15px] font-medium border-none before:hidden capitalize">SLA</th>
                    <th class="bg-regularBG dark:bg-[#323440] px-[20px] py-[16px] text-start text-dark dark:text-white/[.87] text-[15px] font-medium border-none before:hidden capitalize cursor-pointer select-none rounded-e-[10px]" (click)="toggleSort('status')">Trạng thái{{ sortArrow('status') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="group max-lg:whitespace-nowrap cursor-pointer" *ngFor="let topic of pagedTopics" (click)="viewTopic(topic)">
                    <td class="ltr:pr-[20px] rtl:pl-[20px] text-theme-gray dark:text-white/60 font-medium text-[15px] py-4 before:hidden border-none group-hover:bg-transparent">#{{ topic.id }}</td>
                    <td class="ltr:pr-[20px] rtl:pl-[20px] font-medium text-[15px] py-4 before:hidden border-none group-hover:bg-transparent text-dark dark:text-white/[.87]">{{ topic.topicName }}</td>
                    <td class="ltr:pr-[20px] rtl:pl-[20px] text-theme-gray dark:text-white/60 font-medium text-[15px] py-4 before:hidden border-none group-hover:bg-transparent max-w-[280px] truncate">{{ topic.topicDescription }}</td>
                    <td class="ltr:pr-[20px] rtl:pl-[20px] text-theme-gray dark:text-white/60 font-medium text-[15px] py-4 before:hidden border-none group-hover:bg-transparent">{{ topic.assignedEmployee }}</td>
                    <td class="ltr:pr-[20px] rtl:pl-[20px] text-[15px] py-4 before:hidden border-none group-hover:bg-transparent">
                      <div class="flex flex-wrap gap-[6px]">
                        <span *ngFor="let item of getTopicPrioritySLAEntries(topic)" class="inline-flex items-center justify-center bg-primary/10 text-primary min-h-[22px] px-2.5 text-xs font-medium rounded-[12px] whitespace-nowrap">
                          {{ item.priority }}: {{ item.time }}
                        </span>
                      </div>
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
            <textarea
              class="h-[118px] border-normal dark:border-white/10 px-[20px] placeholder-shown:text-light-extra dark:placeholder-shown:text-white/60 rounded-[5px] py-[15px] dark:bg-white/10 dark:text-white/60"
              nz-input
              placeholder="Mô tả"
              name="topicDescription"
              [(ngModel)]="newTopicDraft.topicDescription"
            ></textarea>
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
              <nz-option *ngFor="let e of employeeOptions" [nzValue]="e" [nzLabel]="e"></nz-option>
            </nz-select>
          </nz-form-control>
        </nz-form-item>
        <nz-form-item>
          <nz-form-control>
            <nz-form-label class="text-[15px] font-semibold text-dark dark:text-white/[.87] capitalize mb-[10px]">SLA theo ưu tiên:</nz-form-label>
            <div class="flex flex-col gap-[12px]">
              <div *ngFor="let priority of priorityLevels" class="flex items-center gap-[12px]">
                <label class="min-w-[90px] text-[14px] font-medium text-dark dark:text-white/[.87]">{{ priority }}</label>
                <div class="flex flex-1 items-center gap-[8px] rounded-[6px] border border-normal dark:border-white/10 bg-white dark:bg-white/10 px-[12px]">
                  <input
                    class="h-[40px] flex-1 border-0 bg-transparent px-0 text-dark dark:text-white/60 outline-none"
                    [ngModel]="getSlaNumericValue(newTopicDraft.prioritySLA[priority])"
                    (ngModelChange)="setNewTopicSlaValue(priority, $event)"
                    [name]="'new-topic-sla-' + priority"
                    type="number"
                    min="0"
                    placeholder="Nhập thời gian"
                  />
                  <span class="text-[14px] font-medium text-theme-gray dark:text-white/60">giờ</span>
                </div>
              </div>
            </div>
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
          <div *ngIf="!editingTopicDetails" class="text-[15px] text-dark dark:text-white/[.87] whitespace-pre-line">{{ topic.topicDescription }}</div>
          <textarea
            *ngIf="editingTopicDetails"
            class="h-[110px] w-full border-normal dark:border-white/10 px-[15px] py-[12px] rounded-[6px] dark:bg-white/10 dark:text-white/[.87]"
            nz-input
            placeholder="Mô tả"
            [(ngModel)]="editTopicDescription"
          ></textarea>
        </div>
        <div>
          <div class="text-[13px] font-semibold text-theme-gray dark:text-white/60 mb-1">Nhân viên phụ trách</div>
          <div *ngIf="!editingTopicDetails" class="text-[15px] font-medium text-dark dark:text-white/[.87]">{{ topic.assignedEmployee }}</div>
          <nz-select
            *ngIf="editingTopicDetails"
            class="w-full [&>nz-select-top-control]:border-normal dark:[&>nz-select-top-control]:border-white/10 [&>nz-select-top-control]:bg-white [&>nz-select-top-control]:dark:bg-white/10 [&>nz-select-top-control]:shadow-none [&>nz-select-top-control]:text-dark [&>nz-select-top-control]:dark:text-white/60 [&>nz-select-top-control]:h-[44px] [&>nz-select-top-control]:flex [&>nz-select-top-control]:items-center [&>nz-select-top-control]:rounded-[6px] [&>nz-select-top-control]:px-[15px]"
            [(ngModel)]="editTopicAssignedEmployee"
            name="editAssignedEmployee"
            nzPlaceHolder="Chọn nhân viên phụ trách"
          >
            <nz-option *ngFor="let e of employeeOptions" [nzValue]="e" [nzLabel]="e"></nz-option>
          </nz-select>
        </div>
        <div>
          <div class="text-[13px] font-semibold text-theme-gray dark:text-white/60 mb-1">SLA áp dụng</div>
          <div *ngIf="!editingTopicDetails" class="flex flex-col gap-[8px]">
            <div *ngFor="let item of getTopicPrioritySLAEntries(topic)" class="flex items-center justify-between gap-[12px] rounded-[8px] border border-regular dark:border-white/10 px-[12px] py-[8px]">
              <span class="text-[13px] font-medium text-dark dark:text-white/[.87]">{{ item.priority }}</span>
              <span class="inline-flex items-center justify-center bg-primary/10 text-primary min-h-[24px] px-3 text-xs font-medium rounded-[15px] whitespace-nowrap">
                {{ item.time }}
              </span>
            </div>
          </div>
          <div *ngIf="editingTopicDetails" class="flex flex-col gap-[12px]">
            <div *ngFor="let priority of priorityLevels" class="flex items-center gap-[12px]">
              <label class="min-w-[90px] text-[14px] font-medium text-dark dark:text-white/[.87]">{{ priority }}</label>
              <div class="flex flex-1 items-center gap-[8px] rounded-[6px] border border-normal dark:border-white/10 bg-white dark:bg-white/10 px-[12px]">
                <input
                  class="h-[40px] flex-1 border-0 bg-transparent px-0 text-dark dark:text-white/60 outline-none"
                  [ngModel]="getSlaNumericValue(editTopicPrioritySLA[priority])"
                  (ngModelChange)="setEditTopicSlaValue(priority, $event)"
                  [name]="'edit-topic-sla-' + priority"
                  type="number"
                  min="0"
                  placeholder="Nhập thời gian"
                />
                <span class="text-[14px] font-medium text-theme-gray dark:text-white/60">giờ</span>
              </div>
            </div>
          </div>
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
        <nz-option *ngFor="let e of employeeOptions" [nzValue]="e" [nzLabel]="e"></nz-option>
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
      <div class="flex flex-col gap-[12px]">
        <div *ngFor="let priority of priorityLevels" class="flex items-center gap-[12px]">
          <label class="min-w-[90px] text-[14px] font-medium text-dark dark:text-white/[.87]">{{ priority }}</label>
          <div class="flex flex-1 items-center gap-[8px] rounded-[6px] border border-normal dark:border-white/10 bg-white dark:bg-white/10 px-[12px]">
            <input
              class="h-[40px] flex-1 border-0 bg-transparent px-0 text-dark dark:text-white/60 outline-none"
              [ngModel]="getSlaNumericValue(selectedPrioritySLA[priority])"
              (ngModelChange)="setSelectedPrioritySlaValue(priority, $event)"
              [name]="'sla-' + priority"
              type="number"
              min="0"
              placeholder="Nhập thời gian"
            />
            <span class="text-[14px] font-medium text-theme-gray dark:text-white/60">giờ</span>
          </div>
        </div>
      </div>
    </ng-template>
    <ng-template #slaTplFooter let-ref="modalRef">
      <button nz-button (click)="ref.destroy()">Hủy</button>
      <button nz-button nzType="primary" (click)="confirmChangeSLA(ref)">Lưu</button>
    </ng-template>
  `,
})

export class ManageTopicComponent implements OnInit {
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
  slaFilter = '';
  topics: Topic[] = [];
  filteredTopics: Topic[] = [];

  viewModalRef?: NzModalRef;
  selectedTopic: Topic | null = null;
  addTopicModalRef?: NzModalRef;
  editingTopicDetails = false;
  editTopicName = '';
  editTopicDescription = '';
  editTopicAssignedEmployee = '';
  editTopicPrioritySLA: Record<string, string> = {};

  newTopicDraft: { topicName: string; topicDescription: string; status: string; assignedEmployee: string; prioritySLA: Record<string, string> } = {
    topicName: '',
    topicDescription: '',
    status: 'active',
    assignedEmployee: '',
    prioritySLA: {
      'Thấp': '24 giờ',
      'Trung bình': '24 giờ',
      'Cao': '24 giờ',
      'Gấp': '24 giờ'
    }
  };

  // Sub-dialogs launched from within the topic detail dialog.
  subModalRef?: NzModalRef;
  selectedNewAssignedEmployee: string | null = null;
  selectedPrioritySLA: Record<string, string> = {};

  readonly priorityLevels: string[] = ['Thấp', 'Trung bình', 'Cao', 'Gấp'];
  readonly slaOptions: string[] = ['24 giờ', '48 giờ', '72 giờ', '96 giờ'];

  sortField: SortField | null = null;
  sortOrder: SortOrder = 'asc';

  pageIndex = 1;
  readonly pageSize = 10;

  // Maps the raw `status` value from the JSON data to a display label
  // and to a Tailwind color-token suffix (bg-{color}/10, text-{color}) used for the badge.
  readonly statusLabelMap: { [key: string]: string } = {
    active: 'Hoạt động',
    inactive: 'Ngừng hoạt động'
  };
  
  readonly statusColorMap: { [key: string]: string } = {
    active: 'success',
    inactive: 'danger'
  };

  // Custom status ranking so the Trạng thái column sorts active-before-inactive
  // instead of relying on alphabetical order.
  private readonly statusRank: { [key: string]: number } = {
    active: 1,
    inactive: 2
  };

  constructor(private http: HttpClient, private modal: NzModalService) {}

  /** The slice of filteredTopics shown on the current page (10 items per page). */
  get pagedTopics(): Topic[] {
    const start = (this.pageIndex - 1) * this.pageSize;
    return this.filteredTopics.slice(start, start + this.pageSize);
  }

  /** Unique list of employees who are assigned to at least one topic, derived from the loaded data. */
  get employeeOptions(): string[] {
    return Array.from(new Set(this.topics.map((t) => t.assignedEmployee)));
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

  ngOnInit(): void {
    this.loadData();
    this.http.get<Topic[]>('assets/data/features/topic-table.json').subscribe(
      (data) => {
        this.topics = data.map((topic) => this.normalizeTopic(topic));
        this.filteredTopics = this.applyAll();
      },
      (error) => {
        console.log('Error reading JSON file:', error);
      }
    );
  }

  onPageIndexChange(pageIndex: number): void {
    this.pageIndex = pageIndex;
  }

  onSearchChange(): void {
    this.pageIndex = 1;
    this.filteredTopics = this.applyAll();
  }

  filterByStatus(): void {
    this.pageIndex = 1;
    this.filteredTopics = this.applyAll();
  }

  filterByEmployee(): void {
    this.pageIndex = 1;
    this.filteredTopics = this.applyAll();
  }

  filterBySLA(): void {
    this.pageIndex = 1;
    this.filteredTopics = this.applyAll();
  }

  /** Called when a table header is clicked. Clicking the same field flips asc/desc. */
  toggleSort(field: SortField): void {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'asc';
    }
    this.filteredTopics = this.applyAll();
  }

  /** Returns a small arrow indicator for the currently active sort column, used in the template. */
  sortArrow(field: SortField): string {
    if (this.sortField !== field) {
      return '';
    }
    return this.sortOrder === 'asc' ? ' ▲' : ' ▼';
  }

  /** Runs the combined pipeline: search by name/description -> filter by status/employee/SLA -> sort. */
  private applyAll(): Topic[] {
    const searchQuery = this.searchValue.trim().toLowerCase();

    let result = this.topics.filter((topic) => {
      const matchesSearch = !searchQuery ||
        topic.topicName.toLowerCase().includes(searchQuery) ||
        topic.topicDescription.toLowerCase().includes(searchQuery) ||
        topic.assignedEmployee.toLowerCase().includes(searchQuery);
      const matchesStatus = !this.statusFilter || topic.status === this.statusFilter;
      const matchesEmployee = !this.employeeFilter || topic.assignedEmployee === this.employeeFilter;
      const matchesSLA = !this.slaFilter || this.getTopicSLAValues(topic).some((value) => this.getSlaNumericValue(value) === this.getSlaNumericValue(this.slaFilter));
      return matchesSearch && matchesStatus && matchesEmployee && matchesSLA;
    });

    if (this.sortField) {
      result = this.sortTopics(result, this.sortField, this.sortOrder);
    }

    return result;
  }

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

  getTopicPrioritySLAEntries(topic: Topic): Array<{ priority: string; time: string }> {
    return this.priorityLevels.map((priority) => ({
      priority,
      time: this.formatSlaTime(topic.prioritySLA?.[priority] || '')
    }));
  }

  private normalizeTopic(topic: Topic): Topic {
    const rawSlaValues = Array.isArray((topic as Topic & { SLA?: string[] }).SLA)
      ? (topic as Topic & { SLA?: string[] }).SLA || []
      : [];

    const prioritySLA: Record<string, string> = {};
    this.priorityLevels.forEach((priority, index) => {
      const rawValue = rawSlaValues[index];
      prioritySLA[priority] = this.normalizeSlaValue(rawValue ?? '');
    });

    return {
      ...topic,
      prioritySLA,
      SLA: this.priorityLevels.map((priority) => prioritySLA[priority]).filter((value) => !!value)
    };
  }

  private formatSlaTime(value: string): string {
    const normalized = (value || '').toString().trim();
    if (!normalized) {
      return '—';
    }
    return normalized.endsWith('giờ') ? normalized : `${normalized} giờ`;
  }

  setNewTopicSlaValue(priority: string, value: string): void {
    this.newTopicDraft.prioritySLA[priority] = this.normalizeSlaValue(value);
  }

  setSelectedPrioritySlaValue(priority: string, value: string): void {
    this.selectedPrioritySLA[priority] = this.normalizeSlaValue(value);
  }

  getSlaNumericValue(value: string): string {
    const trimmed = (value || '').toString().trim();
    if (!trimmed) {
      return '';
    }
    return trimmed.replace(/\s*giờ$/i, '').trim();
  }

  private normalizeSlaValue(value: string): string {
    const trimmed = (value || '').toString().trim();
    if (!trimmed) {
      return '';
    }
    const numericValue = trimmed.replace(/\s*giờ$/i, '').trim();
    return numericValue ? `${numericValue} giờ` : '';
  }

  getTopicSLAValues(topic: Topic): string[] {
    if (topic.prioritySLA && Object.keys(topic.prioritySLA).length) {
      return Object.values(topic.prioritySLA).filter((value) => !!value);
    }
    return (topic.SLA || []).map((value) => this.formatSlaTime(value));
  }

  viewTopic(topic: Topic): void {
    this.selectedTopic = topic;
    this.editingTopicDetails = false;
    this.editTopicName = topic.topicName;
    this.editTopicDescription = topic.topicDescription;
    this.editTopicAssignedEmployee = topic.assignedEmployee;
    this.editTopicPrioritySLA = { ...topic.prioritySLA };
    this.viewModalRef = this.modal.create({
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

  startEditTopicDetails(): void {
    if (!this.selectedTopic) {
      return;
    }
    this.editTopicName = this.selectedTopic.topicName;
    this.editTopicDescription = this.selectedTopic.topicDescription;
    this.editTopicAssignedEmployee = this.selectedTopic.assignedEmployee;
    this.editTopicPrioritySLA = { ...this.selectedTopic.prioritySLA };
    this.editingTopicDetails = true;
  }

  saveTopicDetails(): void {
    if (!this.selectedTopic) {
      return;
    }

    const updatedName = this.editTopicName.trim();
    if (!updatedName) {
      return;
    }

    this.selectedTopic.topicName = updatedName;
    this.selectedTopic.topicDescription = this.editTopicDescription.trim();
    this.selectedTopic.assignedEmployee = this.editTopicAssignedEmployee.trim();
    this.selectedTopic.prioritySLA = { ...this.editTopicPrioritySLA };
    this.selectedTopic.SLA = Object.values(this.selectedTopic.prioritySLA).filter((value) => !!value);
    this.editingTopicDetails = false;
    this.filteredTopics = this.applyAll();
  }

  cancelEditTopicDetails(): void {
    if (!this.selectedTopic) {
      return;
    }
    this.editTopicName = this.selectedTopic.topicName;
    this.editTopicDescription = this.selectedTopic.topicDescription;
    this.editTopicAssignedEmployee = this.selectedTopic.assignedEmployee;
    this.editTopicPrioritySLA = { ...this.selectedTopic.prioritySLA };
    this.editingTopicDetails = false;
  }

  setEditTopicSlaValue(priority: string, value: string): void {
    this.editTopicPrioritySLA[priority] = this.normalizeSlaValue(value);
  }

  openAddTopicModal(): void {
    this.newTopicDraft = {
      topicName: '',
      topicDescription: '',
      status: 'active',
      assignedEmployee: '',
      prioritySLA: {
        'Thấp': '24 giờ',
        'Trung bình': '24 giờ',
        'Cao': '24 giờ',
        'Gấp': '24 giờ'
      }
    };

    this.addTopicModalRef = this.modal.create({
      nzTitle: this.addTopicTplTitle,
      nzContent: this.addTopicTplContent,
      nzFooter: this.addTopicTplFooter,
      nzMaskClosable: true,
      nzClosable: true,
      nzWidth: 560
    });
  }

  confirmAddTopic(modalRef?: NzModalRef): void {
    const topicName = this.newTopicDraft.topicName.trim();
    if (!topicName) {
      return;
    }

    const nextId = this.topics.length
      ? String(Math.max(...this.topics.map((topic) => Number(topic.id) || 0)) + 1)
      : '1';

    const createdTopic: Topic = {
      id: nextId,
      topicName,
      topicDescription: this.newTopicDraft.topicDescription.trim(),
      status: this.newTopicDraft.status || 'active',
      assignedEmployee: this.newTopicDraft.assignedEmployee.trim(),
      prioritySLA: { ...this.newTopicDraft.prioritySLA },
      SLA: Object.values(this.newTopicDraft.prioritySLA).filter((value) => !!value)
    };

    this.topics = [createdTopic, ...this.topics];
    this.pageIndex = 1;
    this.filteredTopics = this.applyAll();

    if (modalRef) {
      modalRef.destroy();
    }
  }

  destroyDetailModal(modalRef?: NzModalRef): void {
    if (modalRef) {
      modalRef.destroy();
    }
  }

  // --- Change Nhân viên phụ trách ---
  openChangeAssigneeModal(): void {
    if (!this.selectedTopic) {
      return;
    }
    this.selectedNewAssignedEmployee = this.selectedTopic.assignedEmployee;
    this.subModalRef = this.modal.create({
      nzTitle: this.assigneeTplTitle,
      nzContent: this.assigneeTplContent,
      nzFooter: this.assigneeTplFooter,
      nzMaskClosable: true,
      nzClosable: true,
      nzWidth: 420
    });
  }

  confirmChangeAssignee(modalRef?: NzModalRef): void {
    if (this.selectedTopic && this.selectedNewAssignedEmployee) {
      this.selectedTopic.assignedEmployee = this.selectedNewAssignedEmployee;
    }
    if (modalRef) {
      modalRef.destroy();
    }
  }

  // --- Change SLA ---
  openChangeSLAModal(): void {
    if (!this.selectedTopic) {
      return;
    }
    this.selectedPrioritySLA = { ...this.selectedTopic.prioritySLA };
    this.subModalRef = this.modal.create({
      nzTitle: this.slaTplTitle,
      nzContent: this.slaTplContent,
      nzFooter: this.slaTplFooter,
      nzMaskClosable: true,
      nzClosable: true,
      nzWidth: 380
    });
  }

  confirmChangeSLA(modalRef?: NzModalRef): void {
    if (this.selectedTopic) {
      this.selectedTopic.prioritySLA = { ...this.selectedPrioritySLA };
      this.selectedTopic.SLA = Object.values(this.selectedTopic.prioritySLA).filter((value) => !!value);
    }
    if (modalRef) {
      modalRef.destroy();
    }
  }

  // --- Activate / Deactivate ---
  deactivateTopic(): void {
    if (!this.selectedTopic || this.selectedTopic.status === 'inactive') {
      return;
    }
    this.selectedTopic.status = 'inactive';
  }

  activateTopic(): void {
    if (!this.selectedTopic || this.selectedTopic.status === 'active') {
      return;
    }
    this.selectedTopic.status = 'active';
  }
}