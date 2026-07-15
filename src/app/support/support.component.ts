import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { TicketTableComponent } from './ticketTable';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, NzSkeletonModule, NzGridModule, TicketTableComponent],
  templateUrl: './support.component.html',
})
export class SupportComponent implements OnInit {
  isLoading = true;
  showContent = false;

  ngOnInit() {
    // Simulate loading time
    this.loadData();
  }

  loadData() {
    // Simulate an asynchronous data loading operation
    setTimeout(() => {
      this.isLoading = false;
      this.showContent = true;
    }, 500);
  }
}
