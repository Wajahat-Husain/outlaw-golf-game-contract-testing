import { useCallback, useMemo, useState } from "react";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { initializeOutlawGolfProgram } from "../utils/anchorProgram";
import {
  findGlobalStatePda,
  findWagerPdaFromBn,
  findTrackerPda,
} from "../services/solana/pda.service";
import { OUTLAW_TOKEN_PUBLICKEY } from "../utils/constants";
import { sendAndConfirm } from "../services/solana/transaction.service";

export default function useWager(wallet, connection, refreshGlobalState) {
  const [loading, setLoading] = useState(false);

  // ------------------------------------------------------------
  // Fetch a wager by BN
  // ------------------------------------------------------------
  const fetchWager = useCallback(
    async (wagerBn) => {
      setLoading(true);
      try {
        const program = await initializeOutlawGolfProgram({
          connection,
          wallet,
        });
        const [wagerPda] = findWagerPdaFromBn({ wagerBn });

        const info = await connection.getAccountInfo(wagerPda);
        if (!info) throw new Error("Wager not found");
        const wager = await program.account.wager.fetch(wagerPda);
        return wager;
      } catch (error) {
        console.error("error fetching wager", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [connection, wallet],
  );

  // ------------------------------------------------------------
  // Fetch active wagers for connected wallet
  // Note: account.wager.all() loads every wager account; for large deployments
  // prefer getProgramAccounts with memcmp filters on player fields.
  // ------------------------------------------------------------
  const fetchActiveWagersForWallet = useCallback(
    async () => {
      if (!wallet.publicKey) throw new Error("Wallet not connected");
      setLoading(true);

      try {
        const program = await initializeOutlawGolfProgram({
          connection,
          wallet,
        });

        const allWagers = await program.account.wager.all();

        const active = allWagers.filter(({ account }) => {
          const isPlayer =
            account.player1?.equals(wallet.publicKey) ||
            (account.player2 && account.player2.equals(wallet.publicKey));

          const isActive =
            account.status &&
            !account.status.cancelled &&
            !account.status.resolved;

          return isPlayer && isActive;
        });

        return active; // array of { publicKey, account }
      } catch (error) {
        console.error("error fetching active wagers for wallet", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [connection, wallet]
  );

  // ------------------------------------------------------------
  // Create Wager
  // ------------------------------------------------------------
  const createWager = useCallback(
    async (wagerBn, amountBn) => {
      if (!wallet.publicKey) throw new Error("Wallet not connected");
      setLoading(true);

      try {
        const program = await initializeOutlawGolfProgram({
          connection,
          wallet,
        });

        const [globalStatePda] = findGlobalStatePda();
        const [wagerPda] = findWagerPdaFromBn({ wagerBn });
        const [playerTrackerPda] = findTrackerPda({
          playerPubkey: wallet.publicKey,
        });

        const exists = await connection.getAccountInfo(wagerPda);
        if (exists) throw new Error("Wager ID already exists");

        // ensure player's ATA
        const playerTokenAccount = await getAssociatedTokenAddress(
          OUTLAW_TOKEN_PUBLICKEY,
          wallet.publicKey,
        );

        // escrow vault for wager PDA
        const escrowVault = await getAssociatedTokenAddress(
          OUTLAW_TOKEN_PUBLICKEY,
          wagerPda,
          true,
        );

        const ix = await program.methods
          .createWager(wagerBn, amountBn)
          .accounts({
            player: wallet.publicKey,
            globalState: globalStatePda,
            wager: wagerPda,
            playerTracker: playerTrackerPda,
            playerTokenAccount,
            escrowVault,
            mint: OUTLAW_TOKEN_PUBLICKEY,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          })
          .instruction();

        const sig = await sendAndConfirm(wallet, connection, ix);
        await refreshGlobalState?.();
        return sig;
      } finally {
        setLoading(false);
      }
    },
    [wallet, connection, refreshGlobalState],
  );

  // ------------------------------------------------------------
  // Join Wager
  // ------------------------------------------------------------
  const joinWager = useCallback(
    async (wagerBn) => {
      if (!wallet.publicKey) throw new Error("Wallet not connected");
      setLoading(true);

      try {
        const program = await initializeOutlawGolfProgram({
          connection,
          wallet,
        });

        const [globalStatePda] = findGlobalStatePda();
        const [wagerPda] = findWagerPdaFromBn({ wagerBn });
        const [playerTrackerPda] = findTrackerPda({
          playerPubkey: wallet.publicKey,
        });

        const info = await connection.getAccountInfo(wagerPda);
        if (!info) throw new Error("Wager does not exist");

        const wager = await program.account.wager.fetch(wagerPda);

        if (wager.player1.equals(wallet.publicKey))
          throw new Error("Cannot join your own wager");

        if (wager.status.joined) throw new Error("Wager already joined");

        // ATAs
        const player2TokenAccount = await getAssociatedTokenAddress(
          OUTLAW_TOKEN_PUBLICKEY,
          wallet.publicKey,
        );
        const player1TokenAccount = await getAssociatedTokenAddress(
          OUTLAW_TOKEN_PUBLICKEY,
          wager.player1,
        );
        const escrowVault = await getAssociatedTokenAddress(
          OUTLAW_TOKEN_PUBLICKEY,
          wagerPda,
          true,
        );

        const ix = await program.methods
          .joinWager(wagerBn)
          .accounts({
            player: wallet.publicKey,
            globalState: globalStatePda,
            wager: wagerPda,
            playerTracker: playerTrackerPda,
            player1TokenAccount,
            player2TokenAccount,
            escrowVault,
            mint: OUTLAW_TOKEN_PUBLICKEY,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .instruction();

        const sig = await sendAndConfirm(wallet, connection, ix);
        await refreshGlobalState?.();
        return sig;
      } finally {
        setLoading(false);
      }
    },
    [wallet, connection, refreshGlobalState],
  );

  // ------------------------------------------------------------
  // Cancel Wager
  // ------------------------------------------------------------
  const cancelWager = useCallback(
    async (wagerBn) => {
      if (!wallet.publicKey) throw new Error("Wallet not connected");
      setLoading(true);

      try {
        const program = await initializeOutlawGolfProgram({
          connection,
          wallet,
        });

        const [globalStatePda] = findGlobalStatePda();
        const [wagerPda] = findWagerPdaFromBn({ wagerBn });
        const [playerTrackerPda] = findTrackerPda({
          playerPubkey: wallet.publicKey,
        });

        const info = await connection.getAccountInfo(wagerPda);
        if (!info) throw new Error("Wager does not exist");

        const wager = await program.account.wager.fetch(wagerPda);

        if (!wager.player1.equals(wallet.publicKey))
          throw new Error("Only creator may cancel");

        if (
          wager.status.cancelled ||
          wager.status.accepted ||
          wager.status.resolved
        )
          throw new Error("Wager cannot be canceled");

        const playerTokenAccount = await getAssociatedTokenAddress(
          OUTLAW_TOKEN_PUBLICKEY,
          wallet.publicKey,
        );
        const escrowVault = await getAssociatedTokenAddress(
          OUTLAW_TOKEN_PUBLICKEY,
          wagerPda,
          true,
        );

        const ix = await program.methods
          .cancelWager(wagerBn)
          .accounts({
            globalState: globalStatePda,
            player: wallet.publicKey,
            wager: wagerPda,
            playerTracker: playerTrackerPda,
            escrowVault,
            playerTokenAccount,
            mint: OUTLAW_TOKEN_PUBLICKEY,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .instruction();

        const sig = await sendAndConfirm(wallet, connection, ix);
        await refreshGlobalState?.();
        return sig;
      } finally {
        setLoading(false);
      }
    },
    [wallet, connection, refreshGlobalState],
  );

  // ------------------------------------------------------------
  // Settle Wager
  // ------------------------------------------------------------
  const settleWager = useCallback(
    async ({ wagerBn, winnerPubkey, referralPubkey }) => {
      if (!wallet.publicKey) throw new Error("Wallet not connected");
      setLoading(true);

      try {
        const program = await initializeOutlawGolfProgram({
          connection,
          wallet,
        });

        const [globalStatePda] = findGlobalStatePda();
        const globalState =
          await program.account.globalState.fetch(globalStatePda);

        if (!globalState.resolver.equals(wallet.publicKey))
          throw new Error("Only resolver may settle wagers");

        const [wagerPda] = findWagerPdaFromBn({ wagerBn });
        const wager = await program.account.wager.fetch(wagerPda);

        // trackers
        const [player1Tracker] = findTrackerPda({
          playerPubkey: wager.player1,
        });
        const [player2Tracker] = wager.player2
          ? findTrackerPda({ playerPubkey: wager.player2 })
          : [PublicKey.default];

        // ATAs
        const player1TokenAccount = await getAssociatedTokenAddress(
          OUTLAW_TOKEN_PUBLICKEY,
          wager.player1,
        );
        const player2TokenAccount = await getAssociatedTokenAddress(
          OUTLAW_TOKEN_PUBLICKEY,
          wager.player2,
        );
        const escrowVault = await getAssociatedTokenAddress(
          OUTLAW_TOKEN_PUBLICKEY,
          wagerPda,
          true,
        );

        const INCINERATOR_ADDRESS =
          "1nc1nerator11111111111111111111111111111111";
        const burnIsIncinerator =
          globalState.burnVault.toString() === INCINERATOR_ADDRESS;
        const burnVaultTokenAccount = await getAssociatedTokenAddress(
          OUTLAW_TOKEN_PUBLICKEY,
          globalState.burnVault,
          burnIsIncinerator,
        );

        let referralTokenAccount = burnVaultTokenAccount;
        if (referralPubkey) {
          const ata = await getAssociatedTokenAddress(
            OUTLAW_TOKEN_PUBLICKEY,
            referralPubkey,
          );
          const exists = await connection.getAccountInfo(ata);

          if (!exists) {
            const createIx = createAssociatedTokenAccountInstruction(
              wallet.publicKey,
              ata,
              referralPubkey,
              OUTLAW_TOKEN_PUBLICKEY,
            );
            referralTokenAccount = ata;

            await sendAndConfirm(wallet, connection, createIx);
          } else {
            referralTokenAccount = ata;
          }
        }

        // Instruction
        const ix = await program.methods
          .settleGame(wagerBn, winnerPubkey, referralPubkey)
          .accounts({
            resolver: wallet.publicKey,
            globalState: globalStatePda,
            wager: wagerPda,
            player1TokenAccount,
            player2TokenAccount,
            playerTracker: player1Tracker,
            player2Tracker,
            escrowVault,
            referralTokenAccount,
            burnVault: burnVaultTokenAccount,
            mint: OUTLAW_TOKEN_PUBLICKEY,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .instruction();

        const sig = await sendAndConfirm(wallet, connection, ix);
        await refreshGlobalState?.();
        return sig;
      } finally {
        setLoading(false);
      }
    },
    [wallet, connection, refreshGlobalState],
  );

  // ------------------------------------------------------------
  // Export API
  // ------------------------------------------------------------
  return useMemo(
    () => ({
      loading,
      fetchWager,
      fetchActiveWagersForWallet,
      createWager,
      joinWager,
      cancelWager,
      settleWager,
    }),
    [
      loading,
      fetchWager,
      fetchActiveWagersForWallet,
      createWager,
      joinWager,
      cancelWager,
      settleWager,
    ],
  );
}
