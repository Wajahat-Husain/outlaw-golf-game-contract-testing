import { motion } from "framer-motion";
import { useDashboard } from "../../contexts/DashboardContext";
import { formatTokenAmount } from "../../utils/formatters";

export default function GlobalStateSection() {
  const {
    globalStateInfo,
    isLoading,
    withToastAction,
    fetchGlobalState,
  } = useDashboard();

  if (!globalStateInfo) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card mb-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="section-title mb-0!">Global state</h2>
        <span
          className={`status-badge ${
            globalStateInfo.isPaused ? "status-paused" : "status-active"
          }`}
        >
          {globalStateInfo.isPaused ? "⏸ PAUSED" : "▶ ACTIVE"}
        </span>
      </div>

      <div className="data-grid mb-6">
        <div className="data-item">
          <div className="data-label">Admin</div>
          <div className="data-value text-violet-300/90">
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
          <div className="data-value text-zinc-100 font-semibold tabular-nums">
            {globalStateInfo.totalWagers.toString()}
          </div>
        </div>
        <div className="data-item">
          <div className="data-label">Total Volume</div>
          <div className="data-value text-emerald-300 font-semibold">
            {formatTokenAmount(Number(globalStateInfo.totalVolume))} OUTLAW
          </div>
        </div>
        <div className="data-item">
          <div className="data-label">Winner Share</div>
          <div className="data-value">{globalStateInfo.winnerShareBps} BPS</div>
        </div>
        <div className="data-item">
          <div className="data-label">Burn Share</div>
          <div className="data-value">{globalStateInfo.burnShareBps} BPS</div>
        </div>
        <div className="data-item">
          <div className="data-label">Status</div>
          <div className="data-value">
            <span
              className={`status-badge ${
                globalStateInfo.isPaused ? "status-paused" : "status-active"
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
        onClick={withToastAction(fetchGlobalState, "Global state refreshed!")}
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
  );
}
