import BigNumber from "bignumber.js";

declare module "bignumber.js" {
  interface BigNumber {
    toIntString(): string;
  }
}

BigNumber.prototype.toIntString = function (): string {
  return this.toFormat(0, BigNumber.ROUND_UP, { decimalSeparator: "" });
};
