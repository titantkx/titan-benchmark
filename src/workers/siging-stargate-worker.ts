import { OfflineSigner } from "@titan-cosmjs/proto-signing";
import { SigningStargateClient } from "@titan-cosmjs/stargate";

import BigNumber from "bignumber.js";
import { config } from "../config";
import { faucetAddress } from "../faucet";
import { getSignerAddress } from "../signer";
import { BaseWorker } from "./worker";

export abstract class SigningStargateWorker extends BaseWorker {
  protected address: string;
  protected client: SigningStargateClient;

  getAddress() {
    return this.address;
  }

  async close() {
    // Withdraw all balances to faucet
    const bal = await this.client.getBalance(this.address, "atkx");
    const amount = new BigNumber(bal.amount);
    if (amount.isGreaterThan("1e18")) {
      const sendAmount = amount
        .minus("1e18")
        .toFormat(0, BigNumber.ROUND_UP, { decimalSeparator: "" });
      await this.client.sendTokens(
        this.address,
        faucetAddress,
        [{ denom: "atkx", amount: sendAmount }],
        "auto"
      );
    }
    this.client.disconnect();
  }

  async connectWithSigner(endpoint: string, signer: OfflineSigner) {
    this.address = await getSignerAddress(signer);
    this.client = await SigningStargateClient.connectWithSigner(
      endpoint,
      signer,
      {
        isEthermint: true,
        gasPrice: config.gasPrice,
      }
    );
  }
}
