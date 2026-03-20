import { PublicKey } from "@solana/web3.js";

const requiredEnv = (key) => {
  const value = import.meta.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);

  return value;
};

export const OUTLAW_TOKEN_PUBLICKEY = new PublicKey(
  requiredEnv("VITE_OUTLAW_TOKEN_MINT_ADDRESS")
);

export const GOLF_PROGRAM_PUBLICKEY = new PublicKey(
  requiredEnv("VITE_GOLF_PROGRAM_ID")
);

export const GLOBAL_STATE_SEED = requiredEnv("VITE_GLOBAL_STATE_SEED");
export const WAGER_SEED = requiredEnv("VITE_WAGER_SEED");
export const TRACKER_SEED = requiredEnv("VITE_TRACKER_SEED");

export const WagerStatus = {
  Open: "open",
  Joined: "joined",
  Resolved: "resolved",
  Cancelled: "cancelled",
};

export const TOKEN_DECIMALS = requiredEnv("VITE_OUTLAW_TOKEN_DECIMALS");
export const TOKEN_DECIMALS_NUM = Number(TOKEN_DECIMALS);
export const TOKEN_DECIMAL_FACTOR = 10 ** TOKEN_DECIMALS_NUM;
export const TRANSACTION_COOLDOWN = requiredEnv("VITE_TX_COOLDOWN"); // ms

export const TOAST_CONFIG = {
  position: requiredEnv("VITE_TOAST_POSITION"),
  autoClose: requiredEnv("VITE_TOAST_AUTO_CLOSE"),
};

export const SOLANA_ENDPOINT = requiredEnv("VITE_SOLANA_ENDPOINT");