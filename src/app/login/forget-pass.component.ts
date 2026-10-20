import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../shared/services/auth.service';
import { NotificationService } from '../core/services/notification.service';

@Component({
  selector: 'app-forget-pass',
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
              <h2 class="login-card__title">Yêu cầu cấp lại mật khẩu</h2>
            </div>
            <div class="login-card__body">
              <form nz-form [formGroup]="resetForm" nzLayout="vertical" class="login-form" (ngSubmit)="submitForm()">
                <nz-form-item class="login-form__item">
                  <nz-form-label class="login-form__label" nzRequired nzFor="employeeCode">Mã nhân viên</nz-form-label>
                  <nz-form-control class="login-form__control" nzErrorTip="Vui lòng nhập mã nhân viên!">
                    <input class="login-form__input" nz-input formControlName="employeeCode"
                      placeholder="Mã nhân viên" id="employeeCode" />
                  </nz-form-control>
                </nz-form-item>
                <nz-form-item class="login-form__item login-form__item--spaced">
                  <nz-form-label class="login-form__label" nzRequired nzFor="idNo">Số CMND/CCCD</nz-form-label>
                  <nz-form-control class="login-form__control" nzErrorTip="Vui lòng nhập số CMND/CCCD!">
                    <input class="login-form__input" nz-input formControlName="idNo"
                      placeholder="Số CMND/CCCD" id="idNo" />
                  </nz-form-control>
                </nz-form-item>
                <nz-form-item class="login-form__item login-form__item--spaced">
                  <nz-form-label class="login-form__label" nzRequired nzFor="userName">Tên đăng nhập</nz-form-label>
                  <nz-form-control class="login-form__control" nzErrorTip="Vui lòng nhập tên đăng nhập!">
                    <input class="login-form__input" nz-input formControlName="userName"
                      placeholder="Tên đăng nhập" id="userName" />
                  </nz-form-control>
                </nz-form-item>
                <nz-form-item class="login-form__item login-form__item--spaced">
                  <nz-form-label class="login-form__label" nzRequired nzFor="password">Mật khẩu mới</nz-form-label>
                  <nz-form-control class="login-form__control" nzErrorTip="Vui lòng nhập mật khẩu mới!">
                    <input class="login-form__input" nz-input type="password" formControlName="password"
                      placeholder="Mật khẩu mới" id="password" />
                  </nz-form-control>
                </nz-form-item>
                <nz-form-item class="login-form__item login-form__item--spaced">
                  <nz-form-label class="login-form__label" nzRequired nzFor="confirmPassword">Xác nhận mật khẩu mới</nz-form-label>
                  <nz-form-control class="login-form__control"
                  [nzErrorTip]="resetForm.get('confirmPassword')?.hasError('passwordMismatch') ? 'Mật khẩu xác nhận không khớp!' : 'Vui lòng xác nhận mật khẩu mới!'">
                    <input class="login-form__input" nz-input type="password" formControlName="confirmPassword"
                      placeholder="Nhập lại mật khẩu mới" id="confirmPassword" />
                  </nz-form-control>
                </nz-form-item>
                <div class="login-form__actions">
                  <a routerLink="/login" class="login-form__forgot">Quay lại đăng nhập</a>
                </div>
                <button nz-button type="submit" class="login-form__submit" [disabled]="isSubmitting">
                  {{ isSubmitting ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu' }}
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
export class ForgetPassComponent {
  resetForm: FormGroup;
  isSubmitting = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly auth: AuthService,
    private readonly notifications: NotificationService
  ) {
    this.resetForm = this.fb.group({
      employeeCode: ['', Validators.required],
      idNo: ['', Validators.required],
      userName: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', [Validators.required, this.passwordsMatch]]
    });
    this.resetForm.get('password')?.valueChanges.subscribe(() => {
      this.resetForm.get('confirmPassword')?.updateValueAndValidity({ emitEvent: false });
    });
  }

  submitForm(): void {
    if (this.resetForm.invalid || this.isSubmitting) {
      Object.values(this.resetForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    const { employeeCode, idNo, userName, password } = this.resetForm.getRawValue();
    this.isSubmitting = true;
    this.auth.savePassRequest(
      String(employeeCode).trim(),
      String(idNo).trim(),
      String(userName).trim(),
      String(password)
    ).pipe(
      finalize(() => this.isSubmitting = false)
    ).subscribe({
      next: response => {
        if (response.Code !== 'Success') {
          this.notifications.error(response.Message || response.message || 'Không thể gửi yêu cầu cấp lại mật khẩu.');
          return;
        }

        this.notifications.success(response.Message || response.message || 'Yêu cầu cấp lại mật khẩu đã được gửi.');
        this.router.navigate(['/login']);
      },
      error: () => {
        this.notifications.error('Không thể kết nối đến dịch vụ xác thực. Vui lòng thử lại.');
      }
    });
  }

  private passwordsMatch(control: AbstractControl): ValidationErrors | null {
    const password = control.parent?.get('password')?.value;
    return !control.value || password === control.value ? null : { passwordMismatch: true };
  }
}
