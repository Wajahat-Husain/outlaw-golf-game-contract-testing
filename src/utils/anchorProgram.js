import { AnchorProvider, Program } from "@coral-xyz/anchor";
// import idl from "../../idl/outlaw_golf.json";
import idl from "../../idl/outlaw-live.idl.json";


export const initializeOutlawGolfProgram = async ({ connection, wallet }) => {
  try {
    if (!connection) throw new Error("Connection is required.");
    if (!wallet || !wallet.publicKey) throw new Error("Wallet is required.");

    const provider = new AnchorProvider(connection, wallet, {
      preflightCommitment: "processed",
      commitment: "confirmed",
    });

    return new Program(idl, provider);
  } catch (error) {
    console.error("Error creating Outlaw Golf Program:", error);
    throw error;
  }
};
