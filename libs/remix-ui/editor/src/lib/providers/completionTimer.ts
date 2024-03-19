export class CompletionTimer {
  private duration: number;
  private timerId: NodeJS.Timeout | null = null;
  private callback: () => void;

  constructor(duration: number, callback: () => void) {
    this.duration = duration;
    this.callback = callback;
  }

  start() {
    if (this.timerId) {
      console.error("Timer is already running.");
      return;
    }

    this.timerId = setTimeout(() => {
      this.callback();
      this.timerId = null;
    }, this.duration);
  }

  stop() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    } else {
      console.error("Timer is not running.");
    }
  }
}