import { isDeliverTxFailure } from "@titan-cosmjs/stargate";
import { parseCoins } from "../coins";
import { config } from "../config";
import { getGasPrice } from "../fee";
import { createSigner, getSignerAddress } from "../signer";
import { SigningStargateWorker } from "./siging-stargate-worker";

export class SendTokensWorker extends SigningStargateWorker {
  async runTask() {
    const recipient = await createSigner();
    const recipientAddress = await getSignerAddress(recipient);

    const resp = await this.client.sendTokens(
      this.address,
      recipientAddress,
      parseCoins("1atkx"),
      { gas: config.gasAdjustment, gasPrice: await getGasPrice() }
    );

    if (isDeliverTxFailure(resp)) {
      throw new Error(resp.rawLog);
    }
  }
}
