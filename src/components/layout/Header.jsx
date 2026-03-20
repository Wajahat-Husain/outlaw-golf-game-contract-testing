import { motion } from "framer-motion";
import solanaLogo from "../../assets/solana-logo.svg";
import WalletConnector from "../wallet/WalletConnector";

export default function Header() {
  return (
    <header className="text-center">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <div className="inline-flex items-center justify-center rounded-2xl border border-white/8 bg-zinc-900/40 px-4 py-3 shadow-lg shadow-black/20 backdrop-blur-md mb-6">
          <img
            src={solanaLogo}
            alt="Solana"
            className="h-9 w-auto opacity-90"
            width={36}
            height={36}
          />
          <span className="ml-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Solana
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-[2.75rem] font-extrabold tracking-tight leading-[1.1] mb-3 bg-linear-to-br from-violet-200 via-purple-300 to-emerald-300 bg-clip-text text-transparent">
          Outlaw Golf Arena
        </h1>
        <p className="text-sm sm:text-base text-zinc-500 max-w-md mx-auto font-medium leading-relaxed">
          On-chain wagers, escrow, and settlement — connect your wallet to play.
        </p>
      </motion.div>
      <WalletConnector />
    </header>
  );
}
