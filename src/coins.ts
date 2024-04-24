import { Coin, parseCoins as stdParseCoins } from "@titan-cosmjs/stargate";
import BigNumber from "bignumber.js";

export function convertCoin(coin: Coin): Coin {
  if (coin.denom === "tkx") {
    const amount = new BigNumber(coin.amount)
      .multipliedBy("1e18")
      .toFormat(0, BigNumber.ROUND_UP, { decimalSeparator: "" });
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
