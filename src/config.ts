import { Coin } from "@titan-cosmjs/stargate";
import * as Joi from "joi";
import { parseCoins } from "./coins";

const configValidationSchema = Joi.object({
  TPS: Joi.number(),
  TASK_COUNT: Joi.number().required().positive(),
  TASK_INTERVAL: Joi.number(),
  WORKER_COUNT: Joi.number().required().positive(),
  WINDOW_SIZE: Joi.number().required().positive(),
  RPC_URL: Joi.string()
    .required()
    .uri({ scheme: ["http", "https"] }),
  LCD_URL: Joi.string()
    .required()
    .uri({ scheme: ["http", "https"] }),
  FUND: Joi.string().required(),
  BASE_DENOM: Joi.string().required(),
  GAS_ADJUSTMENT: Joi.number().required().positive(),
  GAS_PRICE_ADJUSTMENT: Joi.number().required().positive(),
  GAS_PRICE_LIMIT: Joi.string()
    .required()
    .regex(/^[1-9][0-9]*$/),
  MNEMONIC: Joi.string().required(),
});

export interface Config {
  tps?: number;
  taskCount: number;
  taskInterval?: number;
  workerCount: number;
  windowSize: number;

  rpcUrl: string;
  lcdUrl: string;

  fund: Coin[];
  baseDenom: string;
  gasAdjustment: number;
  gasPriceAdjustment: number;
  gasPriceLimit: string;

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
    tps: value.TPS,
    taskCount: value.TASK_COUNT,
    taskInterval: value.TASK_INTERVAL,
    workerCount: value.WORKER_COUNT,
    windowSize: value.WINDOW_SIZE,
    rpcUrl: value.RPC_URL.trimEnd("/"),
    lcdUrl: value.LCD_URL.trimEnd("/"),
    fund: parseCoins(value.FUND),
    baseDenom: value.BASE_DENOM,
    gasAdjustment: value.GAS_ADJUSTMENT,
    gasPriceAdjustment: value.GAS_PRICE_ADJUSTMENT,
    gasPriceLimit: value.GAS_PRICE_LIMIT,
    mnemonic: value.MNEMONIC,
  };
}

export let config: Config;
