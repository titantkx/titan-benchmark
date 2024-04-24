import { Reporter } from "./reporter";

export abstract class BaseWorker {
  constructor(private readonly reporter: Reporter) {}

  abstract runTask(): Promise<any>;

  abstract close(): Promise<void>;

  async process(tasks: AsyncGenerator<number, void, unknown>) {
    for await (let _task of tasks) {
      try {
        const st = new Date().getTime();
        this.reporter.concurrency++;
        await this.runTask();
        const et = new Date().getTime();
        this.reporter.addSuccess(et - st);
      } catch (e) {
        this.reporter.addError();
        console.log(e);
      } finally {
        this.reporter.concurrency--;
      }
    }
  }
}
