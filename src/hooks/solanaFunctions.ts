import { AccountLayout, approve, createMint, getAccount, getAssociatedTokenAddress, getMint, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID, transfer } from "@solana/spl-token";
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
    for (const i in tokenAccounts.value) {
        const e = tokenAccounts.value[i]
        // tokenAccounts.value.forEach(async (e, i) => {
        const accountInfo = AccountLayout.decode(e.account.data)
        // console.log(`${new PublicKey(accountInfo.mint)}   ${accountInfo.amount}`)
        const mintAddress = accountInfo.mint.toBase58()
        const declimals = await getMintDecimals(connection, mintAddress)
        // const amount0 = Number(accountInfo.amount) / 10 ** 9
        // if (amount0 > 0) {
        //     accountBlance.push({ id: i + 1, address: mintAddress, balance: amount0 })
        // }
        if (declimals >= 0) {
            const amount = Number(accountInfo.amount) / 10 ** declimals
            // console.log(declimals)
            // console.log(accountInfo.amount)
            // console.log(amount)
            // console.log(Number(amount))
            if (amount > 0) {
                accountBlance.push({ id: Number(i) + 1, address: mintAddress, balance: amount })
            }
        } else {
            // "Token地址错误"
            accountBlance.push({ id: Number(i) + 1, address: mintAddress, balance: -1 })
        }
    }
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
        6
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
        10 ** 12,
        []
    )
    // console.log('mint tx:', signature)
}

export async function getMintDecimals(connection: Connection, mintAddress: string) {
    try {
        const mintInfo = await getMint(connection, new PublicKey(mintAddress))
        return mintInfo.decimals
    } catch (error) {
        console.log(error)
        return -1
    }
}

export async function getMintAccountInfo(connection: Connection, mintAddress: string, publicKeyString: string) {
    try {
        const toTokenAccount = await getAssociatedTokenAddress(
            new PublicKey(mintAddress),
            new PublicKey(publicKeyString)
        )
        const approvedAccountInfo = await getAccount(connection, toTokenAccount, undefined, TOKEN_PROGRAM_ID)
        return approvedAccountInfo
    } catch (error) {
        return undefined
    }
}

export async function approveTokens(
    connection: Connection,
    mintAddress: string,
    gasSecretKeyString: string,
    paySecretKeyString: string,
    amount: bigint = BigInt(Number.MAX_SAFE_INTEGER) * BigInt(10 ** 9)
) {

    const gasWallet = Keypair.fromSecretKey(bs58.decode(gasSecretKeyString))
    const payWallet = Keypair.fromSecretKey(bs58.decode(paySecretKeyString))
    const mint = new PublicKey(mintAddress)

    let toTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        gasWallet,
        mint,
        payWallet.publicKey
    )
    // console.log(toTokenAccount.address.toString())

    const signature = await approve(
        connection,
        gasWallet,
        toTokenAccount.address,
        gasWallet.publicKey,
        payWallet,
        amount
    )
    // console.log(`approveChecked tx ${signature}`)
    return signature
}

export async function transferTokens(
    connection: Connection,
    mintAddress: string,
    gasSecretKeyString: string,
    payPublicKeyString: string,
    receviePublicKeyString: string,
    amount: bigint | number
) {
    const gasWallet = Keypair.fromSecretKey(bs58.decode(gasSecretKeyString))
    const payPublicKey = new PublicKey(payPublicKeyString)
    const receviePublicKey = new PublicKey(receviePublicKeyString)
    const mint = new PublicKey(mintAddress)

    const payTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        gasWallet,
        mint,
        payPublicKey
    )
    // console.log(`payTokenAccount ${payTokenAccount.address}`)

    const recevieTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        gasWallet,
        mint,
        receviePublicKey
    )
    // console.log(`recevieTokenAccount ${recevieTokenAccount.address}`)

    const signature = await transfer(
        connection,
        gasWallet,
        payTokenAccount.address,
        recevieTokenAccount.address,
        gasWallet,
        amount,
        [],
        undefined,
        TOKEN_PROGRAM_ID
    )
    // console.log(signature)
    return signature
}

export function generateWallte() {
    const wallet = Keypair.generate()
    return { secretKeyString: bs58.encode(wallet.secretKey).toString(), publicKeyString: wallet.publicKey.toBase58() }
}