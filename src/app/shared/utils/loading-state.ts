export class LoadingState {
  private active = false;

  get isLoading(): boolean {
    return this.active;
  }

  start(): void {
    this.active = true;
  }

  stop(): void {
    this.active = false;
  }
}
