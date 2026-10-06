import { AUTHENTICATED_USER_STORAGE_KEY } from './auth.constants';
import { environment } from '../../../environments/environment';
import { UserModel } from '../models';
import { StorageHelper } from './storage.helper';

export class SessionHelper {
  static getUser(): UserModel | null {
    return this.getStoredUser<UserModel>();
  }

  static getAvatar(gender?: string | number, employeeCode?: string): string {
    const code = employeeCode?.trim();
    if (code) {
      const baseUrl = environment.INET_URI.replace(/\/+$/, '');
      return `${baseUrl}/hr/emp/getavatar?employeecode=${encodeURIComponent(code)}`;
    }

    const normalizedGender = String(gender ?? '').trim().toLowerCase();
    if (['m', 'male', 'man', 'nam', '0', '1'].includes(normalizedGender)) {
      return 'assets/images/avatars/boy.svg';
    }
    if (['f', 'female', 'woman', 'nu', 'nữ', '2'].includes(normalizedGender)) {
      return 'assets/images/avatars/girl.svg';
    }
    return 'assets/images/avatars/avatar-default.svg';
  }

  static getStoredUser<T extends object>(): T | null {
    const serializedUser = StorageHelper.get(AUTHENTICATED_USER_STORAGE_KEY);
    if (!serializedUser) {
      return null;
    }

    try {
      const user: unknown = JSON.parse(serializedUser);
      return user !== null && typeof user === 'object' && !Array.isArray(user)
        ? user as T
        : null;
    } catch {
      return null;
    }
  }
}