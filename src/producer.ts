import { delay } from "./utils";

export async function* producer(
  taskCount: number,
  tps?: number,
  interval?: number
) {
  if (!tps || tps <= 0) {
    for (let i = 0; i < taskCount; i++) {
      yield i;
    }
  } else {
    if (!interval || interval <= 0) {
      interval = 1000;
    }
    let batchSize = (tps * interval) / 1000;
    if (!Number.isInteger(batchSize)) {
      interval = (interval * Math.ceil(batchSize)) / batchSize;
      batchSize = Math.ceil(batchSize);
    }
    for (let i = 0; i < taskCount; i += batchSize) {
      await delay(interval);
      for (let j = 0; j < batchSize && i + j < taskCount; j++) {
        yield i + j;
      }
    }
  }
}
