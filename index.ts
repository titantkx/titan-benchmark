import * as dotenv from "dotenv";
import { parseCoins } from "./src/coins";
import { config, loadConfig } from "./src/config";
import { acquireTokens, initFaucet } from "./src/faucet";
import { producer } from "./src/producer";
import { createSigner } from "./src/signer";
import { delay } from "./src/utils";
import { Reporter } from "./src/workers/reporter";
import { SendTokensWorker } from "./src/workers/send-tokens-worker";
import { BaseWorker } from "./src/workers/worker";

export async function setup(reporter: Reporter) {
  let workers: BaseWorker[] = [];
  let workerAddresses: string[] = [];

  for (let i = 0; i < config.workerCount; i++) {
    const worker = new SendTokensWorker(reporter);
    await worker.connectWithSigner(config.rpcUrl, await createSigner());
    workers.push(worker);
    workerAddresses.push(worker.getAddress());
  }

  await acquireTokens(parseCoins("10tkx"), ...workerAddresses);

  return workers;
}

async function main() {
  dotenv.config();
  loadConfig(process.env);
  await initFaucet();

  const reporter = new Reporter();

  const workers = await setup(reporter);

  const tasks = producer(config.taskCount, config.taskInterval);

  reporter.start();

  let works: Promise<void>[] = [];
  for (let worker of workers) {
    const work = worker.process(tasks);
    works.push(work);
  }

  let done = false;

  (async () => {
    while (!done) {
      await delay(1000);
      console.log(reporter.report);
    }
    console.log(reporter.report);
  })();

  await Promise.all(works);
  done = true;

  works = [];
  for (let worker of workers) {
    const work = worker.close();
    works.push(work);
  }

  await Promise.all(works);
}

main();
