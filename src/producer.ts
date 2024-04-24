import { delay } from "./utils";

export async function* producer(taskCount: number, interval: number) {
  for (let i = 0; i < taskCount; i++) {
    await delay(interval);
    yield i;
  }
}
