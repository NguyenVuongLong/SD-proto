import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() collapsed = false;
  @Output() toggle = new EventEmitter<void>();

  private sub?: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    
  }


  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onToggle(): void {
    this.toggle.emit();
  }
}