import { GasPrice } from "@titan-cosmjs/stargate";
import * as Joi from "joi";

const configValidationSchema = Joi.object({
  TASK_COUNT: Joi.number().required().positive(),
  TASK_INTERVAL: Joi.number().required().positive(),
  WORKER_COUNT: Joi.number().required().positive(),
  RPC_URL: Joi.string()
    .required()
    .uri({ scheme: ["http", "https"] }),
  GAS_PRICE: Joi.string().required(),
  MNEMONIC: Joi.string().required(),
});

export interface Config {
  taskCount: number;
  taskInterval: number;
  workerCount: number;
  rpcUrl: string;
  gasPrice: GasPrice;
  mnemonic: string;
}

export function loadConfig(conf: any) {
  const { value, error } = configValidationSchema.validate(conf, {
    allowUnknown: true,
  });
  if (error) {
    throw error;
  }
  config = {
    taskCount: value.TASK_COUNT,
    taskInterval: value.TASK_INTERVAL,
    workerCount: value.WORKER_COUNT,
    rpcUrl: value.RPC_URL,
    gasPrice: GasPrice.fromString(value.GAS_PRICE),
    mnemonic: value.MNEMONIC,
  };
}

export let config: Config;
