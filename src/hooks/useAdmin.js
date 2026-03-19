import { useCallback, useState } from "react";
import { initializeOutlawGolfProgram } from "../utils/anchorProgram";
import {
  findGlobalStatePda,
  findWagerPdaFromBn,
  findTrackerPda,
} from "../services/solana/pda.service";
import { OUTLAW_TOKEN_PUBLICKEY } from "../utils/constants";
import { Transaction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { getOrCreateAta } from "../services/solana/token.service";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

export default function useAdmin(wallet, connection, refreshGlobalState) {
  const [loading, setLoading] = useState(false);

  // ------------------------------------------------------------
  // Generic TX executor (single instruction)
  // ---------------------------------------------------------
  const runTx = useCallback(
    async (instruction) => {
      try {
        if (!connection) throw new Error("Connection not available");
        const { blockhash, lastValidBlockHeight } =
          // await connection.getLatestBlockhash("finalized"); // development environment
          await connection.getLatestBlockhash("confirmed"); // production environment

        const tx = new Transaction({
          recentBlockhash: blockhash,
          feePayer: wallet.publicKey,
        }).add(instruction);

        const sig = await wallet.sendTransaction(tx, connection);
        await connection.confirmTransaction(
          { signature: sig, blockhash, lastValidBlockHeight },
          "confirmed"
        );
        return sig;
      } catch (error) {
        console.error("Transaction failed:", error);
        throw error;
      }
    },
    [wallet, connection]
  );

  // ------------------------------------------------------------
  // Toggle Pause / Unpause
  // ------------------------------------------------------------
  const togglePause = useCallback(async () => {
    if (!wallet.publicKey) throw new Error("Wallet not connected");

    setLoading(true);
    try {
      const program = await initializeOutlawGolfProgram({ connection, wallet });
      const [globalStatePda] = findGlobalStatePda();

      const state = await program.account.globalState.fetch(globalStatePda);

      if (!state.admin.equals(wallet.publicKey)) {
        throw new Error("Only admin can pause / unpause the contract");
      }

      const newPauseState = !state.isPaused;

      const ix = await program.methods
        .togglePause(newPauseState)
        .accounts({
          globalState: globalStatePda,
          admin: wallet.publicKey,
        })
        .instruction();

      const sig = await runTx(ix);
      await refreshGlobalState?.();
      return sig;
    } finally {
      setLoading(false);
    }
  }, [wallet, connection, runTx, refreshGlobalState]);

  // ------------------------------------------------------------
  // Fetch Wager (Admin Side)
  // ------------------------------------------------------------
  const fetchWager = useCallback(
    async (wagerId) => {
      try {
        const program = await initializeOutlawGolfProgram({
          connection,
          wallet,
        });
        const wagerBn = new anchor.BN(wagerId);
        const [wagerPda] = findWagerPdaFromBn({ wagerBn });

        const info = await connection.getAccountInfo(wagerPda);
        if (!info) throw new Error("Wager ID does not exist");

        const wager = await program.account.wager.fetch(wagerPda);
        return wager;
      } catch (err) {
        throw new Error(err.message || "Failed to fetch wager");
      }
    },
    [wallet, connection]
  );

  // ------------------------------------------------------------
  // Set Burn Vault
  // ------------------------------------------------------------
  const setBurnVault = useCallback(
    async (burnVaultPubkey) => {
      if (!wallet.publicKey) throw new Error("Wallet not connected");

      setLoading(true);
      try {
        const program = await initializeOutlawGolfProgram({
          connection,
          wallet,
        });
        const [globalStatePda] = findGlobalStatePda();

        const ix = await program.methods
          .setBurnVault(burnVaultPubkey)
          .accounts({
            globalState: globalStatePda,
            admin: wallet.publicKey,
            mint: OUTLAW_TOKEN_PUBLICKEY,
          })
          .instruction();

        const sig = await runTx(ix);
        await refreshGlobalState?.();
        return sig;
      } finally {
        setLoading(false);
      }
    },
    [wallet, connection, runTx, refreshGlobalState]
  );

  // ------------------------------------------------------------
  // Set Resolver Address
  // ------------------------------------------------------------
  const setResolver = useCallback(
    async (resolverPubkey) => {
      if (!wallet.publicKey) throw new Error("Wallet not connected");

      setLoading(true);
      try {
        const program = await initializeOutlawGolfProgram({
          connection,
          wallet,
        });
        const [globalStatePda] = findGlobalStatePda();

        const ix = await program.methods
          .setResolver(resolverPubkey)
          .accounts({
            globalState: globalStatePda,
            admin: wallet.publicKey,
          })
          .instruction();

        const sig = await runTx(ix);
        await refreshGlobalState?.();
        return sig;
      } finally {
        setLoading(false);
      }
    },
    [wallet, connection, refreshGlobalState, runTx]
  );

  // ------------------------------------------------------------
  // Set Distribution BPS (winner %, burn %)
  // ------------------------------------------------------------
  const setDistributionBps = useCallback(
    async (winnerBps, burnBps) => {
      if (!wallet.publicKey) throw new Error("Wallet not connected");

      setLoading(true);
      try {
        const program = await initializeOutlawGolfProgram({
          connection,
          wallet,
        });
        const [globalStatePda] = findGlobalStatePda();

        const ix = await program.methods
          .setDistributionBps(winnerBps, burnBps)
          .accounts({
            globalState: globalStatePda,
            admin: wallet.publicKey,
            mint: OUTLAW_TOKEN_PUBLICKEY,
          })
          .instruction();

        const sig = await runTx(ix);
        await refreshGlobalState?.();
        return sig;
      } finally {
        setLoading(false);
      }
    },
    [wallet, connection, refreshGlobalState, runTx]
  );

  // ------------------------------------------------------------
  // Set Referral Ratios (referral %, burn-if-referral %)
  // ------------------------------------------------------------
  const setReferralDistributionRatios = useCallback(
    async (referralBps, burnIfReferralBps) => {
      if (!wallet.publicKey) throw new Error("Wallet not connected");

      setLoading(true);
      try {
        const program = await initializeOutlawGolfProgram({
          connection,
          wallet,
        });
        const [globalStatePda] = findGlobalStatePda();

        const ix = await program.methods
          .setReferralDistributionRatios(referralBps, burnIfReferralBps)
          .accounts({
            globalState: globalStatePda,
            admin: wallet.publicKey,
            mint: OUTLAW_TOKEN_PUBLICKEY,
          })
          .instruction();

        const sig = await runTx(ix);
        await refreshGlobalState?.();
        return sig;
      } finally {
        setLoading(false);
      }
    },
    [wallet, connection, refreshGlobalState, runTx]
  );

  // ------------------------------------------------------------
  // Set New Admin
  // ------------------------------------------------------------
  const setAdmin = useCallback(
    async (newAdminPubkey) => {
      if (!wallet.publicKey) throw new Error("Wallet not connected");

      setLoading(true);
      try {
        const program = await initializeOutlawGolfProgram({
          connection,
          wallet,
        });
        const [globalStatePda] = findGlobalStatePda();

        const ix = await program.methods
          .setAdmin(newAdminPubkey)
          .accounts({
            globalState: globalStatePda,
            admin: wallet.publicKey,
          })
          .instruction();

        const sig = await runTx(ix);
        await refreshGlobalState?.();
        return sig;
      } finally {
        setLoading(false);
      }
    },
    [wallet, connection, refreshGlobalState, runTx]
  );

  // ------------------------------------------------------------
  // Emergency Withdraw
  // ------------------------------------------------------------
  const emergencyWithdraw = useCallback(
    async (wagerId) => {
      if (!wallet.publicKey) throw new Error("Wallet not connected");

      setLoading(true);
      try {
        const program = await initializeOutlawGolfProgram({
          connection,
          wallet,
        });
        const wagerBn = new anchor.BN(wagerId);

        const [globalStatePda] = findGlobalStatePda();
        const [wagerPda] = findWagerPdaFromBn({ wagerBn });

        const wager = await program.account.wager.fetch(wagerPda);

        const [player1Tracker] = findTrackerPda({
          playerPubkey: wager.player1,
        });

        let player2Tracker = PublicKey.default;
        if (wager.player2) {
          [player2Tracker] = findTrackerPda({ playerPubkey: wager.player2 });
        }

        const escrowVault = await getOrCreateAta({
          connection,
          payerPublicKey: wallet.publicKey,
          mint: OUTLAW_TOKEN_PUBLICKEY,
          status: true,
          ownerPubkey: wagerPda,
          wallet,
        });

        const adminTokenAccount = await getOrCreateAta({
          connection,
          payerPublicKey: wallet.publicKey,
          mint: OUTLAW_TOKEN_PUBLICKEY,
          status: false,
          ownerPubkey: wallet.publicKey,
          wallet,
        });

        const ix = await program.methods
          .emergencyWithdraw(wagerBn)
          .accounts({
            admin: wallet.publicKey,
            globalState: globalStatePda,
            wager: wagerPda,
            playerTracker: player1Tracker,
            player2Tracker,
            escrowVault,
            adminTokenAccount,
            mint: OUTLAW_TOKEN_PUBLICKEY,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .instruction();

        const sig = await runTx(ix);
        await refreshGlobalState?.();
        return sig;
      } finally {
        setLoading(false);
      }
    },
    [wallet, connection, refreshGlobalState, runTx]
  );

  // ------------------------------------------------------------
  // Expose API
  // ------------------------------------------------------------
  return {
    loading,
    togglePause,
    fetchWager,
    setBurnVault,
    setResolver,
    setDistributionBps,
    setReferralDistributionRatios,
    setAdmin,
    emergencyWithdraw,
  };
}
