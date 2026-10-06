export class StorageHelper {
  static get(key: string): string | null {
    const encodedValue = localStorage.getItem(key);
    if (encodedValue === null) {
      return null;
    }

    try {
      const binaryValue = atob(encodedValue);
      const bytes = Uint8Array.from(binaryValue, character => character.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    } catch {
      return null;
    }
  }

  static set(key: string, value: string): void {
    const bytes = new TextEncoder().encode(value);
    const binaryValue = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
    localStorage.setItem(key, btoa(binaryValue));
  }

  static remove(key: string): void {
    localStorage.removeItem(key);
  }
}