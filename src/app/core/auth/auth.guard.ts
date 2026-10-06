import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, UrlTree } from '@angular/router';
import { UserModel } from '../models';
import {
  AUTH_LOGIN_DATE_STORAGE_KEY,
  localDateStamp
} from './auth.constants';
import { SessionHelper } from './session.helper';
import { StorageHelper } from './storage.helper';
import { AuthService } from '../../shared/services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    return this.authorize();
  }

  canActivateChild(): boolean | UrlTree {
    return this.authorize();
  }

  private authorize(): boolean | UrlTree {
    const loginDate = StorageHelper.get(AUTH_LOGIN_DATE_STORAGE_KEY);
    if (loginDate !== localDateStamp()) {
      this.auth.clearSession();
      return this.router.createUrlTree(['/login']);
    }

    return SessionHelper.getStoredUser<UserModel>()
      ? true
      : this.router.createUrlTree(['/login']);
  }
}
