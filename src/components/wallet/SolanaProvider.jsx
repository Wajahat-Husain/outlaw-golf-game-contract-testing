import React from "react";
import { createAppKit } from "@reown/appkit/react";
import { SolanaAdapter } from "@reown/appkit-adapter-solana/react";
import { solana, solanaDevnet } from "@reown/appkit/networks";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { SOLANA_ENDPOINT } from "../../utils/constants";

const reownProjectId = import.meta.env.VITE_REOWN_PROJECT_ID;
const APPKIT_INIT_FLAG = "__OUTLAW_REOWN_APPKIT_INITIALIZED__";

if (reownProjectId && !globalThis[APPKIT_INIT_FLAG]) {
  createAppKit({
    projectId: reownProjectId,
    adapters: [new SolanaAdapter()],
    networks: [solana, solanaDevnet],
    defaultNetwork: solana,
    metadata: {
      name: "Outlaw Golf Arena",
      description: "On-chain wagers, escrow, and settlement",
      url: window.location.origin,
      icons: ["https://avatars.githubusercontent.com/u/179229932"],
    },
    enableWalletConnect: true,
    allWallets: "SHOW",
    includeWalletIds:['a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393','022076fddebdd81c287239a7397ef625ef432db168b884f1b8ed8e148ce23a84','c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96'],
    featuredWalletIds:['a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393','022076fddebdd81c287239a7397ef625ef432db168b884f1b8ed8e148ce23a84','c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96'],
    features: {
      analytics: false,
      swaps: false,
      email: false,
      socials: [],
      legalCheckbox: false,
      onramp: false,
      connectMethodsOrder: ["wallet"],
    },
  });
  globalThis[APPKIT_INIT_FLAG] = true;
}

const SolanaProvider = ({ children }) => {
  return (
    <ConnectionProvider endpoint={SOLANA_ENDPOINT}>{children}</ConnectionProvider>
  );
};

export default SolanaProvider;
