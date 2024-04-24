import * as Joi from "joi";

const configValidationSchema = Joi.object({
  TASK_COUNT: Joi.number().required().positive(),
  TASK_INTERVAL: Joi.number().required().positive(),
  WORKER_COUNT: Joi.number().required().positive(),
  RPC_URL: Joi.string()
    .required()
    .uri({ scheme: ["http", "https"] }),
  LCD_URL: Joi.string()
    .required()
    .uri({ scheme: ["http", "https"] }),
  BASE_DENOM: Joi.string().required(),
  GAS_ADJUSTMENT: Joi.number().required().positive(),
  GAS_PRICE_ADJUSTMENT: Joi.number().required().positive(),
  GAS_PRICE_LIMIT: Joi.string()
    .required()
    .regex(/^[1-9][0-9]*$/),
  MNEMONIC: Joi.string().required(),
});

export interface Config {
  taskCount: number;
  taskInterval: number;
  workerCount: number;

  rpcUrl: string;
  lcdUrl: string;

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
    taskCount: value.TASK_COUNT,
    taskInterval: value.TASK_INTERVAL,
    workerCount: value.WORKER_COUNT,
    rpcUrl: value.RPC_URL.trimEnd("/"),
    lcdUrl: value.LCD_URL.trimEnd("/"),
    baseDenom: value.BASE_DENOM,
    gasAdjustment: value.GAS_ADJUSTMENT,
    gasPriceAdjustment: value.GAS_PRICE_ADJUSTMENT,
    gasPriceLimit: value.GAS_PRICE_LIMIT,
    mnemonic: value.MNEMONIC,
  };
}

export let config: Config;
