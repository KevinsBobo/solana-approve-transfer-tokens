import { Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

export function getPublicKeyFromSecretKeyString(sercetKeyString: string | undefined): string {
    let publicKey = ""
    try {
        publicKey = sercetKeyString ?
            Keypair.fromSecretKey(bs58.decode(sercetKeyString)).publicKey.toBase58() :
            ""
    } catch (error) {

    }
    return publicKey
}

export function getPublicKeyFromPublicKeyString(publicKeyString: string | undefined): string {
    let publicKey = ""
    try {
        publicKey = publicKeyString ?
            (new PublicKey(publicKeyString)).toBase58() :
            ""
    } catch (error) {

    }
    return publicKey
}