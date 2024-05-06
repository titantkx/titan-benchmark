import * as dotenv from "dotenv";
import "./src/bignumber.extension";
import { config, loadConfig } from "./src/config";
import { acquireTokens, initFaucet } from "./src/faucet";
import { updateGasPrice } from "./src/fee";
import { producer } from "./src/producer";
import { getSigner } from "./src/signer";
import { delay } from "./src/utils";
import { Reporter } from "./src/workers/reporter";
import { SendTokensWorker } from "./src/workers/send-tokens-worker";
import { BaseWorker } from "./src/workers/worker";

export async function setup(reporter: Reporter) {
  let workers: BaseWorker[] = [];
  let workerAddresses: string[] = [];

  for (let i = 0; i < config.workerCount; i++) {
    const worker = new SendTokensWorker(reporter);
    await worker.connectWithSigner(config.rpcUrl, await getSigner());
    workers.push(worker);
    workerAddresses.push(worker.getAddress());
  }

  console.log("=====> Funding...");
  await acquireTokens(config.fund, ...workerAddresses);

  return workers;
}

function updateGasPriceAsync() {
  const terminateSignal = { done: false };
  (async () => {
    while (!terminateSignal.done) {
      try {
        await Promise.all([delay(3000), updateGasPrice()]);
      } catch (e) {
        console.log(e);
        await delay(3000);
      }
    }
  })();
  return terminateSignal;
}

function reportAsync(reporter: Reporter) {
  const terminateSignal = { done: false };
  (async () => {
    while (!terminateSignal.done) {
      await delay(1000);
      console.log(reporter.report);
    }
    console.log(reporter.report);
  })();
  return terminateSignal;
}

async function main() {
  dotenv.config();
  loadConfig(process.env);

  await updateGasPrice();
  await initFaucet();

  const updateGasPriceTask = updateGasPriceAsync();

  const reporter = new Reporter();

  console.log("=====> Setting up...");
  const workers = await setup(reporter);

  const tasks = producer(
    config.taskCount,
    config.tps,
    config.taskInterval,
    config.windowSize
  );

  console.log("=====> Running...");
  reporter.start();

  let works: Promise<void>[] = [];
  for (let worker of workers) {
    const work = worker.process(tasks);
    works.push(work);
  }

  const reportTask = reportAsync(reporter);

  await Promise.all(works);

  reportTask.done = true;

  console.log("=====> Finishing...");

  works = [];
  for (let worker of workers) {
    const work = worker.close();
    works.push(work);
  }

  await Promise.all(works);

  updateGasPriceTask.done = true;

  console.log("=====> All done!");
}

main();
