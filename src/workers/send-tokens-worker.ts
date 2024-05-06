import { isDeliverTxFailure } from "@titan-cosmjs/stargate";
import { baseCoin } from "../coins";
import { config } from "../config";
import { faucetAddress } from "../faucet";
import { getGasPrice } from "../fee";
import { SigningStargateWorker } from "./siging-stargate-worker";

export class SendTokensWorker extends SigningStargateWorker {
  async runTask() {
    const resp = await this.client.sendTokens(
      this.address,
      faucetAddress,
      [baseCoin(1)],
      { gas: config.gasAdjustment, gasPrice: await getGasPrice() }
    );

    if (isDeliverTxFailure(resp)) {
      throw new Error(resp.rawLog);
    }
  }
}
