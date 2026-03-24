import { SendTransactionError, Transaction } from "@solana/web3.js";

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

  try {
    const signature = await wallet.sendTransaction(tx, connection);

    await connection.confirmTransaction(
      { signature, blockhash, lastValidBlockHeight },
      commitment,
    );

    return signature;
  } catch (error) {
    if (error instanceof SendTransactionError) {
      const logs = await error.getLogs(connection).catch(() => null);
      const logsText = logs?.length
        ? `\nLogs:\n${logs.map((line) => `  ${line}`).join("\n")}`
        : "";

      const isInvalidWagerAmount =
        logs?.some((line) => line.includes("InvalidWagerAmount")) ||
        logs?.some((line) => line.includes("custom program error: 0x1773"));

      if (isInvalidWagerAmount) {
        throw new Error(
          `Invalid wager amount. Enter a value greater than 0 and within program limits.${logsText}`,
        );
      }

      const baseMessage = error.message || "Transaction simulation failed";
      throw new Error(`${baseMessage}${logsText}`);
    }

    throw error;
  }
}
