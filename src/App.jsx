import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { motion } from "framer-motion";
import Layout from "./components/layout/Layout";
import { findGlobalStatePda } from "./services/solana/pda.service";
import { initializeOutlawGolfProgram } from "./utils/anchorProgram";
import { TOKEN_DECIMALS_NUM } from "./utils/constants";
import { parseTokenAmountExact } from "./utils/formatters";
import useWager from "./hooks/useWager";
import useAdmin from "./hooks/useAdmin";
import useUnifiedWallet from "./hooks/useUnifiedWallet";
import { DashboardProvider } from "./contexts/DashboardContext";
import ConnectedDashboard from "./components/dashboard/ConnectedDashboard";

export default function App() {
  const { connection } = useConnection();
  const wallet = useUnifiedWallet();

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [globalStateInfo, setGlobalStateInfo] = useState(null);
  const [error, setError] = useState(null);

  const [wagerId, setWagerId] = useState("");
  const [wagerAmount, setWagerAmount] = useState("");
  const [wagerQueryId, setWagerQueryId] = useState("");
  const [wagerData, setWagerData] = useState(null);
  const [myActiveWagers, setMyActiveWagers] = useState([]);

  const [burnVaultAddress, setBurnVaultAddress] = useState("");
  const [newResolverAddress, setNewResolverAddress] = useState("");
  const [winnerAddress, setWinnerAddress] = useState("");
  const [referralAddress, setReferralAddress] = useState("");
  const [newAdminAddress, setNewAdminAddress] = useState("");
  const [winnerSharePercent, setWinnerSharePercent] = useState("");
  const [burnSharePercent, setBurnSharePercent] = useState("");
  const [referralSharePercent, setReferralSharePercent] = useState("");
  const [burnShareIfReferralPercent, setBurnShareIfReferralPercent] =
    useState("");

  const [activeTab, setActiveTab] = useState("user");
  const [validationErrors, setValidationErrors] = useState({});

  const [isAdmin, setIsAdmin] = useState(false);
  const [isResolver, setIsResolver] = useState(false);

  const walletPublicKey = wallet.publicKey;

  const fetchGlobalState = useCallback(async () => {
    if (!wallet.publicKey) return;
    try {
      setIsLoading(true);
      const program = await initializeOutlawGolfProgram({
        connection,
        wallet,
      });
      const [globalStatePda] = findGlobalStatePda();
      const state = await program.account.globalState.fetch(globalStatePda);
      setGlobalStateInfo(state);
      setIsInitialized(true);
      setIsAdmin(state.admin.equals(wallet.publicKey));
      setIsResolver(state.resolver.equals(wallet.publicKey));
    } catch {
      setGlobalStateInfo(null);
      setIsInitialized(false);
      setIsAdmin(false);
      setIsResolver(false);
    } finally {
      setIsLoading(false);
    }
  }, [wallet, connection]);

  const admin = useAdmin(wallet, connection, fetchGlobalState);
  const wager = useWager(wallet, connection, fetchGlobalState);

  const withToast = useCallback(async (fn, successMessage) => {
    try {
      setIsLoading(true);
      const res = await fn();
      if (successMessage) toast.success(successMessage);
      setError(null);
      return res;
    } catch (err) {
      const msg = (err && err.message) || String(err);
      toast.error(msg);
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const validateInput = useCallback((field, value, type) => {
    setValidationErrors((prev) => {
      const errors = { ...prev };
      if (type === "publicKey") {
        try {
          if (value && value.trim().length > 0) new PublicKey(value);
          delete errors[field];
        } catch {
          errors[field] = "Invalid public key";
        }
      } else if (field === "wagerId") {
        if (!value || value.toString().trim() === "")
          errors[field] = "Required";
        else delete errors[field];
      } else if (field === "wagerAmount") {
        if (!value || isNaN(Number(value)) || Number(value) <= 0) {
          errors[field] = "Enter positive number";
        } else {
          const amountText = String(value).trim();
          const [, fractional = ""] = amountText.split(".");
          if (fractional.length > TOKEN_DECIMALS_NUM) {
            errors[field] = `Max ${TOKEN_DECIMALS_NUM} decimal places`;
          } else {
            delete errors[field];
          }
        }
      } else {
        if (!value) errors[field] = "Required";
        else delete errors[field];
      }
      return errors;
    });
  }, []);

  useEffect(() => {
    if (walletPublicKey) {
      fetchGlobalState();
    } else {
      setIsInitialized(false);
      setGlobalStateInfo(null);
      setIsAdmin(false);
      setIsResolver(false);
    }
  }, [walletPublicKey, fetchGlobalState]);

  useEffect(() => {
    if (!walletPublicKey) {
      setMyActiveWagers([]);
      return;
    }

    (async () => {
      try {
        const list = await wager.fetchActiveWagersForWallet();
        setMyActiveWagers(list);
      } catch (err) {
        console.error("Failed to load active wagers for wallet", err);
      }
    })();
  }, [walletPublicKey, wager]);

  useEffect(() => {
    if (activeTab === "admin" && !isAdmin) setActiveTab("user");
    if (activeTab === "resolver" && !isResolver) setActiveTab("user");
  }, [activeTab, isAdmin, isResolver]);

  const handleFetchWagerData = useCallback(async () => {
    if (!wagerQueryId) {
      toast.warning("Enter Wager ID to query.");
      return;
    }
    try {
      setIsLoading(true);
      const wagerBn = new anchor.BN(wagerQueryId);
      const account = await wager.fetchWager(wagerBn);
      setWagerData(account);
      setError(null);
    } catch (err) {
      const msg = err?.message || "Failed to fetch wager";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [wagerQueryId, wager]);

  const handleCreateWager = useCallback(async () => {
    if (!wallet.publicKey) {
      toast.warn("Connect wallet");
      return;
    }
    if (!wagerId || !wagerAmount) {
      toast.warn("Enter wager id and amount");
      return;
    }
    let wagerBn;
    try {
      wagerBn = new anchor.BN(wagerId);
    } catch {
      toast.error("Invalid Wager ID");
      return;
    }
    let amountBn;
    try {
      const parsedAmount = parseTokenAmountExact(wagerAmount);
      amountBn = new anchor.BN(parsedAmount);
      if (amountBn.lte(new anchor.BN(0))) {
        toast.error("Wager amount must be greater than 0.");
        return;
      }
    } catch {
      toast.error(
        `Invalid amount. Use up to ${TOKEN_DECIMALS_NUM} decimal places and a value greater than 0.`,
      );
      return;
    }
    try {
      setIsLoading(true);
      await wager.createWager(wagerBn, amountBn);
      toast.success("Wager created");
      setWagerId("");
      setWagerAmount("");
    } catch (err) {
      console.error("Failed to create wager", err);
      toast.error(err.message || "Failed to create wager");
    } finally {
      setIsLoading(false);
    }
  }, [wallet.publicKey, wagerId, wagerAmount, wager]);

  const handleJoinWager = useCallback(async () => {
    if (!wallet.publicKey) {
      toast.warn("Connect wallet");
      return;
    }
    if (!wagerId) {
      toast.warn("Enter Wager ID");
      return;
    }
    let wagerBn;
    try {
      wagerBn = new anchor.BN(wagerId);
    } catch {
      toast.error("Invalid Wager ID");
      return;
    }
    try {
      setIsLoading(true);
      await wager.joinWager(wagerBn);
      toast.success("Joined wager");
    } catch (err) {
      toast.error(err.message || "Failed to join wager");
    } finally {
      setIsLoading(false);
    }
  }, [wallet.publicKey, wagerId, wager]);

  const handleCancelWager = useCallback(async () => {
    if (!wallet.publicKey) {
      toast.warn("Connect wallet");
      return;
    }
    if (!wagerId) {
      toast.warn("Enter Wager ID");
      return;
    }
    let wagerBn;
    try {
      wagerBn = new anchor.BN(wagerId);
    } catch {
      toast.error("Invalid Wager ID");
      return;
    }
    try {
      setIsLoading(true);
      await wager.cancelWager(wagerBn);
      toast.success("Wager cancelled");
    } catch (err) {
      toast.error(err.message || "Failed to cancel wager");
    } finally {
      setIsLoading(false);
    }
  }, [wallet.publicKey, wagerId, wager]);

  const handleSettleWager = useCallback(async () => {
    if (!wallet.publicKey) {
      toast.warn("Connect wallet");
      return;
    }
    if (!wagerId) {
      toast.warn("Enter Wager ID");
      return;
    }
    const wagerBn = new anchor.BN(wagerId);
    const winnerPubkey = winnerAddress
      ? new PublicKey(winnerAddress.trim())
      : null;
    const referralPubkey = referralAddress
      ? new PublicKey(referralAddress.trim())
      : null;

    try {
      setIsLoading(true);
      await wager.settleWager({ wagerBn, winnerPubkey, referralPubkey });
      toast.success("Wager settled");
      setWagerId("");
      setWinnerAddress("");
      setReferralAddress("");
    } catch (err) {
      toast.error(err.message || "Failed to settle wager");
    } finally {
      setIsLoading(false);
    }
  }, [wallet.publicKey, wagerId, winnerAddress, referralAddress, wager]);

  const handleTogglePause = useCallback(async () => {
    await admin.togglePause();
    await fetchGlobalState();
  }, [admin, fetchGlobalState]);

  const handleSetBurnVault = useCallback(async () => {
    if (!burnVaultAddress) {
      toast.warn("Enter burn vault address");
      return;
    }
    try {
      const pk = new PublicKey(burnVaultAddress.trim());
      await admin.setBurnVault(pk);
      setBurnVaultAddress("");
      await fetchGlobalState();
    } catch (err) {
      toast.error(err.message || "Failed to set burn vault");
    }
  }, [burnVaultAddress, admin, fetchGlobalState]);

  const handleSetResolver = useCallback(async () => {
    if (!newResolverAddress) {
      toast.warn("Enter resolver address");
      return;
    }
    try {
      const pk = new PublicKey(newResolverAddress.trim());
      await admin.setResolver(pk);
      setNewResolverAddress("");
      await fetchGlobalState();
    } catch (err) {
      toast.error(err.message || "Failed to set resolver");
    }
  }, [newResolverAddress, admin, fetchGlobalState]);

  const handleSetDistributionBps = useCallback(async () => {
    const winner = parseFloat(winnerSharePercent);
    const burn = parseFloat(burnSharePercent);
    if (isNaN(winner) || isNaN(burn) || winner + burn !== 100) {
      toast.warn("Winner + Burn must equal 100%");
      return;
    }
    const winnerBps = Math.round(winner * 100);
    const burnBps = Math.round(burn * 100);
    try {
      await admin.setDistributionBps(winnerBps, burnBps);
      setWinnerSharePercent("");
      setBurnSharePercent("");
      await fetchGlobalState();
    } catch (err) {
      toast.error(err.message || "Failed to set distribution");
    }
  }, [winnerSharePercent, burnSharePercent, admin, fetchGlobalState]);

  const handleSetReferralRatios = useCallback(async () => {
    const referral = parseInt(referralSharePercent, 10);
    const burnIfRef = parseInt(burnShareIfReferralPercent, 10);
    if (
      isNaN(referral) ||
      isNaN(burnIfRef) ||
      referral + burnIfRef !== 100
    ) {
      toast.warn("Referral + Burn(if referral) must equal 100%");
      return;
    }
    const referralBps = referral * 100;
    const burnBps = burnIfRef * 100;
    try {
      await admin.setReferralDistributionRatios(referralBps, burnBps);
      setReferralSharePercent("");
      setBurnShareIfReferralPercent("");
      await fetchGlobalState();
    } catch (err) {
      toast.error(err.message || "Failed to set referral ratios");
    }
  }, [
    referralSharePercent,
    burnShareIfReferralPercent,
    admin,
    fetchGlobalState,
  ]);

  const handleSetAdmin = useCallback(async () => {
    if (!newAdminAddress) {
      toast.warn("Enter new admin");
      return;
    }
    try {
      const pk = new PublicKey(newAdminAddress);
      await admin.setAdmin(pk);
      setNewAdminAddress("");
      await fetchGlobalState();
    } catch (err) {
      toast.error(err.message || "Failed to set admin");
    }
  }, [newAdminAddress, admin, fetchGlobalState]);

  const handleEmergencyWithdraw = useCallback(async () => {
    if (!wagerId) {
      toast.warn("Enter wager id");
      return;
    }
    try {
      await admin.emergencyWithdraw(wagerId);
      toast.success("Emergency withdraw done");
    } catch (err) {
      toast.error(err.message || "Failed emergency withdraw");
    }
  }, [wagerId, admin]);

  const handleInitializeProgram = useCallback(async () => {
    if (!wallet.publicKey) {
      toast.warn("Connect wallet");
      return;
    }
    try {
      setIsLoading(true);
      const program = await initializeOutlawGolfProgram({
        connection,
        wallet,
      });
      const [globalStatePda] = findGlobalStatePda();
      await program.methods
        .initialize()
        .accounts({
          globalState: globalStatePda,
          payer: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      toast.success("Program initialized");
      await fetchGlobalState();
    } catch (err) {
      toast.error(err.message || "Init failed");
    } finally {
      setIsLoading(false);
    }
  }, [wallet, connection, fetchGlobalState]);

  const withToastAction = useCallback(
    (fn, successMessage) => () => withToast(fn, successMessage),
    [withToast],
  );

  const dashboardValue = useMemo(
    () => ({
      wallet,
      connection,
      isLoading,
      error,
      globalStateInfo,
      isInitialized,
      isAdmin,
      isResolver,
      activeTab,
      setActiveTab,
      myActiveWagers,
      wagerQueryId,
      setWagerQueryId,
      wagerData,
      wagerId,
      setWagerId,
      wagerAmount,
      setWagerAmount,
      validationErrors,
      validateInput,
      burnVaultAddress,
      setBurnVaultAddress,
      newResolverAddress,
      setNewResolverAddress,
      winnerAddress,
      setWinnerAddress,
      referralAddress,
      setReferralAddress,
      newAdminAddress,
      setNewAdminAddress,
      winnerSharePercent,
      setWinnerSharePercent,
      burnSharePercent,
      setBurnSharePercent,
      referralSharePercent,
      setReferralSharePercent,
      burnShareIfReferralPercent,
      setBurnShareIfReferralPercent,
      withToast,
      withToastAction,
      fetchGlobalState,
      handleFetchWagerData,
      handleCreateWager,
      handleJoinWager,
      handleCancelWager,
      handleSettleWager,
      handleTogglePause,
      handleSetBurnVault,
      handleSetResolver,
      handleSetDistributionBps,
      handleSetReferralRatios,
      handleSetAdmin,
      handleEmergencyWithdraw,
      handleInitializeProgram,
    }),
    [
      wallet,
      connection,
      isLoading,
      error,
      globalStateInfo,
      isInitialized,
      isAdmin,
      isResolver,
      activeTab,
      myActiveWagers,
      wagerQueryId,
      wagerData,
      wagerId,
      wagerAmount,
      validationErrors,
      burnVaultAddress,
      newResolverAddress,
      winnerAddress,
      referralAddress,
      newAdminAddress,
      winnerSharePercent,
      burnSharePercent,
      referralSharePercent,
      burnShareIfReferralPercent,
      fetchGlobalState,
      handleFetchWagerData,
      handleCreateWager,
      handleJoinWager,
      handleCancelWager,
      handleSettleWager,
      handleTogglePause,
      handleSetBurnVault,
      handleSetResolver,
      handleSetDistributionBps,
      handleSetReferralRatios,
      handleSetAdmin,
      handleEmergencyWithdraw,
      handleInitializeProgram,
      withToast,
      validateInput,
      withToastAction,
    ],
  );

  return (
    <Layout>
      {wallet.publicKey ? (
        <DashboardProvider value={dashboardValue}>
          <ConnectedDashboard />
        </DashboardProvider>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="card text-center max-w-md mx-auto py-10"
        >
          <p className="text-4xl mb-4" aria-hidden>
            🔌
          </p>
          <p className="empty-state-title mb-3">Connect your wallet</p>
          <p className="text-sm text-zinc-500 leading-relaxed px-2">
            Use the button above to link a Solana wallet and access the arena.
          </p>
        </motion.div>
      )}
    </Layout>
  );
}
