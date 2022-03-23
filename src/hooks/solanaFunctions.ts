import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

function getAccountFromSecretKey(sercetKey: string): Keypair {
    return Keypair.fromSecretKey(bs58.decode(sercetKey))
}