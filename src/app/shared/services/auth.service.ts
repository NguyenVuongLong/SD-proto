import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { defer, Observable, tap } from 'rxjs';
import { AUTHENTICATED_USER_STORAGE_KEY, AUTH_LOGIN_DATE_STORAGE_KEY } from '../../core/auth/auth.constants';
import { EncryptHelper } from '../../core/auth/encrypt.helper';
import { SessionHelper } from '../../core/auth/session.helper';
import { StorageHelper } from '../../core/auth/storage.helper';
import { UserModel } from '../../core/models';
import { ReturnModel } from '../../core/models/auth.models';
import { BaseService } from './base.service';
import { DateHelper } from '../utils/date.helper';

@Injectable({ providedIn: 'root' })
export class AuthService extends BaseService {
  private authenticatedUser: UserModel | null = null;

  /**
   * Khởi tạo service xác thực với HttpClient và cấu hình cơ sở.
   */
  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Đăng nhập người dùng bằng username và password.
   */
  login(username: string, password: string): Observable<UserModel> {
    return defer(() => {
      const query = [
        `Username=${encodeURIComponent(EncryptHelper.aesEncrypt(username))}`,
        `Password=${encodeURIComponent(EncryptHelper.aesEncrypt(password))}`,
        `AppCode=${encodeURIComponent(EncryptHelper.aesEncrypt('E-INTRANET'))}`
      ].join('&');
      const endpoint = `${this.damtcVersion}/auth/authenticate?${query}`;

      return this.restClient.get<UserModel>(endpoint).pipe(
        tap(response => {
          if (response?.Code === 'Success') {
            this.authenticatedUser = response;
            StorageHelper.set(AUTHENTICATED_USER_STORAGE_KEY, JSON.stringify(response));
            StorageHelper.set(AUTH_LOGIN_DATE_STORAGE_KEY, DateHelper.format(new Date(), 'yyyyMMdd'));
          }
        })
      );
    });
  }

  /**
   * Gửi yêu cầu lưu thông tin xác thực ban đầu cho nhân viên.
   */
  saveAuthRequest(employeeCode: string, idNo: string, username: string, password: string): Observable<ReturnModel> {
    return defer(() => this.restClient.post<ReturnModel>(`${this.damtcVersion}/auth/saveauthrequest`, {
      EmployeeCode: employeeCode,
      IdNo: idNo,
      Username: EncryptHelper.aesEncrypt(username),
      Password: EncryptHelper.aesEncrypt(password)
    }));
  }

  /**
   * Gửi yêu cầu lưu mật khẩu mới cho tài khoản hiện tại.
   */
  savePassRequest(employeeCode: string, idNo: string, username: string, password: string): Observable<ReturnModel> {
    return defer(() => this.restClient.post<ReturnModel>(`${this.damtcVersion}/auth/savepassrequest`, {
      EmployeeCode: employeeCode,
      IdNo: idNo,
      Username: EncryptHelper.aesEncrypt(username),
      Password: EncryptHelper.aesEncrypt(password)
    }));
  }

  /**
   * Thay đổi mật khẩu của người dùng hiện tại.
   */
  changePassword(username: string, oldPassword: string, newPassword: string): Observable<UserModel> {
    return defer(() => this.restClient.post<UserModel>(`${this.damtcVersion}/auth/changepassword`, {
      Username: EncryptHelper.aesEncrypt(username),
      OldPassword: EncryptHelper.aesEncrypt(oldPassword),
      NewPassword: EncryptHelper.aesEncrypt(newPassword)
    }));
  }

  /**
   * Đăng xuất người dùng và xóa dữ liệu phiên hiện tại.
   */
  logout(): void {
    this.authenticatedUser = null;
    StorageHelper.remove(AUTHENTICATED_USER_STORAGE_KEY);
  }

  /**
   * Xóa toàn bộ session hiện tại để bắt đầu phiên mới.
   */
  clearSession(): void {
    this.authenticatedUser = null;
    StorageHelper.remove(AUTHENTICATED_USER_STORAGE_KEY);
    StorageHelper.remove(AUTH_LOGIN_DATE_STORAGE_KEY);
  }

  /**
   * Kiểm tra xem người dùng hiện tại có đang xác thực trong ngày không.
   */
  isAuthenticated(): boolean {
    return StorageHelper.get(AUTH_LOGIN_DATE_STORAGE_KEY) === DateHelper.format(new Date(), 'yyyyMMdd')
      && SessionHelper.getStoredUser<UserModel>() !== null;
  }

  /**
   * Trả về thông tin người dùng đang đăng nhập nếu có.
   */
  currentUser(): UserModel | null {
    this.authenticatedUser ??= SessionHelper.getStoredUser<UserModel>();
    return this.authenticatedUser;
  }

  /**
   * Trả về tên hiển thị của người dùng đăng nhập.
   */
  currentUserName(): string {
    return this.currentUserFullName();
  }

  /**
   * Lấy tên đầy đủ của người dùng dựa trên các trường dữ liệu có sẵn.
   */
  currentUserFullName(): string {
    const user = this.currentUser();
    const fullName = user?.Fullname
      || user?.fullname
      || user?.FullName
      || user?.fullName
      || user?.EmployeeName
      || user?.employeeName
      || user?.DisplayName
      || user?.displayName;

    if (fullName) {
      return fullName;
    }

    const firstName = user?.FirstName || user?.firstName || '';
    const lastName = user?.LastName || user?.lastName || '';
    const combinedName = `${firstName} ${lastName}`.trim();
    return combinedName || user?.UserName || user?.userName || 'Bạn';
  }

  /**
   * Trả về username của người dùng đang đăng nhập.
   */
  currentUsername(): string {
    const user = this.currentUser();
    return user?.UserName
      || user?.userName
      || user?.Username
      || user?.username
      || user?.EmployeeCode
      || user?.employeeCode
      || user?.DisplayName
      || user?.displayName
      || user?.EmployeeName
      || user?.employeeName
      || '';
  }
}