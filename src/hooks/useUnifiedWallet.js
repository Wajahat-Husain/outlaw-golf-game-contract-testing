import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  useAppKitAccount,
  useAppKitProvider,
  useDisconnect,
} from "@reown/appkit/react";
import { PublicKey } from "@solana/web3.js";

export default function useUnifiedWallet() {
  const { isConnected, address } = useAppKitAccount({ namespace: "solana" });
  const { walletProvider } = useAppKitProvider("solana");
  const { disconnect: appKitDisconnect } = useDisconnect();

  const walletProviderRef = useRef(walletProvider);
  const appKitDisconnectRef = useRef(appKitDisconnect);

  useEffect(() => {
    walletProviderRef.current = walletProvider;
  }, [walletProvider]);

  useEffect(() => {
    appKitDisconnectRef.current = appKitDisconnect;
  }, [appKitDisconnect]);

  const sendTransaction = useCallback(async (tx, connection) => {
    const provider = walletProviderRef.current;
    if (!provider) {
      throw new Error("No connected wallet provider found.");
    }
    if (typeof provider.sendTransaction === "function") {
      return provider.sendTransaction(tx, connection);
    }
    if (typeof provider.signAndSendTransaction === "function") {
      const result = await provider.signAndSendTransaction(tx);
      return result?.signature || result?.hash || result?.txid || String(result);
    }
    if (typeof provider.signTransaction === "function") {
      const signedTx = await provider.signTransaction(tx);
      return connection.sendRawTransaction(signedTx.serialize());
    }
    throw new Error("Connected Reown wallet cannot send transactions.");
  }, []);

  const disconnect = useCallback(() => {
    return appKitDisconnectRef.current({ namespace: "solana" });
  }, []);

  const signTransaction = useCallback(async (tx) => {
    const provider = walletProviderRef.current;
    if (!provider || typeof provider.signTransaction !== "function") {
      throw new Error("Connected wallet does not support signTransaction.");
    }
    return provider.signTransaction(tx);
  }, []);

  const signAllTransactions = useCallback(async (txs) => {
    const provider = walletProviderRef.current;
    if (!provider || typeof provider.signAllTransactions !== "function") {
      throw new Error("Connected wallet does not support signAllTransactions.");
    }
    return provider.signAllTransactions(txs);
  }, []);

  return useMemo(() => {
    if (!isConnected || !address || !walletProvider) {
      return {
        isConnected: false,
        publicKey: null,
        sendTransaction: null,
        signTransaction: null,
        signAllTransactions: null,
        disconnect: async () => {},
      };
    }

    let publicKey;
    try {
      publicKey = new PublicKey(address);
    } catch {
      return {
        isConnected: false,
        publicKey: null,
        sendTransaction: null,
        signTransaction: null,
        signAllTransactions: null,
        disconnect: async () => {},
      };
    }

    return {
      isConnected: true,
      publicKey,
      sendTransaction,
      signTransaction:
        typeof walletProvider.signTransaction === "function"
          ? signTransaction
          : null,
      signAllTransactions:
        typeof walletProvider.signAllTransactions === "function"
          ? signAllTransactions
          : null,
      disconnect,
    };
  }, [
    isConnected,
    address,
    walletProvider,
    sendTransaction,
    signTransaction,
    signAllTransactions,
    disconnect,
  ]);
}
