export class DateHelper {
  static format(date: Date, format: 'yyyyMMdd'): string {
    if (format !== 'yyyyMMdd') {
      throw new Error(`Unsupported date format: ${format}`);
    }

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}${month}${day}`;
  }
}