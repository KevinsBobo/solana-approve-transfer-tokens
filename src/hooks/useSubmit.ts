import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { AccountLayout, approve, approveChecked, createMint, getAccount, getMint, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID, transfer } from '@solana/spl-token'; // @FIXME: replace with @solana/spl-token
import bs58 from 'bs58'


export const useSubmit = () => {
    // fix Buffer is not defined
    window.Buffer = window.Buffer || require("buffer").Buffer;
    return { submit }
}

function submit() {
    // createMintAndTransferTokens()
    // approveAndTransferTokens()
    // checkApproved(new PublicKey('9FDCTmKNstoKwMSVAUWwnUv3mbqRFyQGDDRdqB5eLPsN'))
    // checkMint(new PublicKey('8zRnXoSK6To5PxmrkneuGPBwhfAxrnAjbYKguQsKSpeq'))
    // testGetAssociatedTokenAccount()
    // approveTokens()
    checkApproved(new PublicKey('9FDCTmKNstoKwMSVAUWwnUv3mbqRFyQGDDRdqB5eLPsN'))
    checkAccount()
}

function getAccountFromSecretKey(sercetKey: string): Keypair {
    return Keypair.fromSecretKey(bs58.decode(sercetKey))
}

async function checkApproved(account: PublicKey) {
    // Connect to cluster
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')
    const approvedAccountInfo = await getAccount(connection, account, undefined, TOKEN_PROGRAM_ID)
    console.log(approvedAccountInfo.delegate?.toString())
    console.log(approvedAccountInfo.delegatedAmount)
}

async function checkMint(mint: PublicKey) {
    // Connect to cluster
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')
    const mintInfo = await getMint(connection, mint)
    console.log(mintInfo)
}

async function checkAccount() {
    const fromWallet = getAccountFromSecretKey('5CJn8hnPKQ7KRo8D9YF4J98tt4C4bn7kgMXL6Bpc4H1srNqwmCTBNUcSfqWkBZReincY252rVDdfQReg7Jx7cztC')
    const mintAuthority = getAccountFromSecretKey('JpAs3PCAC98Bx4ChfAbPzzd5deV96ozLu44wkCuAQhJwBdFtJcT3QA7ABoHKrJksdQgnBULpCb6QkVkhEDErCiQ')
    const freezeAuthority = getAccountFromSecretKey('4f3kdJ6Ga5QXQSTrZxJ84T1YTafwh8caD8RweDb7KutKWc1kWsRGtphbaaqYWMFwgt2dFbUcdr959hSMKh34LFpN')
    const toWallet = getAccountFromSecretKey('16sBQLdzGCXsv6uNXrH2tt7NbXnWuYAWr4ZUuWuvGrn7vRRFy39jdXgJCZrnL2L9gFv2wpS4L5WEeXNr4W7bpdm')
    const testWallet = getAccountFromSecretKey('4wz9UVEFV8HFtXGHp8fPEMhPwzYVh384Jm1qpmim2r9pZfF7qSwhGRr8ShZK7UMNNX8eSPdn4sRbzSH88n5hi7XN')

    const account = toWallet.publicKey
    // Connect to cluster
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')
    const testkenAccounts = await connection.getTokenAccountsByOwner(
        account,
        {
            programId: TOKEN_PROGRAM_ID,
        }
    )

    console.log("Token                                         Balance");
    console.log("------------------------------------------------------------");
    testkenAccounts.value.forEach((e) => {
        const accountInfo = AccountLayout.decode(e.account.data);
        console.log(`${new PublicKey(accountInfo.mint)}   ${accountInfo.amount}`);
    })
}

async function testGetAssociatedTokenAccount() {
    // Connect to cluster
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')
    const fromWallet = getAccountFromSecretKey('5CJn8hnPKQ7KRo8D9YF4J98tt4C4bn7kgMXL6Bpc4H1srNqwmCTBNUcSfqWkBZReincY252rVDdfQReg7Jx7cztC')
    const toWallet = getAccountFromSecretKey('16sBQLdzGCXsv6uNXrH2tt7NbXnWuYAWr4ZUuWuvGrn7vRRFy39jdXgJCZrnL2L9gFv2wpS4L5WEeXNr4W7bpdm')
    const mint = new PublicKey('8zRnXoSK6To5PxmrkneuGPBwhfAxrnAjbYKguQsKSpeq')
    let toTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromWallet,
        mint,
        toWallet.publicKey
    )
    console.log(toTokenAccount) // .address.toString())

    // toTokenAccount = await getOrCreateAssociatedTokenAccount(
    //     connection,
    //     fromWallet,
    //     mint,
    //     toTokenAccount.address
    // )
    // console.log(toTokenAccount.address.toString())
}

