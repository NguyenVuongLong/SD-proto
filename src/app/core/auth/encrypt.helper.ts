import * as CryptoJS from 'crypto-js';

export const AUTH_AES_KEY = 'NdRgUkXp2r5u8x/A';
export const AUTH_AES_IV = '+KbPeShVkYp3s6v9';

export class EncryptHelper {
  static aesEncrypt(value: string): string {
    return this.encrypt(value);
  }

  static encrypt(value: string): string {
    const key = CryptoJS.enc.Utf8.parse(AUTH_AES_KEY);
    const iv = CryptoJS.enc.Utf8.parse(AUTH_AES_IV);

    if (key.sigBytes !== 16 || iv.sigBytes !== 16) {
      throw new Error('Authentication AES key and IV must each contain 16 UTF-8 bytes.');
    }

    const plaintext = CryptoJS.enc.Utf8.parse(value);
    return CryptoJS.AES.encrypt(plaintext, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }).toString();
  }
}