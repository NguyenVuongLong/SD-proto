import { FormBuilder } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { appRoutes } from '../../app-routing.module';
import { authRoutes } from '../../features/auth/auth.module';
import { HeaderComponent } from '../../header/header.component';
import { LoginComponent } from '../../login/login.component';
import { NotificationService } from '../services/notification.service';
import { AuthGuard } from './auth.guard';
import {
  AUTHENTICATED_USER_STORAGE_KEY,
  AUTH_LOGIN_DATE_STORAGE_KEY,
  localDateStamp,
  REMEMBERED_USERNAME_STORAGE_KEY
} from './auth.constants';
import { AUTH_AES_IV, AUTH_AES_KEY, EncryptHelper } from './encrypt.helper';
import { SessionHelper } from './session.helper';
import { StorageHelper } from './storage.helper';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../shared/services/auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiService } from '../services/api.service';

describe('Authentication flow', () => {
  let auth: AuthService;
  let guard: AuthGuard;
  let http: HttpTestingController;
  let api: ApiService;
  let router: Router;
  let notifications: jasmine.SpyObj<NotificationService>;
  const originalInetUri = environment.INET_URI;
  const endpointUrl = 'http://localhost:6600';

  beforeEach(() => {
    environment.INET_URI = endpointUrl;
    localStorage.clear();
    notifications = jasmine.createSpyObj<NotificationService>('NotificationService', ['success', 'error', 'info']);
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([{ path: 'dashboard', children: [] }])
      ],
      providers: [
        AuthService,
        AuthGuard,
        { provide: NotificationService, useValue: notifications }
      ]
    });
    auth = TestBed.inject(AuthService);
    api = TestBed.inject(ApiService);
    guard = TestBed.inject(AuthGuard);
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
    environment.INET_URI = originalInetUri;
    TestBed.resetTestingModule();
  });

  function decrypt(value: string): string {
    return CryptoJS.AES.decrypt(value, CryptoJS.enc.Utf8.parse(AUTH_AES_KEY), {
      iv: CryptoJS.enc.Utf8.parse(AUTH_AES_IV),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }).toString(CryptoJS.enc.Utf8);
  }

  function expectLoginRequest() {
    return http.expectOne(request =>
      request.method === 'GET'
      && request.url.startsWith(`${endpointUrl}/damtc/auth/authenticate?`)
    );
  }

  function createLoginComponent(): LoginComponent {
    const component = new LoginComponent(new FormBuilder(), router, auth, notifications);
    component.ngOnInit();
    return component;
  }

  it('Base64-stores and decodes UTF-8 values', () => {
    StorageHelper.set('unicode', 'Đăng nhập 🔐');

    expect(localStorage.getItem('unicode')).not.toContain('Đăng nhập');
    expect(StorageHelper.get('unicode')).toBe('Đăng nhập 🔐');
  });

  it('round-trips UTF-8 plaintext with the fixed AES-128-CBC parameters', () => {
    const plaintext = 'Đăng nhập 🔐';
    const ciphertext = EncryptHelper.aesEncrypt(plaintext);

    expect(AUTH_AES_KEY).toBe('NdRgUkXp2r5u8x/A');
    expect(AUTH_AES_IV).toBe('+KbPeShVkYp3s6v9');
    expect(CryptoJS.enc.Utf8.parse(AUTH_AES_KEY).sigBytes).toBe(16);
    expect(CryptoJS.enc.Utf8.parse(AUTH_AES_IV).sigBytes).toBe(16);
    expect(ciphertext).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);
    expect(decrypt(ciphertext)).toBe(plaintext);
  });

  it('returns null when the stored user is malformed', () => {
    StorageHelper.set(AUTHENTICATED_USER_STORAGE_KEY, '{');

    expect(SessionHelper.getStoredUser()).toBeNull();
  });

  it('GETs the encoded AES credentials and app code, then stores success response and date', () => {
    const response = { Code: 'Success', Message: 'OK', UserName: 'alice', EmployeeName: 'Alice' };
    auth.login('alice', 'secret').subscribe();

    const request = expectLoginRequest();
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('Content-Type')).toBe('application/json');
    expect(request.request.headers.get('Cache-Control')).toContain('no-cache');
    const query = new URLSearchParams(new URL(request.request.urlWithParams).search);
    expect(decrypt(query.get('Username') ?? '')).toBe('alice');
    expect(decrypt(query.get('Password') ?? '')).toBe('secret');
    expect(decrypt(query.get('AppCode') ?? '')).toBe('E-INTRANET');
    request.flush(response);

    expect(SessionHelper.getStoredUser()).toEqual(response);
    expect(StorageHelper.get(AUTH_LOGIN_DATE_STORAGE_KEY)).toBe(localDateStamp());
  });

  it('does not store an unsuccessful login response', () => {
    auth.login('alice', 'bad-password').subscribe();
    expectLoginRequest().flush({ Code: 'Failure', Message: 'Invalid credentials' });

    expect(SessionHelper.getStoredUser()).toBeNull();
    expect(StorageHelper.get(AUTH_LOGIN_DATE_STORAGE_KEY)).toBeNull();
  });

  it('uses the returned UserModel for current-user accessors before the stored copy', () => {
    const returnedUser = {
      Code: 'Success',
      UserName: 'auth-alice',
      DisplayName: 'Alice Example',
      EmployeeCode: 'EMP-1'
    };
    auth.login('alice', 'secret').subscribe();
    expectLoginRequest().flush(returnedUser);
    StorageHelper.set(AUTHENTICATED_USER_STORAGE_KEY, JSON.stringify({
      Code: 'Success',
      UserName: 'stale-user',
      DisplayName: 'Stale Name'
    }));

    expect(auth.currentUser()).toEqual(returnedUser);
    expect(auth.currentUsername()).toBe('auth-alice');
    expect(auth.currentUserName()).toBe('Alice Example');
  });

  it('resolves the full name and employee avatar from the session user', () => {
    StorageHelper.set(AUTHENTICATED_USER_STORAGE_KEY, JSON.stringify({
      Fullname: 'Ada Lovelace',
      Gender: 'F',
      EmployeeCode: 'EMP-ADA'
    }));

    const header = new HeaderComponent(auth, router);
    header.ngOnInit();

    expect(header.fullname).toBe('Ada Lovelace');
    expect(header.src).toBe(`${endpointUrl}/hr/emp/getavatar?employeecode=EMP-ADA`);
  });

  it('uses the gender-based SVG fallback when the employee avatar fails', () => {
    StorageHelper.set(AUTHENTICATED_USER_STORAGE_KEY, JSON.stringify({ Fullname: 'Ada Lovelace', Gender: 'F' }));
    const header = new HeaderComponent(auth, router);
    header.ngOnInit();
    header.onProfilePictureError();

    expect(header.src).toBe('assets/images/avatars/girl.svg');
    expect(SessionHelper.getAvatar('M')).toBe('assets/images/avatars/boy.svg');
    expect(SessionHelper.getAvatar(0)).toBe('assets/images/avatars/boy.svg');
  });

  it('handles a missing session user without throwing', () => {
    const header = new HeaderComponent(auth, router);
    header.ngOnInit();

    expect(header.fullname).toBe('Bạn');
    expect(header.src).toBe('assets/images/avatars/avatar-default.svg');
  });

  it('posts save-auth and save-password requests with only credentials encrypted', () => {
    auth.saveAuthRequest('EMP-1', 'ID-1', 'alice', 'secret').subscribe();
    const authRequest = http.expectOne(`${endpointUrl}/damtc/auth/saveauthrequest`);
    expect(authRequest.request.method).toBe('POST');
    expect(authRequest.request.body).toEqual({
      EmployeeCode: 'EMP-1',
      IdNo: 'ID-1',
      Username: authRequest.request.body.Username,
      Password: authRequest.request.body.Password
    });
    expect(decrypt(authRequest.request.body.Username)).toBe('alice');
    expect(decrypt(authRequest.request.body.Password)).toBe('secret');
    authRequest.flush({ Code: 'Success' });

    auth.savePassRequest('EMP-2', 'ID-2', 'bob', 'pass').subscribe();
    const passRequest = http.expectOne(`${endpointUrl}/damtc/auth/savepassrequest`);
    expect(passRequest.request.method).toBe('POST');
    expect(passRequest.request.body.EmployeeCode).toBe('EMP-2');
    expect(passRequest.request.body.IdNo).toBe('ID-2');
    expect(decrypt(passRequest.request.body.Username)).toBe('bob');
    expect(decrypt(passRequest.request.body.Password)).toBe('pass');
    passRequest.flush({ Code: 'Success' });
  });

  it('posts AES-encrypted credentials to change-password endpoint', () => {
    auth.changePassword('alice', 'old-secret', 'new-secret').subscribe();
    const request = http.expectOne(`${endpointUrl}/damtc/auth/changepassword`);

    expect(request.request.method).toBe('POST');
    expect(Object.keys(request.request.body)).toEqual(['Username', 'OldPassword', 'NewPassword']);
    expect(decrypt(request.request.body.Username)).toBe('alice');
    expect(decrypt(request.request.body.OldPassword)).toBe('old-secret');
    expect(decrypt(request.request.body.NewPassword)).toBe('new-secret');
    request.flush({ Code: 'Success' });
  });

  it('uses the new authenticated username for ticket, response, and update payloads', () => {
    const returnedUser = {
      Code: 'Success',
      UserName: 'auth-alice',
      DisplayName: 'Alice Example'
    };
    auth.login('alice', 'secret').subscribe();
    expectLoginRequest().flush(returnedUser);
    StorageHelper.set(AUTHENTICATED_USER_STORAGE_KEY, JSON.stringify({
      Code: 'Success',
      UserName: 'persisted-stale-user'
    }));
    localStorage.setItem('sd-user', JSON.stringify({ UserName: 'legacy-user' }));

    api.createTicket({ topicId: 'TOPIC', ticketName: 'Subject', ticketContent: 'Body' }).subscribe();
    const createTicketRequest = http.expectOne('/api/tickets');
    expect(createTicketRequest.request.body.createdBy).toBe('auth-alice');
    createTicketRequest.flush({ id: 'T-1' });

    api.createResponse('T-1', 'Reply').subscribe();
    const createResponseRequest = http.expectOne('/api/tickets/T-1/responses');
    expect(createResponseRequest.request.body.createdBy).toBe('auth-alice');
    createResponseRequest.flush({ responseId: 'R-1', createdBy: 'auth-alice' });

    api.updateTicket('T-1', { statusCode: 'Open' }).subscribe();
    const updateTicketRequest = http.expectOne('/api/tickets/T-1');
    expect(updateTicketRequest.request.body.createdBy).toBe('auth-alice');
    updateTicketRequest.flush({ id: 'T-1' });
  });

  it('shows the service message after unsuccessful login and clears loading', () => {
    const component = createLoginComponent();
    component.validateForm.setValue({ userName: 'alice', password: 'bad-password', remember: false });
    component.submitForm();
    expectLoginRequest().flush({ Code: 'Failure', Message: 'Invalid credentials' });

    expect(notifications.error).toHaveBeenCalledWith('Invalid credentials');
    expect(component.isSubmitting).toBeFalse();
  });

  it('requires both username and password before sending a request', () => {
    const component = createLoginComponent();
    component.submitForm();

    expect(component.validateForm.invalid).toBeTrue();
    expect(component.validateForm.get('userName')?.dirty).toBeTrue();
    expect(component.validateForm.get('password')?.dirty).toBeTrue();
    http.expectNone(request => request.url.startsWith(`${endpointUrl}/damtc/auth/authenticate?`));
  });

  it('saves a remembered username only after successful login', () => {
    const component = createLoginComponent();
    component.validateForm.setValue({ userName: 'alice', password: 'secret', remember: true });
    spyOn(router, 'navigate').and.resolveTo(true);
    component.submitForm();
    expectLoginRequest().flush({ Code: 'Success', Message: 'OK', UserName: 'alice' });

    expect(StorageHelper.get(REMEMBERED_USERNAME_STORAGE_KEY)).toBe('alice');
    expect(router.navigate).toHaveBeenCalledWith(['/']);
    expect(component.isSubmitting).toBeFalse();
  });

  it('clears the old session and restores the remembered username on login entry', () => {
    StorageHelper.set(AUTHENTICATED_USER_STORAGE_KEY, JSON.stringify({ Code: 'Success' }));
    StorageHelper.set(AUTH_LOGIN_DATE_STORAGE_KEY, localDateStamp());
    StorageHelper.set(REMEMBERED_USERNAME_STORAGE_KEY, 'alice');

    const component = createLoginComponent();

    expect(component.validateForm.get('userName')?.value).toBe('alice');
    expect(component.validateForm.get('remember')?.value).toBeTrue();
    expect(StorageHelper.get(AUTHENTICATED_USER_STORAGE_KEY)).toBeNull();
    expect(StorageHelper.get(AUTH_LOGIN_DATE_STORAGE_KEY)).toBeNull();
  });

  it('removes a previously remembered username when remember is unchecked', () => {
    StorageHelper.set(REMEMBERED_USERNAME_STORAGE_KEY, 'old-user');
    const component = createLoginComponent();
    component.validateForm.setValue({ userName: 'alice', password: 'secret', remember: false });
    component.submitForm();
    expectLoginRequest().flush({ Code: 'Success', Message: 'OK', UserName: 'alice' });

    expect(StorageHelper.get(REMEMBERED_USERNAME_STORAGE_KEY)).toBeNull();
  });

  it('shows a connection error and clears loading after a failed request', () => {
    const component = createLoginComponent();
    component.validateForm.setValue({ userName: 'alice', password: 'secret', remember: false });
    component.submitForm();
    expectLoginRequest().error(new ProgressEvent('error'));

    expect(notifications.error).toHaveBeenCalledWith('Không thể kết nối đến dịch vụ xác thực. Vui lòng thử lại.');
    expect(component.isSubmitting).toBeFalse();
  });

  it('redirects expired sessions and removes their stored user and date', () => {
    StorageHelper.set(AUTHENTICATED_USER_STORAGE_KEY, JSON.stringify({ Code: 'Success' }));
    StorageHelper.set(AUTH_LOGIN_DATE_STORAGE_KEY, '19000101');

    const result = guard.canActivate();

    expect(result instanceof UrlTree).toBeTrue();
    expect(router.serializeUrl(result as UrlTree)).toBe('/login');
    expect(StorageHelper.get(AUTHENTICATED_USER_STORAGE_KEY)).toBeNull();
    expect(StorageHelper.get(AUTH_LOGIN_DATE_STORAGE_KEY)).toBeNull();
  });

  it('redirects and clears a stored user when its login date is missing', () => {
    StorageHelper.set(AUTHENTICATED_USER_STORAGE_KEY, JSON.stringify({ Code: 'Success' }));

    const result = guard.canActivate();

    expect(result instanceof UrlTree).toBeTrue();
    expect(router.serializeUrl(result as UrlTree)).toBe('/login');
    expect(StorageHelper.get(AUTHENTICATED_USER_STORAGE_KEY)).toBeNull();
    expect(StorageHelper.get(AUTH_LOGIN_DATE_STORAGE_KEY)).toBeNull();
  });

  it('redirects when today’s login date exists without a stored user', () => {
    StorageHelper.set(AUTH_LOGIN_DATE_STORAGE_KEY, localDateStamp());

    const result = guard.canActivateChild();

    expect(result instanceof UrlTree).toBeTrue();
    expect(router.serializeUrl(result as UrlTree)).toBe('/login');
  });

  it('allows a session with today’s login date and a stored user', () => {
    StorageHelper.set(AUTHENTICATED_USER_STORAGE_KEY, JSON.stringify({ Code: 'Success' }));
    StorageHelper.set(AUTH_LOGIN_DATE_STORAGE_KEY, localDateStamp());

    expect(guard.canActivate()).toBeTrue();
  });

  it('logout removes user and date but preserves the remembered username', () => {
    StorageHelper.set(AUTHENTICATED_USER_STORAGE_KEY, JSON.stringify({ Code: 'Success' }));
    StorageHelper.set(AUTH_LOGIN_DATE_STORAGE_KEY, localDateStamp());
    StorageHelper.set(REMEMBERED_USERNAME_STORAGE_KEY, 'alice');

    auth.logout();

    expect(StorageHelper.get(AUTHENTICATED_USER_STORAGE_KEY)).toBeNull();
    expect(StorageHelper.get(AUTH_LOGIN_DATE_STORAGE_KEY)).toBe(localDateStamp());
    expect(StorageHelper.get(REMEMBERED_USERNAME_STORAGE_KEY)).toBe('alice');
  });

  it('the header logout action clears the session and navigates to login', () => {
    StorageHelper.set(AUTHENTICATED_USER_STORAGE_KEY, JSON.stringify({ Code: 'Success' }));
    StorageHelper.set(AUTH_LOGIN_DATE_STORAGE_KEY, localDateStamp());
    spyOn(router, 'navigate').and.resolveTo(true);
    const header = new HeaderComponent(auth, router);

    header.logout();

    expect(StorageHelper.get(AUTHENTICATED_USER_STORAGE_KEY)).toBeNull();
    expect(StorageHelper.get(AUTH_LOGIN_DATE_STORAGE_KEY)).toBe(localDateStamp());
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('keeps login public and applies both guards to business routes', () => {
    const publicAuthRoute = appRoutes.find(route => route.loadChildren);
    const protectedAppRoute = appRoutes.find(route => route.canActivate?.includes(AuthGuard));

    expect(authRoutes.some(route => route.path === 'login' && route.component === LoginComponent)).toBeTrue();
    expect(publicAuthRoute?.canActivate).toBeUndefined();
    expect(publicAuthRoute?.canActivateChild).toBeUndefined();
    expect(protectedAppRoute?.canActivate).toContain(AuthGuard);
    expect(protectedAppRoute?.canActivateChild).toContain(AuthGuard);
  });
});