async function approveTokens() {
    // Connect to cluster
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')

    const fromWallet = getAccountFromSecretKey('5CJn8hnPKQ7KRo8D9YF4J98tt4C4bn7kgMXL6Bpc4H1srNqwmCTBNUcSfqWkBZReincY252rVDdfQReg7Jx7cztC')
    const toWallet = getAccountFromSecretKey('16sBQLdzGCXsv6uNXrH2tt7NbXnWuYAWr4ZUuWuvGrn7vRRFy39jdXgJCZrnL2L9gFv2wpS4L5WEeXNr4W7bpdm')
    const testWalletPublicKey = new PublicKey('77SsSbSVGvMx18tnHgDq9cRPxUuJr9gHFoWqceB8TiRn')
    const mint = new PublicKey('8zRnXoSK6To5PxmrkneuGPBwhfAxrnAjbYKguQsKSpeq')

    let toTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromWallet,
        mint,
        toWallet.publicKey
    )
    console.log(toTokenAccount.address.toString())

    let signature = await approve(
        connection,
        fromWallet,
        toTokenAccount.address,
        testWalletPublicKey,
        toWallet,
        10 ** 18
    )
    console.log(`approveChecked tx ${signature}`)
}

async function approveAndTransferTokens() {
    // Connect to cluster
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')

    const fromWallet = getAccountFromSecretKey('5CJn8hnPKQ7KRo8D9YF4J98tt4C4bn7kgMXL6Bpc4H1srNqwmCTBNUcSfqWkBZReincY252rVDdfQReg7Jx7cztC')
    const toWallet = getAccountFromSecretKey('16sBQLdzGCXsv6uNXrH2tt7NbXnWuYAWr4ZUuWuvGrn7vRRFy39jdXgJCZrnL2L9gFv2wpS4L5WEeXNr4W7bpdm')
    const testWalletPublicKey = new PublicKey('77SsSbSVGvMx18tnHgDq9cRPxUuJr9gHFoWqceB8TiRn')
    const mint = new PublicKey('8zRnXoSK6To5PxmrkneuGPBwhfAxrnAjbYKguQsKSpeq')

    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromWallet,
        mint,
        toWallet.publicKey
    )
    console.log(`toTokenAccount ${toTokenAccount.address}`)

    const testTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromWallet,
        mint,
        testWalletPublicKey
    )
    console.log(`testTokenAccount ${testTokenAccount.address}`)

    let signature = await approveChecked(
        connection,
        fromWallet,
        mint,
        toTokenAccount.address,
        fromWallet.publicKey,
        toWallet,
        10 ** 18,
        9,
        [],
        undefined,
        TOKEN_PROGRAM_ID
    )
    console.log(`approveChecked tx ${signature}`)

    signature = await transfer(
        connection,
        fromWallet,
        toTokenAccount.address,
        testTokenAccount.address,
        fromWallet,
        10 ** 9,
        [],
        undefined,
        TOKEN_PROGRAM_ID
    )
    console.log(signature)

    const testkenAccounts = await connection.getTokenAccountsByOwner(
        testWalletPublicKey,
        {
            programId: TOKEN_PROGRAM_ID,
        }
    )

    console.log("Token                                         Balance");
    console.log("------------------------------------------------------------");
    testkenAccounts.value.forEach((e) => {
        const accountInfo = AccountLayout.decode(e.account.data);
        console.log(`${new PublicKey(accountInfo.mint)}   ${accountInfo.amount}`);
    })
}

