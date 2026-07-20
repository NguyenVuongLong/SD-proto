import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { AngularSvgIconModule } from 'angular-svg-icon';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import ticketData from '../../assets/data/features/ticket-table.json';

// Tree-shakeable Chart.js registration — only pull in what the line chart needs.
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler);

// Shape of each row in ticket-table.json — not exported by the JSON file itself,
// declared here just so we get type-checking/autocomplete when reading it.
interface Ticket {
  id: string;
  subject: string;
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
}

interface TicketStats {
  total: number;
  open: number;
  overdue: number;
  closed: number;
}

interface TicketTrendPoint {
  label: string;
  sortValue: number;
  total: number;
  open: number;
  overdue: number;
  closed: number;
}

type Granularity = 'day' | 'week' | 'month' | 'year';

// Vietnamese dates in the ticket data are "dd/MM/yyyy" — parse them into real Date objects
// so we can compare against "today" for the overdue calculation.
function parseVnDate(value: string): Date | null {
  if (!value) return null;
  const [day, month, year] = value.split('/').map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
}

// ISO-8601 week number (Monday-start weeks, week 1 contains the year's first Thursday).
function getISOWeek(date: Date): number {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / (7 * 24 * 3600 * 1000));
}

// Buckets a date into a day/week/month/year period, returning a display label and a
// numeric key that sorts periods chronologically.
function getBucketInfo(date: Date, granularity: Granularity): { key: string; label: string; sortValue: number } {
  const year = date.getFullYear();

  if (granularity === 'year') {
    return { key: `${year}`, label: `${year}`, sortValue: year };
  }

  if (granularity === 'month') {
    const month = date.getMonth() + 1;
    return { key: `${year}-${month}`, label: `Th${month}/${year}`, sortValue: year * 100 + month };
  }

  if (granularity === 'day') {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return {
      key: `${year}-${month}-${day}`,
      label: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`,
      sortValue: date.getTime()
    };
  }

  const week = getISOWeek(date);
  return { key: `${year}-W${week}`, label: `Tuần ${week}/${year}`, sortValue: year * 100 + week };
}

@Component({
  selector: 'app-ticket-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, NzGridModule, NzCardModule, NzDatePickerModule, AngularSvgIconModule],
  template: `
  <div nz-row [nzGutter]="25">
    <div nz-col class="mb-[25px]" nzXs="24" nzMd="12" nzXXl="6">
      <div bordered="false"
        class="px-[25px] py-[39.50px] bg-white dark:bg-white/10 rounded-10 relative text-[15px] text-theme-gray dark:text-white/60 leading-6">
        <div class="flex justify-between">
          <div
            class="flex items-center justify-center order-2 bg-primary/10 text-primary w-[58px] h-[58px] rounded-2xl">
            <div
              class="fill-primary  flex items-center">
              <svg-icon class="w-[30px] h-[30px] [&>svg]:w-full [&>svg]:h-full" src="assets/images/svg/unicons-line/ticket.svg"></svg-icon>
            </div>
          </div>
          <div>
            <h4
              class="mb-0 text-3xl max-lg:text-[26px] max-sm:text-2xl font-semibold leading-normal text-dark dark:text-white/[.87]">
              <span> {{ stats.total }} </span>
            </h4>
            <span class="font-normal text-body dark:text-white/60 text-15">Tổng số ticket</span>
          </div>
        </div>
      </div>
    </div>

    <div nz-col class="mb-[25px]" nzXs="24" nzMd="12" nzXXl="6">
      <div bordered="false"
        class="px-[25px] py-[39.50px] bg-white dark:bg-white/10 rounded-10 relative text-[15px] text-theme-gray dark:text-white/60 leading-6">
        <div class="flex justify-between">
          <div
            class="flex items-center justify-center order-2 bg-secondary/10 text-secondary w-[58px] h-[58px] rounded-2xl">
            <div
              class="fill-secondary  flex items-center">
              <svg-icon class="w-[30px] h-[30px] [&>svg]:w-full [&>svg]:h-full" src="assets/images/svg/unicons-line/ticket.svg"></svg-icon>
            </div>
          </div>
          <div>
            <h4
              class="mb-0 text-3xl max-lg:text-[26px] max-sm:text-2xl font-semibold leading-normal text-dark dark:text-white/[.87]">
              <span> {{ stats.open }} </span>
            </h4>
            <span class="font-normal text-body dark:text-white/60 text-15">Ticket mở</span>
          </div>
        </div>
      </div>
    </div>

    <div nz-col class="mb-[25px]" nzXs="24" nzMd="12" nzXXl="6">
      <div bordered="false"
        class="px-[25px] py-[39.50px] bg-white dark:bg-white/10 rounded-10 relative text-[15px] text-theme-gray dark:text-white/60 leading-6">
        <div class="flex justify-between">
          <div
            class="flex items-center justify-center order-2 bg-warning/10 text-warning w-[58px] h-[58px] rounded-2xl">
            <div
              class="fill-warning  flex items-center">
              <svg-icon class="w-[30px] h-[30px] [&>svg]:w-full [&>svg]:h-full" src="assets/images/svg/unicons-line/ticket.svg"></svg-icon>
            </div>
          </div>
          <div>
            <h4
              class="mb-0 text-3xl max-lg:text-[26px] max-sm:text-2xl font-semibold leading-normal text-dark dark:text-white/[.87]">
              <span> {{ stats.overdue }} </span>
            </h4>
            <span class="font-normal text-body dark:text-white/60 text-15">Ticket overdue</span>
          </div>
        </div>
      </div>
    </div>

    <div nz-col class="mb-[25px]" nzXs="24" nzMd="12" nzXXl="6">
      <div bordered="false"
        class="px-[25px] py-[39.50px] bg-white dark:bg-white/10 rounded-10 relative text-[15px] text-theme-gray dark:text-white/60 leading-6">
        <div class="flex justify-between">
          <div
            class="flex items-center justify-center order-2 bg-success/10 text-success w-[58px] h-[58px] rounded-2xl">
            <div
              class="fill-success  flex items-center">
              <svg-icon class="w-[30px] h-[30px] [&>svg]:w-full [&>svg]:h-full" src="assets/images/svg/unicons-line/ticket.svg"></svg-icon>
            </div>
          </div>
          <div>
            <h4
              class="mb-0 text-3xl max-lg:text-[26px] max-sm:text-2xl font-semibold leading-normal text-dark dark:text-white/[.87]">
              <span> {{ stats.closed }} </span>
            </h4>
            <span class="font-normal text-body dark:text-white/60 text-15">Ticket đóng</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div nz-row [nzGutter]="25">
    <div nz-col nzXs="24">
      <div bordered="false"
        class="p-[25px] bg-white dark:bg-white/10 rounded-10 relative text-[15px] text-theme-gray dark:text-white/60 leading-6">
        <div class="flex items-center justify-between flex-wrap gap-[10px] mb-[20px]">
          <h5 class="mb-0 text-lg font-medium text-dark dark:text-white/[.87]">Thống kê ticket</h5>
          <div class="flex items-center flex-wrap gap-[10px]">
            <nz-range-picker
              [ngModel]="dateRange"
              (ngModelChange)="onDateRangeChange($event)"
              nzFormat="dd/MM/yyyy"
              [nzPlaceHolder]="['Từ ngày', 'Đến ngày']">
            </nz-range-picker>
            <div class="flex rounded-lg overflow-hidden border border-gray-200 dark:border-white/10">
              <button type="button"
                (click)="setGranularity('day')"
                [class.bg-primary]="granularity === 'day'"
                [class.text-white]="granularity === 'day'"
                class="px-[16px] py-[6px] text-sm font-medium transition-colors">
                Ngày
              </button>
              <button type="button"
                (click)="setGranularity('week')"
                [class.bg-primary]="granularity === 'week'"
                [class.text-white]="granularity === 'week'"
                class="px-[16px] py-[6px] text-sm font-medium transition-colors">
                Tuần
              </button>
              <button type="button"
                (click)="setGranularity('month')"
                [class.bg-primary]="granularity === 'month'"
                [class.text-white]="granularity === 'month'"
                class="px-[16px] py-[6px] text-sm font-medium transition-colors">
                Tháng
              </button>
              <button type="button"
                (click)="setGranularity('year')"
                [class.bg-primary]="granularity === 'year'"
                [class.text-white]="granularity === 'year'"
                class="px-[16px] py-[6px] text-sm font-medium transition-colors">
                Năm
              </button>
            </div>
          </div>
        </div>
        <div class="relative h-[320px]">
          <canvas #ticketTrendChart></canvas>
        </div>
      </div>
    </div>
  </div>
  `
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('ticketTrendChart') ticketTrendChartRef!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | null = null;
  tickets: Ticket[] = ticketData as Ticket[];
  stats: TicketStats = { total: 0, open: 0, overdue: 0, closed: 0 };
  trend: TicketTrendPoint[] = [];
  granularity: Granularity = 'day';
  dateRange: Date[] | null = null;

  ngOnInit(): void {
    this.stats = this.computeStats(this.tickets);
    this.trend = this.computeTrend(this.getFilteredTickets(), this.granularity);
  }

  ngAfterViewInit(): void {
    this.renderChart();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  setGranularity(granularity: Granularity): void {
    if (this.granularity === granularity) return;
    this.granularity = granularity;
    this.trend = this.computeTrend(this.getFilteredTickets(), this.granularity);
    this.chart?.destroy();
    this.renderChart();
  }

  onDateRangeChange(range: Date[] | null): void {
    this.dateRange = range && range.length === 2 ? range : null;
    this.trend = this.computeTrend(this.getFilteredTickets(), this.granularity);
    this.chart?.destroy();
    this.renderChart();
  }

  // Tickets whose createdDate falls within the selected range (inclusive). No range selected = all tickets.
  private getFilteredTickets(): Ticket[] {
    if (!this.dateRange) return this.tickets;

    const [start, end] = this.dateRange;
    const startOfDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endOfDay = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999);

    return this.tickets.filter(t => {
      const created = parseVnDate(t.createdDate);
      return created !== null && created >= startOfDay && created <= endOfDay;
    });
  }

  private renderChart(): void {
    const ctx = this.ticketTrendChartRef?.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.trend.map(p => p.label),
        datasets: [
          {
            label: 'Tổng số ticket',
            data: this.trend.map(p => p.total),
            borderColor: '#8A5CF6',
            backgroundColor: 'rgba(138, 92, 246, 0.12)',
            tension: 0.35,
            fill: false,
            pointRadius: 4
          },
          {
            label: 'Ticket mở',
            data: this.trend.map(p => p.open),
            borderColor: '#4C6FFF',
            backgroundColor: 'rgba(76, 111, 255, 0.12)',
            tension: 0.35,
            fill: false,
            pointRadius: 4
          },
          {
            label: 'Ticket overdue',
            data: this.trend.map(p => p.overdue),
            borderColor: '#FFB53D',
            backgroundColor: 'rgba(255, 181, 61, 0.12)',
            tension: 0.35,
            fill: false,
            pointRadius: 4
          },
          {
            label: 'Ticket đóng',
            data: this.trend.map(p => p.closed),
            borderColor: '#2BC155',
            backgroundColor: 'rgba(43, 193, 85, 0.12)',
            tension: 0.35,
            fill: false,
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 }
          }
        },
        plugins: {
          legend: { position: 'top' }
        }
      }
    });
  }

  private computeStats(tickets: Ticket[]): TicketStats {
    const today = new Date();

    const total = tickets.length;

    // "Hoàn thành" (closed) covers tickets explicitly closed by the requester.
    const closed = tickets.filter(t => t.actions === 'Hoàn thành').length;

    // Still active tickets: anything not closed (covers both "Mở" and "Đang xử lý").
    const activeTickets = tickets.filter(t => t.actions !== 'Hoàn thành');
    const open = activeTickets.length;

    // Overdue: still active AND the due date has already passed.
    const overdue = activeTickets.filter(t => {
      const due = parseVnDate(t.dueDate);
      return due !== null && due < today;
    }).length;

    return { total, open, overdue, closed };
  }

  private computeTrend(tickets: Ticket[], granularity: Granularity): TicketTrendPoint[] {
    // Group tickets into week/month/year buckets based on createdDate.
    const buckets = new Map<string, { label: string; sortValue: number; tickets: Ticket[] }>();

    for (const t of tickets) {
      const created = parseVnDate(t.createdDate);
      if (!created) continue;

      const { key, label, sortValue } = getBucketInfo(created, granularity);
      const bucket = buckets.get(key);
      if (bucket) {
        bucket.tickets.push(t);
      } else {
        buckets.set(key, { label, sortValue, tickets: [t] });
      }
    }

    return Array.from(buckets.values())
      .sort((a, b) => a.sortValue - b.sortValue)
      .map(bucket => {
        const bucketStats = this.computeStats(bucket.tickets);
        return {
          label: bucket.label,
          sortValue: bucket.sortValue,
          total: bucketStats.total,
          open: bucketStats.open,
          overdue: bucketStats.overdue,
          closed: bucketStats.closed
        };
      });
  }
}