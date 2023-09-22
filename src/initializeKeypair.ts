import * as web3 from "@solana/web3.js";
import * as fs from "fs";

import dotenv from "dotenv";
dotenv.config();

export async function initializeKeypair(
    connection : web3.Connection,
):Promise<web3.Keypair>{
    let keypair : web3.Keypair;

    if (!process.env.PRIVATE_KEY){
        console.log("creating a env file");
        keypair = web3.Keypair.generate();
        fs.writeFileSync(".env",`KEYPAIR_PATH=[${keypair.secretKey.toString()}]`);
    } else {
        const secret = JSON.parse(process.env.PRIVATE_KEY ?? "") as number[];
        const secretKey = Uint8Array.from(secret);
        keypair = web3.Keypair.fromSecretKey(secretKey);
    }

    console.log("PubKey: ", keypair.publicKey.toBase58());
    await airdropSolIfNeeded(keypair,connection);
    return keypair;
}

async function airdropSolIfNeeded(
    keypair : web3.Keypair,
    connection : web3.Connection,
){
    const balance = await connection.getBalance(keypair.publicKey);
    console.log("Balance: ", balance/ web3.LAMPORTS_PER_SOL);
    if (balance < web3.LAMPORTS_PER_SOL){
        console.log("Airdropping SOL");
        const signature = await connection.requestAirdrop(
            keypair.publicKey,
            web3.LAMPORTS_PER_SOL
        );
    }
}