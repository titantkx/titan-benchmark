import { config } from "../config";
import { TPSCalculator } from "../tps";

export class Reporter {
  concurrency: number = 0;
  minLatency: number = 0;
  maxLatency: number = 0;
  totalLatency: number = 0;
  errorCount: number = 0;
  successCount: number = 0;
  st: number = 0;
  et: number = 0;

  private readonly tpsCalculator = new TPSCalculator(config.windowSize);

  get avgLatency() {
    return this.successCount ? this.totalLatency / this.successCount : 0;
  }

  get totalCount() {
    return this.errorCount + this.successCount;
  }

  get duration() {
    return this.et ? this.et - this.st : 0;
  }

  get avgTps() {
    return this.duration
      ? Math.round((1000 * this.totalCount) / this.duration)
      : 0;
  }

  get successRate() {
    return this.successCount ? this.successCount / this.totalCount : 0;
  }

  get report() {
    const successRate = `${(this.successRate * 100).toFixed(2)}%`;
    return {
      tps: this.tpsCalculator.calculateTPS(),
      avgTps: this.avgTps,
      concurrency: this.concurrency,
      duration: `${this.duration}ms`,
      success: `${this.successCount}/${this.totalCount} (${successRate})`,
      avgLatency: `${this.avgLatency}ms`,
      minLatency: `${this.minLatency}ms`,
      maxLatency: `${this.maxLatency}ms`,
    };
  }

  start() {
    this.st = new Date().getTime();
  }

  addError() {
    this.addEvent(new Date().getTime());
    this.errorCount++;
  }

  addSuccess(latency: number) {
    this.addEvent(new Date().getTime());
    if (!this.minLatency || latency < this.minLatency) {
      this.minLatency = latency;
    }
    if (latency > this.maxLatency) {
      this.maxLatency = latency;
    }
    this.totalLatency += latency;
    this.successCount++;
  }

  private addEvent(timestamp: number) {
    this.et = timestamp;
    this.tpsCalculator.addEvent(timestamp);
  }
}
