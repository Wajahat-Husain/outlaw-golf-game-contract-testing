import { motion } from "framer-motion";
import { useDashboard } from "../../../contexts/DashboardContext";
import {
  formatTokenAmount,
  formatWagerStatus,
  formatTimestamp,
} from "../../../utils/formatters";
import { TOKEN_DECIMALS_NUM } from "../../../utils/constants";

export default function UserTab() {
  const amountStep =
    TOKEN_DECIMALS_NUM > 0 ? `0.${"0".repeat(TOKEN_DECIMALS_NUM - 1)}1` : "1";

  const {
    wallet,
    isLoading,
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
    withToast,
    handleFetchWagerData,
    handleCreateWager,
    handleJoinWager,
    handleCancelWager,
  } = useDashboard();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-0"
    >
      {myActiveWagers.length > 0 && (
        <div className="panel-section space-y-4">
          <h2 className="panel-heading border-0 mb-0 pb-0">
            <span aria-hidden>🏌️</span>
            My active wagers
          </h2>
          <div className="space-y-3 pt-1">
            {myActiveWagers.map(({ publicKey, account }) => (
              <div
                key={publicKey.toBase58()}
                className="wager-list-card"
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
                    <div className="data-value text-emerald-300/95 font-semibold">
                      {formatTokenAmount(Number(account.amount))}{" "}
                      <span className="text-emerald-500/80 text-[0.7rem] uppercase tracking-wider">
                        OUTLAW
                      </span>
                    </div>
                  </div>
                  <div className="data-item">
                    <div className="data-label">Status</div>
                    <div className="data-value">
                      {formatWagerStatus(account.status)}
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
      )}

      <div className="panel-section space-y-4">
        <h2 className="panel-heading border-0 mb-0 pb-0">
          <span aria-hidden>🔍</span>
          Query wager
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 pt-1">
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
                validationErrors.wagerQueryId ? "input-field--error" : ""
              }`}
            />
            {validationErrors.wagerQueryId && (
              <p className="text-red-300/90 text-xs mt-1.5 font-medium">
                {validationErrors.wagerQueryId}
              </p>
            )}
          </div>
          <div className="flex items-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                withToast(handleFetchWagerData, "Wager data fetched")
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
            className="mt-4 rounded-xl border border-white/8 bg-linear-to-b from-zinc-900/70 to-zinc-950/90 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          >
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4">
              Wager details
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
                  {formatWagerStatus(wagerData.status)}
                </div>
              </div>
              <div className="data-item">
                <div className="data-label">Player 1</div>
                <div className="data-value text-violet-300/90">
                  {wagerData.player1.toBase58()}
                </div>
              </div>
              <div className="data-item">
                <div className="data-label">Player 2</div>
                <div className="data-value text-emerald-300/90">
                  {wagerData.player2
                    ? wagerData.player2.toBase58()
                    : "Waiting..."}
                </div>
              </div>
              <div className="data-item">
                <div className="data-label">Amount</div>
                <div className="data-value text-emerald-300 font-semibold">
                  {formatTokenAmount(Number(wagerData.amount))} OUTLAW
                </div>
              </div>
              <div className="data-item">
                <div className="data-label">Total Pot</div>
                <div className="data-value text-emerald-300 font-semibold">
                  {formatTokenAmount(Number(wagerData.totalPot))} OUTLAW
                </div>
              </div>
              <div className="data-item col-span-1 sm:col-span-2">
                <div className="data-label">Created At</div>
                <div className="data-value">
                  {formatTimestamp(wagerData.createdAt)}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="panel-section space-y-4">
        <h2 className="panel-heading border-0 mb-0 pb-0">
          <span aria-hidden>➕</span>
          Create wager
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 pt-1">
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
                validationErrors.wagerId ? "input-field--error" : ""
              }`}
            />
            {validationErrors.wagerId && (
              <p className="text-red-300/90 text-xs mt-1.5 font-medium">
                {validationErrors.wagerId}
              </p>
            )}
          </div>
          <div className="flex-1">
            <label className="input-label">Amount (OUTLAW)</label>
            <input
              type="number"
              step={amountStep}
              placeholder="Enter wager amount"
              value={wagerAmount}
              onChange={(e) => {
                setWagerAmount(e.target.value);
                validateInput("wagerAmount", e.target.value);
              }}
              className={`input-field ${
                validationErrors.wagerAmount ? "input-field--error" : ""
              }`}
            />
            {validationErrors.wagerAmount && (
              <p className="text-red-300/90 text-xs mt-1.5 font-medium">
                {validationErrors.wagerAmount}
              </p>
            )}
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() =>
            withToast(handleCreateWager, "Wager created successfully!")
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

      <div className="panel-section space-y-4">
        <h2 className="panel-heading border-0 mb-0 pb-0">
          <span aria-hidden>🤝</span>
          Join wager
        </h2>
        <div className="pt-1">
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
              validationErrors.wagerId ? "input-field--error" : ""
            }`}
          />
          {validationErrors.wagerId && (
            <p className="text-red-300/90 text-xs mt-1.5 font-medium">
              {validationErrors.wagerId}
            </p>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() =>
            withToast(handleJoinWager, "Joined wager successfully!")
          }
          disabled={isLoading || validationErrors.wagerId || !wagerId}
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

      <div className="panel-section space-y-4 border-b-0!">
        <h2 className="panel-heading border-0 mb-0 pb-0">
          <span aria-hidden>❌</span>
          Cancel wager
        </h2>
        <div className="pt-1">
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
              validationErrors.wagerId ? "input-field--error" : ""
            }`}
          />
          {validationErrors.wagerId && (
            <p className="text-red-300/90 text-xs mt-1.5 font-medium">
              {validationErrors.wagerId}
            </p>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() =>
            withToast(handleCancelWager, "Wager cancelled successfully!")
          }
          disabled={isLoading || validationErrors.wagerId || !wagerId}
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
  );
}
