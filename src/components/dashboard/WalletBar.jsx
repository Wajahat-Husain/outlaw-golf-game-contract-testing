import { motion } from "framer-motion";
import { useDashboard } from "../../contexts/DashboardContext";

export default function WalletBar() {
  const { wallet } = useDashboard();
  const addr = wallet.publicKey.toBase58();
  const short = `${addr.slice(0, 4)}…${addr.slice(-4)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="card mb-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-start gap-4 min-w-0">
          <div
            className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-linear-to-br from-violet-600/30 to-emerald-600/20 text-lg font-bold text-violet-200"
            aria-hidden
          >
            {addr.slice(0, 1).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-zinc-500 mb-1.5">
              Connected wallet
            </p>
            <p
              className="font-mono text-sm sm:text-[0.9375rem] text-violet-200/95 break-all leading-snug"
              title={addr}
            >
              <span className="sm:hidden">{short}</span>
              <span className="hidden sm:inline">{addr}</span>
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => wallet.disconnect()}
          type="button"
          className="btn-secondary whitespace-nowrap w-full sm:w-auto text-red-200! border-red-500/25! hover:bg-red-950/40! hover:border-red-500/35!"
        >
          Disconnect
        </motion.button>
      </div>
    </motion.div>
  );
}
