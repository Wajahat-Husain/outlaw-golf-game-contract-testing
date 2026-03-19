import React, { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
// import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
// import { clusterApiUrl } from "@solana/web3.js";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";  
import "@solana/wallet-adapter-react-ui/styles.css";
import { SOLANA_ENDPOINT } from "../../utils/constants";

const SolanaProvider = ({ children }) => {
  // const network = WalletAdapterNetwork.Devnet;
  // const network = WalletAdapterNetwork.Mainnet;
  // console.log("network", network);
  // const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const endpoint = SOLANA_ENDPOINT;

  // Explicitly include only Solana-compatible wallets
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default SolanaProvider;
