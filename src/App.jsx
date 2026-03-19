import React, { useState, useEffect, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./components/layout/Layout";
import { findGlobalStatePda } from "./services/solana/pda.service";
import useWager from "./hooks/useWager";
import useAdmin from "./hooks/useAdmin";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

export default function App() {
  const { connection } = useConnection();
  const wallet = useWallet();

  // global UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [globalStateInfo, setGlobalStateInfo] = useState(null);
  const [error, setError] = useState(null);

  // form state
  const [wagerId, setWagerId] = useState("");
  const [wagerAmount, setWagerAmount] = useState("");
  const [wagerQueryId, setWagerQueryId] = useState("");
  const [wagerData, setWagerData] = useState(null);
  // const [myActiveWagers, setMyActiveWagers] = useState([]);

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

  // roles
  const [isAdmin, setIsAdmin] = useState(false);
  const [isResolver, setIsResolver] = useState(false);

  // hooks
  const admin = useAdmin(wallet, connection, async () => fetchGlobalState()); // object of admin functions
  const wager = useWager(wallet, connection, async () => fetchGlobalState()); // object of wager functions

  // small helper: display success/failure as toast and update errors
  const withToast = async (fn, successMessage) => {
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
  };

  // validate minimal inputs
  const validateInput = (field, value, type) => {
    const errors = { ...validationErrors };
    if (type === "publicKey") {
      try {
        // empty allowed for optional fields
        if (value && value.trim().length > 0) new PublicKey(value);
        delete errors[field];
      } catch {
        errors[field] = "Invalid public key";
      }
    } else if (field === "wagerId") {
      if (!value || value.toString().trim() === "") errors[field] = "Required";
      else delete errors[field];
    } else if (field === "wagerAmount") {
      if (!value || isNaN(Number(value)) || Number(value) <= 0)
        errors[field] = "Enter positive number";
      else delete errors[field];
    } else {
      if (!value) errors[field] = "Required";
      else delete errors[field];
    }
    setValidationErrors(errors);
  };

  // fetch and set global state info to drive UI
  const fetchGlobalState = useCallback(async () => {
    if (!wallet.publicKey) return;
    try {
      setIsLoading(true);
      const program = await import("./utils/anchorProgram").then((m) =>
        m.initializeOutlawGolfProgram({ connection, wallet })
      );
      const [globalStatePda] = findGlobalStatePda();
      const state = await program.account.globalState.fetch(globalStatePda);
      setGlobalStateInfo(state);
      setIsInitialized(true);
      setIsPaused(Boolean(state.isPaused));
      setIsAdmin(state.admin.equals(wallet.publicKey));
      setIsResolver(state.resolver.equals(wallet.publicKey));
    } catch (err) {
      setGlobalStateInfo(null);
      setIsInitialized(false);
      setIsAdmin(false);
      setIsResolver(false);
    } finally {
      setIsLoading(false);
    }
  }, [wallet, connection]);

  useEffect(() => {
    if (wallet.publicKey) {
      fetchGlobalState();
    } else {
      setIsInitialized(false);
      setGlobalStateInfo(null);
      setIsAdmin(false);
      setIsResolver(false);
    }
  }, [wallet.publicKey, fetchGlobalState]);

  // Load active wagers for the connected wallet
  // useEffect(() => {
  //   if (!wallet.publicKey) {
  //     setMyActiveWagers([]);
  //     return;
  //   }

  //   (async () => {
  //     try {
  //       const list = await wager.fetchActiveWagersForWallet();
  //       setMyActiveWagers(list);
  //     } catch (err) {
  //       console.error("Failed to load active wagers for wallet", err);
  //     }
  //   })();
  // }, [wallet.publicKey, wager]);

  // ---------------- Handlers (wired to hooks) ----------------
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
      toast.success("Wager data fetched");
    } catch (err) {
      const msg = err?.message || "Failed to fetch wager";
      setError(msg);
      toast.error(msg);
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
    let wagerBn, amountBn;
    try {
      wagerBn = new anchor.BN(wagerId);
    } catch {
      toast.error("Invalid Wager ID");
      return;
    }
    try {
      // 9 decimals
      amountBn = new anchor.BN(Math.floor(parseFloat(wagerAmount) * 1e6));
    } catch {
      toast.error("Invalid amount");
      return;
    }
    try {
      setIsLoading(true);
      await wager.createWager(wagerBn, amountBn);
      toast.success("Wager created");
      setWagerId("");
      setWagerAmount("");
    } catch (err) {
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

  // Admin operations mapped to admin hook
  const handleTogglePause = useCallback(async () => {
    try {
      await admin.togglePause();
      await fetchGlobalState();
    } catch (err) {
      // error handled inside hook
    }
  }, [admin, fetchGlobalState]);

  const setBurnVault = useCallback(async () => {
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
    const referral = parseInt(referralSharePercent);
    const burnIfRef = parseInt(burnShareIfReferralPercent);
    if (isNaN(referral) || isNaN(burnIfRef) || referral + burnIfRef !== 100) {
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

  // tiny helper to call check global state with toast from UI
  const withToastAction = (fn, successMessage) => () =>
    withToast(fn, successMessage);

  // Render the big UI you provided inside Layout
  return (
    <Layout>
      {wallet.publicKey ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          {/* Wallet Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card mb-6"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">
                  Connected Wallet
                </p>
                <p className="font-mono text-sm text-purple-300 break-all">
                  {wallet.publicKey.toBase58()}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => wallet.disconnect()}
                className="btn-danger whitespace-nowrap"
              >
                Disconnect
              </motion.button>
            </div>
          </motion.div>

          {isInitialized ? (
            <div className="space-y-8">
              {/* Global State Info */}
              {globalStateInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="card mb-8"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="section-title text-2xl">Global State</h2>
                    <span
                      className={`status-badge ${
                        globalStateInfo.isPaused
                          ? "status-paused"
                          : "status-active"
                      }`}
                    >
                      {globalStateInfo.isPaused ? "⏸ PAUSED" : "▶ ACTIVE"}
                    </span>
                  </div>

                  <div className="data-grid mb-6">
                    <div className="data-item">
                      <div className="data-label">Admin</div>
                      <div className="data-value text-purple-300">
                        {globalStateInfo.admin.toBase58()}
                      </div>
                    </div>
                    <div className="data-item">
                      <div className="data-label">Burn Vault</div>
                      <div className="data-value">
                        {globalStateInfo.burnVault.toBase58()}
                      </div>
                    </div>
                    <div className="data-item">
                      <div className="data-label">Resolver</div>
                      <div className="data-value">
                        {globalStateInfo.resolver.toBase58()}
                      </div>
                    </div>
                    <div className="data-item">
                      <div className="data-label">Total Wagers</div>
                      <div className="data-value text-green-400 font-bold">
                        {globalStateInfo.totalWagers.toString()}
                      </div>
                    </div>
                    <div className="data-item">
                      <div className="data-label">Total Volume</div>
                      <div className="data-value text-green-400 font-bold">
                        {(globalStateInfo.totalVolume / 1e6).toFixed(6)} OUTLAW
                      </div>
                    </div>
                    <div className="data-item">
                      <div className="data-label">Winner Share</div>
                      <div className="data-value">
                        {globalStateInfo.winnerShareBps} BPS
                      </div>
                    </div>
                    <div className="data-item">
                      <div className="data-label">Burn Share</div>
                      <div className="data-value">
                        {globalStateInfo.burnShareBps} BPS
                      </div>
                    </div>
                    <div className="data-item">
                      <div className="data-label">Status</div>
                      <div className="data-value">
                        <span
                          className={`status-badge ${
                            globalStateInfo.isPaused
                              ? "status-paused"
                              : "status-active"
                          }`}
                        >
                          {globalStateInfo.isPaused ? "Paused" : "Active"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={withToastAction(
                      fetchGlobalState,
                      "Global state refreshed!"
                    )}
                    disabled={isLoading}
                    className="btn-primary w-full"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="spinner"></span>
                        Refreshing...
                      </span>
                    ) : (
                      "🔄 Refresh Global State"
                    )}
                  </motion.button>
                </motion.div>
              )}

              <div className="card">
                {/* Tabs */}
                <div className="flex border-b border-gray-700/50 mb-6 -mx-6 px-6">
                  <button
                    className={`tab-button ${
                      activeTab === "user"
                        ? "tab-button-active"
                        : "tab-button-inactive"
                    }`}
                    onClick={() => setActiveTab("user")}
                  >
                    <span className="relative">
                      👤 User Actions
                      {activeTab === "user" && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-purple-500 to-green-500"
                          transition={{
                            type: "spring",
                            bounce: 0.2,
                            duration: 0.6,
                          }}
                        />
                      )}
                    </span>
                  </button>
                  {isAdmin && (
                    <button
                      className={`tab-button ${
                        activeTab === "admin"
                          ? "tab-button-active"
                          : "tab-button-inactive"
                      }`}
                      onClick={() => setActiveTab("admin")}
                    >
                      <span className="relative">
                        ⚙️ Admin Actions
                        {activeTab === "admin" && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-purple-500 to-green-500"
                            transition={{
                              type: "spring",
                              bounce: 0.2,
                              duration: 0.6,
                            }}
                          />
                        )}
                      </span>
                    </button>
                  )}
                  {isResolver && (
                    <button
                      className={`tab-button ${
                        activeTab === "resolver"
                          ? "tab-button-active"
                          : "tab-button-inactive"
                      }`}
                      onClick={() => setActiveTab("resolver")}
                    >
                      <span className="relative">
                        🎯 Resolver Actions
                        {activeTab === "resolver" && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-purple-500 to-green-500"
                            transition={{
                              type: "spring",
                              bounce: 0.2,
                              duration: 0.6,
                            }}
                          />
                        )}
                      </span>
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {/* USER TAB */}
                  {activeTab === "user" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      {/* Active wagers for connected wallet */}
                      {/* {myActiveWagers.length > 0 && (
                        <div className="space-y-4">
                          <h2 className="text-xl font-semibold text-purple-300 flex items-center gap-2">
                            🏌️ My Active Wagers
                          </h2>
                          <div className="space-y-3">
                            {myActiveWagers.map(({ publicKey, account }) => (
                              <div
                                key={publicKey.toBase58()}
                                className="p-4 rounded-xl bg-gray-800/60 border border-gray-700/60"
                              >
                                <div className="data-grid">
                                  <div className="data-item">
                                    <div className="data-label">Wager ID</div>
                                    <div className="data-value font-bold">
                                      {account.wagerId.toString()}
                                    </div>
                                  </div>
                                  <div className="data-item">
                                    <div className="data-label">Amount</div>
                                    <div className="data-value text-green-400 font-bold">
                                      {(account.amount / 1e6).toFixed(6)} OUTLAW
                                    </div>
                                  </div>
                                  <div className="data-item">
                                    <div className="data-label">Status</div>
                                    <div className="data-value">
                                      {account.status
                                        ? JSON.stringify(account.status)
                                        : "Unknown"}
                                    </div>
                                  </div>
                                  <div className="data-item">
                                    <div className="data-label">Role</div>
                                    <div className="data-value">
                                      {account.player1?.equals(wallet.publicKey)
                                        ? "Creator (Player 1)"
                                        : "Opponent (Player 2)"}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )} */}

                      {/* Query Wager */}
                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-purple-300 flex items-center gap-2">
                          🔍 Query Wager
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1">
                            <label className="input-label">Wager ID</label>
                            <input
                              type="number"
                              placeholder="Enter wager ID"
                              value={wagerQueryId}
                              onChange={(e) => {
                                setWagerQueryId(e.target.value);
                                validateInput("wagerQueryId", e.target.value);
                              }}
                              className={`input-field ${
                                validationErrors.wagerQueryId
                                  ? "border-red-500/50 focus:ring-red-500/50"
                                  : ""
                              }`}
                            />
                            {validationErrors.wagerQueryId && (
                              <p className="text-red-400 text-xs mt-1">
                                {validationErrors.wagerQueryId}
                              </p>
                            )}
                          </div>
                          <div className="flex items-end">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() =>
                                withToast(handleFetchWagerData, "Wager fetched")
                              }
                              disabled={
                                isLoading ||
                                validationErrors.wagerQueryId ||
                                !wagerQueryId
                              }
                              className="btn-primary whitespace-nowrap"
                            >
                              {isLoading ? (
                                <span className="flex items-center gap-2">
                                  <span className="spinner"></span>
                                  Loading...
                                </span>
                              ) : (
                                "Fetch Wager"
                              )}
                            </motion.button>
                          </div>
                        </div>

                        {wagerData && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-4 p-5 bg-gray-700/50 border border-gray-600/50 rounded-xl"
                          >
                            <h3 className="text-lg font-semibold text-purple-300 mb-4">
                              Wager Details
                            </h3>
                            <div className="data-grid">
                              <div className="data-item">
                                <div className="data-label">Wager ID</div>
                                <div className="data-value font-bold">
                                  {wagerData.wagerId.toString()}
                                </div>
                              </div>
                              <div className="data-item">
                                <div className="data-label">Status</div>
                                <div className="data-value">
                                  {wagerData.status
                                    ? JSON.stringify(wagerData.status)
                                    : "Unknown"}
                                </div>
                              </div>
                              <div className="data-item">
                                <div className="data-label">Player 1</div>
                                <div className="data-value text-purple-300">
                                  {wagerData.player1.toBase58()}
                                </div>
                              </div>
                              <div className="data-item">
                                <div className="data-label">Player 2</div>
                                <div className="data-value text-green-300">
                                  {wagerData.player2
                                    ? wagerData.player2.toBase58()
                                    : "Waiting..."}
                                </div>
                              </div>
                              <div className="data-item">
                                <div className="data-label">Amount</div>
                                <div className="data-value text-green-400 font-bold">
                                  {(wagerData.amount / 1e6).toFixed(6)} OUTLAW
                                </div>
                              </div>
                              <div className="data-item">
                                <div className="data-label">Total Pot</div>
                                <div className="data-value text-green-400 font-bold">
                                  {(wagerData.totalPot / 1e6).toFixed(6)} OUTLAW
                                </div>
                              </div>
                              <div className="data-item col-span-1 sm:col-span-2">
                                <div className="data-label">Created At</div>
                                <div className="data-value">
                                  {new Date(
                                    wagerData.createdAt * 1000
                                  ).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* Create Wager */}
                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-purple-300 flex items-center gap-2">
                          ➕ Create Wager
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1">
                            <label className="input-label">Wager ID</label>
                            <input
                              type="number"
                              placeholder="Enter unique wager ID"
                              value={wagerId}
                              onChange={(e) => {
                                setWagerId(e.target.value);
                                validateInput("wagerId", e.target.value);
                              }}
                              className={`input-field ${
                                validationErrors.wagerId
                                  ? "border-red-500/50 focus:ring-red-500/50"
                                  : ""
                              }`}
                            />
                            {validationErrors.wagerId && (
                              <p className="text-red-400 text-xs mt-1">
                                {validationErrors.wagerId}
                              </p>
                            )}
                          </div>
                          <div className="flex-1">
                            <label className="input-label">
                              Amount (OUTLAW)
                            </label>
                            <input
                              type="number"
                              step="0.000000001"
                              placeholder="Enter wager amount"
                              value={wagerAmount}
                              onChange={(e) => {
                                setWagerAmount(e.target.value);
                                validateInput("wagerAmount", e.target.value);
                              }}
                              className={`input-field ${
                                validationErrors.wagerAmount
                                  ? "border-red-500/50 focus:ring-red-500/50"
                                  : ""
                              }`}
                            />
                            {validationErrors.wagerAmount && (
                              <p className="text-red-400 text-xs mt-1">
                                {validationErrors.wagerAmount}
                              </p>
                            )}
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            withToast(
                              handleCreateWager,
                              "Wager created successfully!"
                            )
                          }
                          disabled={
                            isLoading ||
                            validationErrors.wagerId ||
                            validationErrors.wagerAmount ||
                            !wagerId ||
                            !wagerAmount
                          }
                          className="btn-primary w-full"
                        >
                          {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="spinner"></span>
                              Processing...
                            </span>
                          ) : (
                            "✨ Create Wager"
                          )}
                        </motion.button>
                      </div>

                      {/* Join Wager */}
                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-purple-300 flex items-center gap-2">
                          🤝 Join Wager
                        </h2>
                        <div>
                          <label className="input-label">Wager ID</label>
                          <input
                            type="number"
                            placeholder="Enter wager ID to join"
                            value={wagerId}
                            onChange={(e) => {
                              setWagerId(e.target.value);
                              validateInput("wagerId", e.target.value);
                            }}
                            className={`input-field ${
                              validationErrors.wagerId
                                ? "border-red-500/50 focus:ring-red-500/50"
                                : ""
                            }`}
                          />
                          {validationErrors.wagerId && (
                            <p className="text-red-400 text-xs mt-1">
                              {validationErrors.wagerId}
                            </p>
                          )}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            withToast(
                              handleJoinWager,
                              "Joined wager successfully!"
                            )
                          }
                          disabled={
                            isLoading || validationErrors.wagerId || !wagerId
                          }
                          className="btn-primary w-full"
                        >
                          {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="spinner"></span>
                              Processing...
                            </span>
                          ) : (
                            "🚀 Join Wager"
                          )}
                        </motion.button>
                      </div>

                      {/* Cancel Wager */}
                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-purple-300 flex items-center gap-2">
                          ❌ Cancel Wager
                        </h2>
                        <div>
                          <label className="input-label">Wager ID</label>
                          <input
                            type="number"
                            placeholder="Enter wager ID to cancel"
                            value={wagerId}
                            onChange={(e) => {
                              setWagerId(e.target.value);
                              validateInput("wagerId", e.target.value);
                            }}
                            className={`input-field ${
                              validationErrors.wagerId
                                ? "border-red-500/50 focus:ring-red-500/50"
                                : ""
                            }`}
                          />
                          {validationErrors.wagerId && (
                            <p className="text-red-400 text-xs mt-1">
                              {validationErrors.wagerId}
                            </p>
                          )}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            withToast(
                              handleCancelWager,
                              "Wager cancelled successfully!"
                            )
                          }
                          disabled={
                            isLoading || validationErrors.wagerId || !wagerId
                          }
                          className="btn-danger w-full"
                        >
                          {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="spinner"></span>
                              Processing...
                            </span>
                          ) : (
                            "🗑️ Cancel Wager"
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* ADMIN TAB */}
                  {activeTab === "admin" && isAdmin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      {/* Pause / Unpause Contract */}
                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-purple-300 flex items-center gap-2">
                          ⏸️ Pause/Unpause Contract
                        </h2>
                        <div
                          className={`p-4 rounded-xl border-2 ${
                            globalStateInfo?.isPaused
                              ? "bg-red-500/10 border-red-500/30"
                              : "bg-green-500/10 border-green-500/30"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-300">
                              Contract Status:
                            </span>
                            <span
                              className={`status-badge ${
                                globalStateInfo?.isPaused
                                  ? "status-paused"
                                  : "status-active"
                              }`}
                            >
                              {globalStateInfo?.isPaused
                                ? "⏸ PAUSED"
                                : "▶ ACTIVE"}
                            </span>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            withToast(
                              handleTogglePause,
                              globalStateInfo?.isPaused
                                ? "Contract unpaused!"
                                : "Contract paused!"
                            )
                          }
                          disabled={isLoading}
                          className={`w-full ${
                            globalStateInfo?.isPaused
                              ? "btn-primary"
                              : "btn-danger"
                          }`}
                        >
                          {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="spinner"></span>
                              Processing...
                            </span>
                          ) : globalStateInfo?.isPaused ? (
                            "▶️ Unpause Contract"
                          ) : (
                            "⏸️ Pause Contract"
                          )}
                        </motion.button>
                      </div>

                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-purple-300 flex items-center gap-2">
                          🔥 Set Burn Vault
                        </h2>
                        <div>
                          <label className="input-label">
                            Burn Vault Address
                          </label>
                          <input
                            type="text"
                            placeholder="Enter burn vault public key"
                            value={burnVaultAddress}
                            onChange={(e) => {
                              setBurnVaultAddress(e.target.value);
                            }}
                            className="input-field"
                          />
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            withToast(
                              setBurnVault,
                              "Burn vault set successfully!"
                            )
                          }
                          disabled={isLoading || !burnVaultAddress}
                          className="btn-primary w-full"
                        >
                          {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="spinner"></span>
                              Processing...
                            </span>
                          ) : (
                            "🔥 Set Burn Vault"
                          )}
                        </motion.button>
                      </div>

                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-purple-300 flex items-center gap-2">
                          🎯 Set Resolver
                        </h2>
                        <div>
                          <label className="input-label">
                            Resolver Address
                          </label>
                          <input
                            type="text"
                            placeholder="Enter resolver public key"
                            value={newResolverAddress}
                            onChange={(e) =>
                              setNewResolverAddress(e.target.value)
                            }
                            className="input-field"
                          />
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            withToast(
                              handleSetResolver,
                              "Resolver set successfully!"
                            )
                          }
                          disabled={isLoading || !newResolverAddress}
                          className="btn-primary w-full"
                        >
                          {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="spinner"></span>
                              Processing...
                            </span>
                          ) : (
                            "🎯 Set Resolver"
                          )}
                        </motion.button>
                      </div>

                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-purple-300 flex items-center gap-2">
                          📊 Set Distribution Share
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1">
                            <label className="input-label">
                              Winner Share (%)
                            </label>
                            <input
                              type="number"
                              placeholder="e.g., 80"
                              value={winnerSharePercent}
                              onChange={(e) =>
                                setWinnerSharePercent(e.target.value)
                              }
                              className="input-field"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="input-label">
                              Burn Share (%)
                            </label>
                            <input
                              type="number"
                              placeholder="e.g., 20"
                              value={burnSharePercent}
                              onChange={(e) =>
                                setBurnSharePercent(e.target.value)
                              }
                              className="input-field"
                            />
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 bg-gray-800/50 p-3 rounded-lg">
                          💡 Total must equal 100% (Winner + Burn = 100%)
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            withToast(
                              handleSetDistributionBps,
                              "Distribution updated!"
                            )
                          }
                          disabled={
                            isLoading ||
                            !winnerSharePercent ||
                            !burnSharePercent
                          }
                          className="btn-primary w-full"
                        >
                          {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="spinner"></span>
                              Processing...
                            </span>
                          ) : (
                            "📊 Set Distribution Share"
                          )}
                        </motion.button>
                      </div>

                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-purple-300 flex items-center gap-2">
                          🎁 Set Referral Ratios
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1">
                            <label className="input-label">
                              Referral Share (%)
                            </label>
                            <input
                              type="number"
                              placeholder="e.g., 10"
                              value={referralSharePercent}
                              onChange={(e) =>
                                setReferralSharePercent(e.target.value)
                              }
                              className="input-field"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="input-label">
                              Burn Share If Referral (%)
                            </label>
                            <input
                              type="number"
                              placeholder="e.g., 90"
                              value={burnShareIfReferralPercent}
                              onChange={(e) =>
                                setBurnShareIfReferralPercent(e.target.value)
                              }
                              className="input-field"
                            />
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 bg-gray-800/50 p-3 rounded-lg">
                          💡 Total must equal 100% (Referral + Burn = 100%)
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            withToast(
                              handleSetReferralRatios,
                              "Referral ratios updated!"
                            )
                          }
                          disabled={
                            isLoading ||
                            !referralSharePercent ||
                            !burnShareIfReferralPercent
                          }
                          className="btn-primary w-full"
                        >
                          {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="spinner"></span>
                              Processing...
                            </span>
                          ) : (
                            "🎁 Set Referral Ratios"
                          )}
                        </motion.button>
                      </div>

                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-purple-300 flex items-center gap-2">
                          👑 Set New Admin
                        </h2>
                        <div>
                          <label className="input-label">
                            New Admin Public Key
                          </label>
                          <input
                            type="text"
                            placeholder="Enter new admin public key"
                            value={newAdminAddress}
                            onChange={(e) => setNewAdminAddress(e.target.value)}
                            className="input-field"
                          />
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            withToast(handleSetAdmin, "New admin set!")
                          }
                          disabled={isLoading || !newAdminAddress}
                          className="btn-primary w-full"
                        >
                          {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="spinner"></span>
                              Processing...
                            </span>
                          ) : (
                            "👑 Set New Admin"
                          )}
                        </motion.button>
                      </div>

                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-red-400 flex items-center gap-2">
                          🚨 Emergency Withdraw
                        </h2>
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
                          <p className="text-xs text-red-400">
                            ⚠️ Warning: This is an emergency function. Use with
                            caution.
                          </p>
                        </div>
                        <div>
                          <label className="input-label">Wager ID</label>
                          <input
                            type="number"
                            placeholder="Enter wager ID"
                            value={wagerId}
                            onChange={(e) => setWagerId(e.target.value)}
                            className="input-field"
                          />
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            withToast(
                              handleEmergencyWithdraw,
                              "Emergency withdraw executed"
                            )
                          }
                          disabled={isLoading || !wagerId}
                          className="btn-danger w-full"
                        >
                          {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="spinner"></span>
                              Processing...
                            </span>
                          ) : (
                            "🚨 Emergency Withdraw"
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* RESOLVER TAB */}
                  {activeTab === "resolver" && isResolver && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-purple-300 flex items-center gap-2">
                          🏆 Settle Wager
                        </h2>
                        <div className="space-y-4">
                          <div>
                            <label className="input-label">Wager ID</label>
                            <input
                              type="number"
                              placeholder="Enter wager ID to settle"
                              value={wagerId}
                              onChange={(e) => setWagerId(e.target.value)}
                              className="input-field"
                            />
                          </div>
                          <div>
                            <label className="input-label">
                              Winner Address *
                            </label>
                            <input
                              type="text"
                              placeholder="Enter winner public key"
                              value={winnerAddress}
                              onChange={(e) => setWinnerAddress(e.target.value)}
                              className="input-field"
                            />
                          </div>
                          <div>
                            <label className="input-label">
                              Referral Address (Optional)
                            </label>
                            <input
                              type="text"
                              placeholder="Enter referral public key (optional)"
                              value={referralAddress}
                              onChange={(e) =>
                                setReferralAddress(e.target.value)
                              }
                              className="input-field"
                            />
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            withToast(handleSettleWager, "Wager settled")
                          }
                          disabled={isLoading || !wagerId || !winnerAddress}
                          className="btn-primary w-full"
                        >
                          {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="spinner"></span>
                              Processing...
                            </span>
                          ) : (
                            "🏆 Settle Wager"
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="card text-center"
            >
              <h2 className="text-2xl font-bold mb-4 text-purple-300">
                Initialize Program
              </h2>
              <p className="text-gray-400 mb-6 text-sm">
                The program needs to be initialized before you can use it.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  try {
                    await import("./utils/anchorProgram").then((m) =>
                      m.initializeOutlawGolfProgram({ connection, wallet })
                    );
                    toast.success("Program initialized");
                    await fetchGlobalState();
                  } catch (err) {
                    toast.error(err.message || "Init failed");
                  }
                }}
                disabled={isLoading}
                className="btn-primary w-full"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner"></span>
                    Initializing...
                  </span>
                ) : (
                  "🚀 Initialize Program"
                )}
              </motion.button>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
            >
              <p className="text-red-400 text-sm flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </p>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card text-center"
        >
          <p className="text-xl text-gray-400 mb-2">🔌 No Wallet Connected</p>
          <p className="text-sm text-gray-500">
            Please connect your wallet to get started
          </p>
        </motion.div>
      )}
    </Layout>
  );
}
