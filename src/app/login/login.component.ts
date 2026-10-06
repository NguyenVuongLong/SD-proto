import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { REMEMBERED_USERNAME_STORAGE_KEY } from '../core/auth/auth.constants';
import { StorageHelper } from '../core/auth/storage.helper';
import { AuthService } from '../shared/services/auth.service';
import { NotificationService } from '../core/services/notification.service';

@Component({
  selector: 'app-login',
  styleUrls: ['./login.component.scss'],
  template: `
  <div class="login-page">
    <div class="login-page__admin">
      <div class="login-page__logo">
        <img class="login-page__logo-dark" src="../../../assets/images/logo/dongamoneytransfer.png" alt="logo" />
      </div>
      <div nz-row class="login-row">
        <div nz-col nzXs="24" nzSm="18" nzMd="12" nzXl="8" nzXXl="6">
          <div class="login-card">
            <div class="login-card__header">
              <h2 class="login-card__title">Đăng nhập</h2>
            </div>
            <div class="login-card__body">
              <form nz-form [formGroup]="validateForm" nzLayout="vertical" class="login-form" (ngSubmit)="submitForm()">
                <nz-form-item class="login-form__item">
                  <nz-form-label class="login-form__label" nzRequired nzFor="userName">Tên đăng nhập</nz-form-label>
                  <nz-form-control class="login-form__control" nzErrorTip="Vui lòng nhập tên đăng nhập!">
                    <input
                      class="login-form__input"
                      nz-input formControlName="userName" placeholder="Tên đăng nhập" id="userName" />
                  </nz-form-control>
                </nz-form-item>
                <nz-form-item class="login-form__item login-form__item--spaced">
                  <nz-form-label class="login-form__label" nzRequired nzFor="password">Mật khẩu</nz-form-label>
                  <nz-form-control class="login-form__control" nzErrorTip="Vui lòng nhập mật khẩu!">
                    <nz-input-group class="login-input-group" [nzSuffix]="suffixTemplate"
                      [class.login-input-group--error]="validateForm.get('password')?.invalid && validateForm.get('password')?.dirty">
                      <input nz-input formControlName="password" [type]="passwordVisible ? 'text' : 'password'"
                        id="password" placeholder="Mật khẩu" class="login-form__input login-form__input--password" />
                    </nz-input-group>
                    <ng-template #suffixTemplate>
                      <span class="login-input-group__suffix" nz-icon [nzType]="passwordVisible ? 'eye' : 'eye-invisible'"
                        (click)="passwordVisible = !passwordVisible"></span>
                    </ng-template>
                  </nz-form-control>
                </nz-form-item>
                <div class="login-form__actions">
                  <label nz-checkbox formControlName="remember" class="login-form__checkbox">
                    Ghi nhớ tên đăng nhập
                  </label>
                </div>
                <button nz-button type="submit" class="login-form__submit" [disabled]="isSubmitting">
                  {{ isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập' }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
})

export class LoginComponent implements OnInit {
  validateForm!: FormGroup;
  isSubmitting = false;
  passwordVisible = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService,
    private notifications: NotificationService
  ) {}

  submitForm(): void {
    if (this.validateForm.invalid || this.isSubmitting) {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    const userName = String(this.validateForm.get('userName')?.value ?? '').trim();
    const password = String(this.validateForm.get('password')?.value ?? '');
    const rememberUsername = Boolean(this.validateForm.get('remember')?.value);
    this.isSubmitting = true;

    this.auth.login(userName, password).pipe(
      finalize(() => this.isSubmitting = false)
    ).subscribe({
        next: (response) => {
          if (response.Code !== 'Success') {
            this.notifications.error(response.Message || response.message || 'Tên đăng nhập hoặc mật khẩu không đúng.');
            return;
          }

          if (rememberUsername) {
            StorageHelper.set(REMEMBERED_USERNAME_STORAGE_KEY, userName);
          } else {
            StorageHelper.remove(REMEMBERED_USERNAME_STORAGE_KEY);
          }
          this.router.navigate(['/']);
        },
        error: () => {
          this.notifications.error('Không thể kết nối đến dịch vụ xác thực. Vui lòng thử lại.');
        }
      });
  }

  ngOnInit(): void {
    this.auth.clearSession();
    const rememberedUsername = StorageHelper.get(REMEMBERED_USERNAME_STORAGE_KEY) ?? '';
    this.validateForm = this.fb.group({
      userName: [rememberedUsername, [Validators.required]],
      password: ['', [Validators.required]],
      remember: [Boolean(rememberedUsername)]
    });
  }
}