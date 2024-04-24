import { stringToPath } from "@titan-cosmjs/crypto";
import {
  DirectSecp256k1HdWallet,
  OfflineSigner,
} from "@titan-cosmjs/proto-signing";

export const walletOptions = {
  prefix: "titan",
  hdPaths: [stringToPath(`m/44'/60'/0'/0/0`)],
};

export async function createSigner(mnemonic?: string): Promise<OfflineSigner> {
  return mnemonic
    ? await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, walletOptions)
    : await DirectSecp256k1HdWallet.generate(12, walletOptions);
}

export async function getSignerAddress(signer: OfflineSigner) {
  const accounts = await signer.getAccounts();
  return accounts[0].address;
}
