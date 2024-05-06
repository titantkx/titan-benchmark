import { GasPrice } from "@titan-cosmjs/stargate";
import axios from "axios";
import BigNumber from "bignumber.js";
import { config } from "./config";

let gasPrice: GasPrice;

export async function getGasPrice() {
  if (!gasPrice) {
    await updateGasPrice();
  }
  return gasPrice;
}

export async function updateGasPrice() {
  const { data } = await axios.get(
    `${config.lcdUrl}/ethermint/evm/v1/base_fee`
  );

  const price = BigNumber(data.base_fee).multipliedBy(config.gasAdjustment);
  const priceAmount = price.isGreaterThan(config.gasPriceLimit)
    ? config.gasPriceLimit
    : price.toIntString();

  gasPrice = GasPrice.fromString(priceAmount + config.baseDenom);

  console.log(`Gas price: ${gasPrice.toString()}`);
}
