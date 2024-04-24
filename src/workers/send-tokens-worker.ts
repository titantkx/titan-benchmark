import { parseCoins } from "@titan-cosmjs/proto-signing";
import { isDeliverTxFailure } from "@titan-cosmjs/stargate";
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
      "auto"
    );

    if (isDeliverTxFailure(resp)) {
      throw new Error(resp.rawLog);
    }
  }
}
