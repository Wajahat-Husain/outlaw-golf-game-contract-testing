import { PublicKey } from "@solana/web3.js";
import {
  GLOBAL_STATE_SEED,
  WAGER_SEED,
  TRACKER_SEED,
  GOLF_PROGRAM_PUBLICKEY,
} from "../../utils/constants";

// For global state (program-derived account)
export const findGlobalStatePda = () => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(GLOBAL_STATE_SEED)],
    GOLF_PROGRAM_PUBLICKEY
  );
};

// Wager PDA uses a BN/wager id buffer — caller must provide wagerBn.toArrayLike(Buffer, 'le', 8)
export const findWagerPdaFromBuffer = ({ wagerSeedBuffer }) => {
  console.log([Buffer.from(WAGER_SEED), wagerSeedBuffer])
  return PublicKey.findProgramAddressSync(
    [Buffer.from(WAGER_SEED), wagerSeedBuffer],
    GOLF_PROGRAM_PUBLICKEY
  );
};

// Convenience wrapper using BN instance (from anchor)
export const findWagerPdaFromBn = ({ wagerBn }) => {
  const wagerSeedBuffer = Buffer.from(wagerBn.toArrayLike(Buffer, "le", 8));
  return findWagerPdaFromBuffer({ wagerSeedBuffer });
};

// Tracker PDA
export const findTrackerPda = ({ playerPubkey }) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(TRACKER_SEED), playerPubkey.toBuffer()],
    GOLF_PROGRAM_PUBLICKEY
  );
};
