import { AccountLayout, createMint, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
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
        // console.log(accountInfo.amount)
        // console.log(amount)
        // console.log(Number(amount))
        if (amount > 0) {
            accountBlance.push({ id: i + 1, address: mintAddress, balance: Number(amount) })
        }
    })
    return accountBlance
}

export async function getAirdorp(connection: Connection, publicKeyString: string) {
    // airdrop SOL
    const fromAirdropSignature = await connection.requestAirdrop(new PublicKey(publicKeyString), LAMPORTS_PER_SOL);

    // Wait for airdrop confirmation
    await connection.confirmTransaction(fromAirdropSignature);
}

export async function createMintAndTransferTokens(connection: Connection, secretKeyString: string, publicKeyString: string) {
    // Create new token mint
    const mintAuthority = Keypair.generate()
    const freezeAuthority = Keypair.generate()
    const publicKey = new PublicKey(publicKeyString)
    const fromWallet = Keypair.fromSecretKey(bs58.decode(secretKeyString))
    const mint = await createMint(
        connection,
        fromWallet,
        mintAuthority.publicKey,
        freezeAuthority.publicKey,
        9
    )

    // Get the token account of the fromWallet address, and if it does not exist, create it
    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromWallet,
        mint,
        publicKey
    )

    // Mint 1 new token to the "fromTokenAccount" account we just created
    let signature = await mintTo(
        connection,
        fromWallet,
        mint,
        fromTokenAccount.address,
        mintAuthority,
        10 ** 18,
        []
    )
    // console.log('mint tx:', signature)
}

