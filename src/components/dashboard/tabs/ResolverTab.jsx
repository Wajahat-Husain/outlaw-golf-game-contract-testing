import { motion } from "framer-motion";
import { useDashboard } from "../../../contexts/DashboardContext";

export default function ResolverTab() {
  const {
    isLoading,
    wagerId,
    setWagerId,
    winnerAddress,
    setWinnerAddress,
    referralAddress,
    setReferralAddress,
    withToast,
    handleSettleWager,
  } = useDashboard();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-0"
    >
      <div className="panel-section space-y-4 border-b-0!">
        <h2 className="panel-heading border-0 mb-0 pb-0">
          <span aria-hidden>🏆</span>
          Settle wager
        </h2>
        <div className="space-y-4 pt-1">
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
            <label className="input-label">Winner Address *</label>
            <input
              type="text"
              placeholder="Enter winner public key"
              value={winnerAddress}
              onChange={(e) => setWinnerAddress(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="input-label">Referral Address (Optional)</label>
            <input
              type="text"
              placeholder="Enter referral public key (optional)"
              value={referralAddress}
              onChange={(e) => setReferralAddress(e.target.value)}
              className="input-field"
            />
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => withToast(handleSettleWager, "Wager settled")}
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
  );
}
