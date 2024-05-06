import { OfflineSigner } from "@titan-cosmjs/proto-signing";
import {
  MsgSendEncodeObject,
  SigningStargateClient,
  StdFee,
} from "@titan-cosmjs/stargate";
import BigNumber from "bignumber.js";
import { MsgSend } from "titan-cosmjs-types/cosmos/bank/v1beta1/tx";
import { baseCoin } from "../coins";
import { config } from "../config";
import { faucetAddress } from "../faucet";
import { getGasPrice } from "../fee";
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
    const bal = await this.client.getBalance(this.address, config.baseDenom);
    const balAmount = BigNumber(bal.amount);

    const msgSend: MsgSendEncodeObject = {
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: MsgSend.fromPartial({
        fromAddress: this.address,
        toAddress: faucetAddress,
        amount: [bal],
      }),
    };
    const gasUsed = await this.client.simulate(
      this.address,
      [msgSend],
      undefined
    );

    const gas = BigNumber(gasUsed).multipliedBy(config.gasAdjustment);
    const gasPrice = await getGasPrice();
    const feeAmount = gas.multipliedBy(gasPrice.amount.toString());

    if (balAmount.isGreaterThan(feeAmount)) {
      const sendAmount = balAmount.minus(feeAmount);

      const fee: StdFee = {
        amount: [baseCoin(feeAmount.toIntString())],
        gas: gas.toIntString(),
      };

      await this.client.sendTokens(
        this.address,
        faucetAddress,
        [baseCoin(sendAmount.toIntString())],
        fee
      );
    }

    this.client.disconnect();
  }

  async connectWithSigner(endpoint: string, signer: OfflineSigner) {
    this.address = await getSignerAddress(signer);
    this.client = await SigningStargateClient.connectWithSigner(
      endpoint,
      signer,
      { isEthermint: true }
    );
  }
}
