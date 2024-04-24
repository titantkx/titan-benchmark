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

  const price = new BigNumber(data.base_fee).multipliedBy(config.gasAdjustment);

  if (price.isGreaterThan(config.gasPriceLimit)) {
    throw new Error(
      "Gas price is too high! Raise GAS_PRICE_LIMIT or wait for it to drop."
    );
  }

  gasPrice = GasPrice.fromString(
    price.toFormat(0, BigNumber.ROUND_UP, { decimalSeparator: "" }) +
      config.baseDenom
  );

  console.log(`Gas price: ${gasPrice.toString()}`);
}
