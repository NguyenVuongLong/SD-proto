export class PaginationState {
  constructor(public readonly pageSize = 10, public pageIndex = 1) {}

  setPage(pageIndex: number): void {
    this.pageIndex = pageIndex;
  }

  reset(): void {
    this.pageIndex = 1;
  }

  slice<T>(items: T[]): T[] {
    const start = (this.pageIndex - 1) * this.pageSize;
    return items.slice(start, start + this.pageSize);
  }
}
