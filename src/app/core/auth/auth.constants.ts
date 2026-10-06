import { DateHelper } from '../../shared/utils/date.helper';

export const AUTHENTICATED_USER_STORAGE_KEY = 'EI_USER';
export const AUTH_LOGIN_DATE_STORAGE_KEY = 'EI_LOGIN_DATE';
export const REMEMBERED_USERNAME_STORAGE_KEY = 'sd-remembered-username';

export function localDateStamp(date = new Date()): string {
  return DateHelper.format(date, 'yyyyMMdd');
}