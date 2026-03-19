import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { Transaction } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

export const getOrCreateAta = async ({
  connection,
  payerPublicKey,
  mint,
  status,
  ownerPubkey,
  wallet,
}) => {
  const ata = await getAssociatedTokenAddress(
    mint,
    ownerPubkey,
    status,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const info = await connection.getAccountInfo(ata);
  if (info) return ata;

  // create ATA using payer (wallet)
  const ix = createAssociatedTokenAccountInstruction(
    payerPublicKey,
    ata,
    ownerPubkey,
    mint,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const tx = new Transaction().add(ix);
  const sig = await wallet.sendTransaction(tx, connection);
  await connection.confirmTransaction(sig, "confirmed");
  return ata;
};
