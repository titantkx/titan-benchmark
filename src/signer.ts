import { stringToPath } from "@titan-cosmjs/crypto";
import {
  DirectSecp256k1HdWallet,
  OfflineSigner,
} from "@titan-cosmjs/proto-signing";
import { Mutex } from "async-mutex";
import DatastoreType from "nedb-promises";

const Datastore = require("nedb-promises");

export const walletOptions = {
  prefix: "titan",
  hdPaths: [stringToPath(`m/44'/60'/0'/0/0`)],
};

let walletIndex = 1;
const walletMtx = new Mutex();
const wallets: DatastoreType<{ _id: number; mnemonic: string }> =
  Datastore.create({ filename: "data/wallets.db" });

export async function getSigner() {
  return walletMtx.runExclusive(async () => {
    const wallet = await wallets.findOne({ _id: walletIndex });
    const signer = wallet
      ? await createSigner(wallet.mnemonic)
      : await createSigner();
    if (!wallet) {
      await wallets.insertOne({ _id: walletIndex, mnemonic: signer.mnemonic });
    }
    walletIndex++;
    return signer;
  });
}

export async function createSigner(mnemonic?: string) {
  return mnemonic
    ? await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, walletOptions)
    : await DirectSecp256k1HdWallet.generate(12, walletOptions);
}

export async function getSignerAddress(signer: OfflineSigner) {
  const accounts = await signer.getAccounts();
  return accounts[0].address;
}
