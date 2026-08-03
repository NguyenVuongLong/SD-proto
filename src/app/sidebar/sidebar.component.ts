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
  styleUrls: ['./sidebar.component.scss'],
  template: `
  <div class="app-sidebar">
    <div class="app-sidebar__brand">
      <img class="app-sidebar__title" src="../../../assets/images/logo/dongamoneytransfer.png" alt="logo" />
    </div>

    <perfect-scrollbar class="app-sidebar__scroll">
      <div class="app-sidebar__group-label">{{ menuGroupLabel }}</div>
      <ul nz-menu nzMode="inline" nzTheme="light" class="app-sidebar__menu">
        <li *ngFor="let item of menuItems; let i = index"
            class="ant-menu-submenu ant-menu-submenu-inline"
            [class.ant-menu-submenu-open]="expandedIndex === i"
            [routerLinkActive]="(item.submenu?.length ?? 0) === 0 ? 'ant-menu-item-selected' : ''"
            [routerLinkActiveOptions]="{ exact: true }">
          <a class="ant-menu-submenu-title" (click)="toggleSubmenu(i)">
            <i *ngIf="item.iconType === 'nzIcon' && !!item.icon" nz-icon [nzType]="item.icon" [theme]="item.iconTheme ?? 'outline'"></i>
            <span>{{ item.title }}</span>
            <i class="ant-menu-submenu-arrow"></i>
          </a>
          <ul class="ant-menu ant-menu-inline ant-menu-sub dropdown-menu" [class.app-sidebar__submenu--collapsed]="expandedIndex !== i">
            <li *ngFor="let subItem of item.submenu"
                class="ant-menu-item"
                routerLinkActive="ant-menu-item-selected"
                [routerLinkActiveOptions]="{ exact: true }">
              <a [routerLink]="subItem.path" class="flex items-center gap-2">
                <span>{{ subItem.title }}</span>
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </perfect-scrollbar>
  </div>
  `
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