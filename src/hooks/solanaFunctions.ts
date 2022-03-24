import { AccountLayout, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { clusterApiUrl, Connection, Keypair, PublicKey } from "@solana/web3.js";
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

export async function getSolanaBalance(connection: Connection, publicKeyString: string) {
    const walletBalance = await connection.getBalance(new PublicKey(publicKeyString))
    return walletBalance
}

async function getTokenAccounts(connection: Connection, publicKeyString: string) {
    const account = new PublicKey(publicKeyString)
    // Connect to cluster
    const tokenAccounts = await connection.getTokenAccountsByOwner(
        account,
        {
            programId: TOKEN_PROGRAM_ID,
        }
    )
    return tokenAccounts
}

export async function getAccountBalance(connection: Connection, publicKeyString: string) {
    const accountBlance = new Array<{ id: number; address: string; balance: number }>()

    const balance = await getSolanaBalance(connection, publicKeyString)
    accountBlance.push({ id: 0, address: 'SOL', balance: balance / 10 ** 9 })

    const account = new PublicKey(publicKeyString)
    // Connect to cluster
    const tokenAccounts = await connection.getTokenAccountsByOwner(
        account,
        {
            programId: TOKEN_PROGRAM_ID,
        }
    )

    // const tokenAccounts = await getTokenAccounts(connection, publicKeyString)
    tokenAccounts.value.forEach((e, i) => {
        const accountInfo = AccountLayout.decode(e.account.data)
        // console.log(`${new PublicKey(accountInfo.mint)}   ${accountInfo.amount}`)
        const mintAddress = accountInfo.mint.toBase58()
        const amount = accountInfo.amount / BigInt(10 ** 9)
        accountBlance.push({ id: i + 1, address: mintAddress, balance: Number(amount) })
    })
    return accountBlance
}