import { motion } from "framer-motion";
import { useDashboard } from "../../../contexts/DashboardContext";

export default function AdminTab() {
  const {
    globalStateInfo,
    isLoading,
    burnVaultAddress,
    setBurnVaultAddress,
    newResolverAddress,
    setNewResolverAddress,
    winnerSharePercent,
    setWinnerSharePercent,
    burnSharePercent,
    setBurnSharePercent,
    referralSharePercent,
    setReferralSharePercent,
    burnShareIfReferralPercent,
    setBurnShareIfReferralPercent,
    newAdminAddress,
    setNewAdminAddress,
    wagerId,
    setWagerId,
    withToast,
    handleTogglePause,
    handleSetBurnVault,
    handleSetResolver,
    handleSetDistributionBps,
    handleSetReferralRatios,
    handleSetAdmin,
    handleEmergencyWithdraw,
  } = useDashboard();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-0"
    >
      <div className="panel-section space-y-4">
        <h2 className="panel-heading border-0 mb-0 pb-0">
          <span aria-hidden>⏸️</span>
          Pause / unpause
        </h2>
        <div
          className={`rounded-xl border p-4 backdrop-blur-sm ${
            globalStateInfo?.isPaused
              ? "border-red-500/35 bg-linear-to-br from-red-950/40 to-zinc-950/60"
              : "border-emerald-500/30 bg-linear-to-br from-emerald-950/35 to-zinc-950/60"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-zinc-400">
              Contract status
            </span>
            <span
              className={`status-badge ${
                globalStateInfo?.isPaused ? "status-paused" : "status-active"
              }`}
            >
              {globalStateInfo?.isPaused ? "⏸ PAUSED" : "▶ ACTIVE"}
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
                : "Contract paused!",
            )
          }
          disabled={isLoading}
          className={`w-full ${
            globalStateInfo?.isPaused ? "btn-primary" : "btn-danger"
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

      <div className="panel-section space-y-4">
        <h2 className="panel-heading border-0 mb-0 pb-0">
          <span aria-hidden>🔥</span>
          Burn vault
        </h2>
        <div className="pt-1">
          <label className="input-label">Burn Vault Address</label>
          <input
            type="text"
            placeholder="Enter burn vault public key"
            value={burnVaultAddress}
            onChange={(e) => setBurnVaultAddress(e.target.value)}
            className="input-field"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() =>
            withToast(handleSetBurnVault, "Burn vault set successfully!")
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

      <div className="panel-section space-y-4">
        <h2 className="panel-heading border-0 mb-0 pb-0">
          <span aria-hidden>🎯</span>
          Resolver
        </h2>
        <div className="pt-1">
          <label className="input-label">Resolver Address</label>
          <input
            type="text"
            placeholder="Enter resolver public key"
            value={newResolverAddress}
            onChange={(e) => setNewResolverAddress(e.target.value)}
            className="input-field"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() =>
            withToast(handleSetResolver, "Resolver set successfully!")
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

      <div className="panel-section space-y-4">
        <h2 className="panel-heading border-0 mb-0 pb-0">
          <span aria-hidden>📊</span>
          Distribution share
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 pt-1">
          <div className="flex-1">
            <label className="input-label">Winner Share (%)</label>
            <input
              type="number"
              placeholder="e.g., 80"
              value={winnerSharePercent}
              onChange={(e) => setWinnerSharePercent(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex-1">
            <label className="input-label">Burn Share (%)</label>
            <input
              type="number"
              placeholder="e.g., 20"
              value={burnSharePercent}
              onChange={(e) => setBurnSharePercent(e.target.value)}
              className="input-field"
            />
          </div>
        </div>
        <div className="hint-box">
          <span className="text-violet-400/90 mr-1">💡</span>
          Total must equal 100% (winner + burn = 100%).
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() =>
            withToast(handleSetDistributionBps, "Distribution updated!")
          }
          disabled={
            isLoading || !winnerSharePercent || !burnSharePercent
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

      <div className="panel-section space-y-4">
        <h2 className="panel-heading border-0 mb-0 pb-0">
          <span aria-hidden>🎁</span>
          Referral ratios
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 pt-1">
          <div className="flex-1">
            <label className="input-label">Referral Share (%)</label>
            <input
              type="number"
              placeholder="e.g., 10"
              value={referralSharePercent}
              onChange={(e) => setReferralSharePercent(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex-1">
            <label className="input-label">Burn Share If Referral (%)</label>
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
        <div className="hint-box">
          <span className="text-violet-400/90 mr-1">💡</span>
          Total must equal 100% (referral + burn if referral = 100%).
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() =>
            withToast(handleSetReferralRatios, "Referral ratios updated!")
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

      <div className="panel-section space-y-4">
        <h2 className="panel-heading border-0 mb-0 pb-0">
          <span aria-hidden>👑</span>
          New admin
        </h2>
        <div className="pt-1">
          <label className="input-label">New Admin Public Key</label>
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
          onClick={() => withToast(handleSetAdmin, "New admin set!")}
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

      <div className="panel-section space-y-4 border-b-0!">
        <h2 className="panel-heading panel-heading--danger border-0 mb-0 pb-0">
          <span aria-hidden>🚨</span>
          Emergency withdraw
        </h2>
        <div className="hint-box hint-box--warn mb-1">
          <strong className="font-semibold text-red-200">Warning.</strong>{" "}
          Emergency-only; use with extreme caution.
        </div>
        <div className="pt-1">
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
              "Emergency withdraw executed",
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
  );
}
