import React, { createContext, useState, useEffect, useContext } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { getProgram } from "../utils/anchorProgram";
import { findGlobalStatePda } from "../services/solana/pda.service";

const GlobalStateContext = createContext();

export function GlobalStateProvider({ children }) {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [globalState, setGlobalState] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);

  const refreshGlobalState = async () => {
    if (!wallet.publicKey) return;
    try {
      setLoading(true);
      const program = await getProgram(connection, wallet);
      const [globalStatePda] = findGlobalStatePda(program.programId);
      const state = await program.account.globalState.fetch(globalStatePda);
      setGlobalState(state);
      setIsInitialized(true);
    } catch (err) {
      console.warn("GlobalState fetch failed:", err?.message || err);
      setGlobalState(null);
      setIsInitialized(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (wallet.publicKey) {
      refreshGlobalState();
    } else {
      setGlobalState(null);
      setIsInitialized(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet.publicKey, connection]);

  return (
    <GlobalStateContext.Provider
      value={{
        globalState,
        refreshGlobalState,
        isInitialized,
        loading,
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
}

export function useGlobalStateContext() {
  return useContext(GlobalStateContext);
}
