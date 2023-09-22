import * as token from "@solana/spl-token";
import * as web3 from "@solana/web3.js";
import {initializeKeypair} from "./initializeKeypair.js"

async function cretaeNewMint(
    connection : web3.Connection,
    payer : web3.Keypair,
    mintAuthority: web3.PublicKey,
    freezeAuthority: web3.PublicKey,
    decimals: number,
):Promise<web3.PublicKey>{
    const tokenMint = await token.createMint(
        connection,
        payer,
        mintAuthority,
        freezeAuthority,
        decimals
    )
    console.log("Token Mint PubKey: ", tokenMint);
    console.log("tokenMint: https://explorer.solana.com/address/"+tokenMint+"?cluster=devnet");
    return tokenMint;
}

async function createTokenAccount(
    connection : web3.Connection,
    payer : web3.Keypair,
    mint: web3.PublicKey,
    owner: web3.PublicKey,
){
    const tokenAccount = await token.getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        owner,
        mint
    );
    console.log("Token Account PubKey: ", tokenAccount.address);
    return tokenAccount;
}

async function mintTokens(
    connection : web3.Connection,
    payer : web3.Keypair,
    destination: web3.PublicKey,
    authority : web3.PublicKey,
    mint: web3.PublicKey,
    amount: number,
){
        const mintInfo = await token.getMint(connection,mint)

        const transactionSignature = await token.mintTo(
            connection,
            payer,
            mint,
            destination,
            authority,
            amount*10**mintInfo.decimals
        )

        console.log("Mint Transaction Signature: https://explorer.solana.com/tx/"+transactionSignature+"?cluster=devnet");
}




async function main() {
    const connection = new web3.Connection(web3.clusterApiUrl("devnet"), "confirmed");
    const user = await initializeKeypair(connection);

    console.log("User PubKey: ", user.publicKey.toString());

    const mint = await cretaeNewMint(
        connection,
        user,
        user.publicKey,
        user.publicKey,
        2
    );

    const tokenAccount = await createTokenAccount(
        connection,
        user,
        mint,
        user.publicKey
    );

    await mintTokens(
        connection,
        user,
        tokenAccount.address,
        user.publicKey,
        mint,
        100
    );
}

main()
    .then(() => {
        console.log("Finished successfully")
        process.exit(0)
    })
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