async function createMintAndTransferTokens() {
    // Connect to cluster
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    const fromWallet = getAccountFromSecretKey('5CJn8hnPKQ7KRo8D9YF4J98tt4C4bn7kgMXL6Bpc4H1srNqwmCTBNUcSfqWkBZReincY252rVDdfQReg7Jx7cztC')
    const mintAuthority = getAccountFromSecretKey('JpAs3PCAC98Bx4ChfAbPzzd5deV96ozLu44wkCuAQhJwBdFtJcT3QA7ABoHKrJksdQgnBULpCb6QkVkhEDErCiQ')
    const freezeAuthority = getAccountFromSecretKey('4f3kdJ6Ga5QXQSTrZxJ84T1YTafwh8caD8RweDb7KutKWc1kWsRGtphbaaqYWMFwgt2dFbUcdr959hSMKh34LFpN')
    const toWallet = getAccountFromSecretKey('16sBQLdzGCXsv6uNXrH2tt7NbXnWuYAWr4ZUuWuvGrn7vRRFy39jdXgJCZrnL2L9gFv2wpS4L5WEeXNr4W7bpdm')
    const testWallet = getAccountFromSecretKey('4wz9UVEFV8HFtXGHp8fPEMhPwzYVh384Jm1qpmim2r9pZfF7qSwhGRr8ShZK7UMNNX8eSPdn4sRbzSH88n5hi7XN')
    // Generate a new wallet keypair
    // const fromWallet = Keypair.generate()
    // const mintAuthority = Keypair.generate()
    // const freezeAuthority = Keypair.generate()
    // const toWallet = Keypair.generate()
    console.log(`fromWallet ${fromWallet.publicKey.toString()}`)
    // console.log(`fromWallet secretKey ${bs58.encode(fromWallet.secretKey).toString()}`)
    console.log(`mintAuthority ${mintAuthority.publicKey.toString()}`)
    // console.log(`mintAuthority secretKey ${bs58.encode(mintAuthority.secretKey).toString()}`)
    console.log(`freezeAuthority ${freezeAuthority.publicKey.toString()}`)
    // console.log(`freezeAuthority secretKey ${bs58.encode(freezeAuthority.secretKey).toString()}`)
    console.log(`toWallet ${toWallet.publicKey.toString()}`)
    // console.log(`toWallet secretKey ${bs58.encode(toWallet.secretKey).toString()}`)
    console.log(`testWallet ${testWallet.publicKey.toString()}`)

    // airdrop SOL
    const fromAirdropSignature = await connection.requestAirdrop(fromWallet.publicKey, LAMPORTS_PER_SOL);

    // Wait for airdrop confirmation
    await connection.confirmTransaction(fromAirdropSignature);

    const walletBalance = await connection.getBalance(fromWallet.publicKey)
    console.log(walletBalance)

    // Create new token mint
    const mint = await createMint(
        connection,
        fromWallet,
        mintAuthority.publicKey,
        freezeAuthority.publicKey,
        9
    );
    console.log(mint.toBase58());

    // Get the token account of the fromWallet address, and if it does not exist, create it
    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromWallet,
        mint,
        fromWallet.publicKey
    );
    console.log(`fromTokenAccount ${fromTokenAccount.address.toString()}`)

    // Get the token account of the toWallet address, and if it does not exist, create it
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromWallet,
        mint,
        toWallet.publicKey
    );
    console.log(`toTokenAccount ${toTokenAccount.address.toString()}`)

    // Mint 1 new token to the "fromTokenAccount" account we just created
    let signature = await mintTo(
        connection,
        fromWallet,
        mint,
        fromTokenAccount.address,
        mintAuthority,
        1000000000,
        []
    );
    console.log('mint tx:', signature);

    const mintInfo = await getMint(
        connection,
        mint
    )
    console.log(mintInfo.supply);

    const tokenAccountInfo = await getAccount(
        connection,
        fromTokenAccount.address
    )
    console.log(tokenAccountInfo.amount);

    // Transfer the new token to the "toTokenAccount" we just created
    signature = await transfer(
        connection,
        fromWallet,
        fromTokenAccount.address,
        toTokenAccount.address,
        fromWallet.publicKey,
        1000000000,
        []
    );
    console.log('transfer tx:', signature);

    const tokenAccounts = await connection.getTokenAccountsByOwner(
        toWallet.publicKey,
        {
            programId: TOKEN_PROGRAM_ID,
        }
    )

    console.log("Token                                         Balance");
    console.log("------------------------------------------------------------");
    tokenAccounts.value.forEach((e) => {
        const accountInfo = AccountLayout.decode(e.account.data);
        console.log(`${new PublicKey(accountInfo.mint)}   ${accountInfo.amount}`);
    })
}