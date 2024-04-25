import { TPSCalculator } from "./tps";
import { delay } from "./utils";

export async function* producer(
  taskCount: number,
  tps = 0,
  interval = 1000,
  windowSize = 1000
) {
  if (tps <= 0) {
    for (let i = 0; i < taskCount; i++) {
      yield i;
    }
  } else {
    let batchSize = (tps * interval) / 1000;
    if (!Number.isInteger(batchSize)) {
      interval = (interval * Math.ceil(batchSize)) / batchSize;
      batchSize = Math.ceil(batchSize);
    }
    const tpsCalculator = new TPSCalculator(windowSize);
    for (let i = 0; i < taskCount; i += batchSize) {
      // Adjust batch size based on actual TPS
      const actualTps = tpsCalculator.calculateTPS();
      if (actualTps > 0) {
        batchSize = Math.round((batchSize * tps) / actualTps);
      }
      await delay(interval);
      for (let j = 0; j < batchSize && i + j < taskCount; j++) {
        yield i + j;
        tpsCalculator.addEvent();
      }
    }
  }
}
