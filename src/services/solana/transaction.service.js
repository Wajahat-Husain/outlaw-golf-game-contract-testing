import { Transaction } from "@solana/web3.js";

/**
 * Build a tx with a fresh blockhash, send, and confirm with matching blockhash metadata.
 */
export async function sendAndConfirm(
  wallet,
  connection,
  instructionOrList,
  commitment = "confirmed",
) {
  if (!wallet?.publicKey) throw new Error("Wallet not connected");

  const instructions = Array.isArray(instructionOrList)
    ? instructionOrList
    : [instructionOrList];

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash(commitment);

  const tx = new Transaction({
    recentBlockhash: blockhash,
    feePayer: wallet.publicKey,
  }).add(...instructions);

  const signature = await wallet.sendTransaction(tx, connection);

  await connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    commitment,
  );

  return signature;
}
