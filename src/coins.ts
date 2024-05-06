import { Coin, parseCoins as stdParseCoins } from "@titan-cosmjs/stargate";
import BigNumber from "bignumber.js";
import { config } from "./config";

export function convertCoin(coin: Coin): Coin {
  if (coin.denom === "tkx") {
    const amount = BigNumber(coin.amount).multipliedBy("1e18").toIntString();
    return {
      denom: "atkx",
      amount: amount,
    };
  }
  return coin;
}

export function convertCoins(coins: Coin[]): Coin[] {
  var result: Coin[] = [];
  for (let coin of coins) {
    result.push(convertCoin(coin));
  }
  return result;
}

export function parseCoins(input: string) {
  const coins = stdParseCoins(input);
  return convertCoins(coins);
}

export function baseCoin(amount: string | number): Coin {
  return { denom: config.baseDenom, amount: String(amount) };
}
