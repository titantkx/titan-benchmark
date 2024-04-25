import { Queue } from "queue-typescript";

export class TPSCalculator {
  private readonly window = new Queue<number>();

  constructor(private readonly windowSize: number) {}

  addEvent(timestamp = new Date().getTime()) {
    this.window.enqueue(timestamp);
  }

  calculateTPS() {
    this.flush();
    if (this.window.tail == this.window.head) {
      return 0;
    }
    return Math.round(
      (1000 * this.window.length) / (this.window.tail - this.window.head)
    );
  }

  flush() {
    const timestamp = new Date().getTime() - this.windowSize;
    while (this.window.front && this.window.front < timestamp) {
      this.window.dequeue();
    }
  }
}
