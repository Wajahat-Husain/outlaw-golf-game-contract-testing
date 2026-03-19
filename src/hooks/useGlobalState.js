import { useState, useCallback, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { initializeOutlawGolfProgram } from "../utils/anchorProgram";
import { findGlobalStatePda } from "../services/solana/pda.service";

export const useGlobalState = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [globalStateInfo, setGlobalStateInfo] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkGlobalState = useCallback(async () => {
    if (!wallet.publicKey) {
      console.log("No wallet connected, skipping GlobalState check");
      return;
    }

    try {
      const program = await initializeOutlawGolfProgram({ connection, wallet });
      const [globalStatePda] = findGlobalStatePda();
      const globalState = await program.account.globalState.fetch(
        globalStatePda
      );

      console.log("GlobalState:", globalState);
      setGlobalStateInfo(globalState);
      setIsInitialized(true);
      setError(null);
    } catch (err) {
      console.error("Error checking GlobalState:", err);
      setError(err.message || "Failed to check program initialization");
      setIsInitialized(false);
      setGlobalStateInfo(null);
    }
  }, [wallet.publicKey, connection]);

  const initializeProgram = useCallback(async () => {
    if (!wallet.publicKey) throw new Error("Please connect your wallet first!");

    setIsLoading(true);
    setError(null);

    try {
      const program = await initializeOutlawGolfProgram({ connection, wallet });
      const [globalStatePda] = findGlobalStatePda();

      const txSignature = await program.methods
        .initialize()
        .accounts({
          globalState: globalStatePda,
          payer: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Initialization Transaction Signature:", txSignature);
      setIsInitialized(true);
      await checkGlobalState();

      return txSignature;
    } catch (err) {
      console.error("Error initializing program:", err);
      setError(err.message || "Failed to initialize program");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [wallet.publicKey, connection, checkGlobalState]);

  const isAdmin = useCallback(() => {
    return (
      wallet.publicKey &&
      globalStateInfo?.admin &&
      wallet.publicKey.toBase58() === globalStateInfo.admin.toBase58()
    );
  }, [wallet.publicKey, globalStateInfo]);

  const isResolver = useCallback(() => {
    return (
      wallet.publicKey &&
      globalStateInfo?.resolver &&
      wallet.publicKey.toBase58() === globalStateInfo.resolver.toBase58()
    );
  }, [wallet.publicKey, globalStateInfo]);

  useEffect(() => {
    if (wallet.publicKey) {
      checkGlobalState();
    }
  }, [wallet.publicKey, checkGlobalState]);

  return {
    globalStateInfo,
    isInitialized,
    isLoading,
    error,
    checkGlobalState,
    initializeProgram,
    isAdmin: isAdmin(),
    isResolver: isResolver(),
  };
};
