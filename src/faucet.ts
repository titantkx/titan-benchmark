import { EncodeObject } from "@titan-cosmjs/proto-signing";
import {
  Coin,
  MsgSendEncodeObject,
  SigningStargateClient,
} from "@titan-cosmjs/stargate";
import { MsgSend } from "titan-cosmjs-types/cosmos/bank/v1beta1/tx";
import { config } from "./config";
import { createSigner, getSignerAddress } from "./signer";

export let faucetAddress: string;
export let faucetClient: SigningStargateClient;

export async function initFaucet() {
  const faucetSigner = await createSigner(config.mnemonic);
  faucetAddress = await getSignerAddress(faucetSigner);
  faucetClient = await SigningStargateClient.connectWithSigner(
    config.rpcUrl,
    faucetSigner,
    {
      isEthermint: true,
      gasPrice: config.gasPrice,
    }
  );
}

export async function acquireTokens(coins: Coin[], ...recipients: string[]) {
  for (let i = 0; i < recipients.length; i += 100) {
    let msgs: EncodeObject[] = [];
    for (let j = 0; j < 100 && i + j < recipients.length; j++) {
      const msg: MsgSendEncodeObject = {
        typeUrl: "/cosmos.bank.v1beta1.MsgSend",
        value: MsgSend.fromPartial({
          fromAddress: faucetAddress,
          toAddress: recipients[i + j],
          amount: coins,
        }),
      };
      msgs.push(msg);
    }
    await faucetClient.signAndBroadcast(faucetAddress, msgs, "auto");
  }
}
