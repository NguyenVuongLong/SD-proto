import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { SessionHelper } from '../core/auth/session.helper';
import { UserModel } from '../core/models';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-header',
  styleUrls: ['./header.component.scss'],
  template: `
  <div class="flex w-full items-center justify-between">
    <button nz-button nzType="text" class="app-shell__menu-button" (click)="onToggle()">
      ☰
    </button>
    <div class="flex items-center gap-3">
      <img
        class="app-header__profile-picture"
        [src]="src"
        [alt]="fullname"
        (error)="onProfilePictureError()"
      />
      <span class="hidden text-sm sm:block">{{ fullname }}</span>
      <button nz-button nzType="text" class="inline-flex items-center gap-2" aria-label="Đăng xuất" (click)="logout()">
        <i class="inline-flex items-center justify-center" nz-icon nzType="logout"></i>
        <span>Đăng xuất</span>
      </button>
    </div>
  </div>
  `
})
export class HeaderComponent implements OnInit {
  @Output() toggleMenu = new EventEmitter<void>();

  fullname = 'Bạn';
  employeeCode = '';
  gender: string | number | undefined;
  src = SessionHelper.getAvatar();

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    const user: UserModel | null = SessionHelper.getUser();
    if (!user) {
      return;
    }

    this.fullname = user.Fullname
      || user.fullname
      || user.FullName
      || user.fullName
      || user.EmployeeName
      || user.employeeName
      || user.DisplayName
      || user.displayName
      || user.UserName
      || user.userName
      || 'Bạn';
    this.employeeCode = user.EmployeeCode || user.employeeCode || '';
    this.gender = user.Gender ?? user.gender;
    this.src = SessionHelper.getAvatar(this.gender, this.employeeCode);
  }

  onProfilePictureError(): void {
    this.src = SessionHelper.getAvatar(this.gender);
  }

  onToggle(): void {
    this.toggleMenu.emit();
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
