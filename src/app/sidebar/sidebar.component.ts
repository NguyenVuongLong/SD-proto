import { Component, EventEmitter, Input, Output } from '@angular/core';

interface SidebarMenuItem {
  title: string;
  path?: string;
  icon?: string;
  iconType?: 'nzIcon' | 'fontawesome';
  iconTheme?: 'outline' | 'fill' | 'twotone';
  submenu?: SidebarMenuItem[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() toggle = new EventEmitter<void>();

  menuGroupLabel = 'Cá nhân';

  /** Index of the currently expanded submenu (accordion-style, one open at a time) */
  expandedIndex: number | null = 0;

  menuItems: SidebarMenuItem[] = [
    {
      title: 'Hỗ trợ', 
      icon: 'customer-service', 
      iconType: 'nzIcon', 
      iconTheme: 'outline',
      submenu: [
        { title: 'Dashboard', path: '/dashboard' },
        { title: 'My Tickets', path: '/my-tickets' },
        { title: 'Quản lý Ticket', path: '/manage-tickets' },
        { title: 'Giám sát Ticket', path: '/monitor-ticket' },
        { title: 'Quản lý Chủ đề', path: '/manage-topic' }
      ]
    }
  ];

  onToggle(): void {
    this.toggle.emit();
  }

  toggleSubmenu(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }
}