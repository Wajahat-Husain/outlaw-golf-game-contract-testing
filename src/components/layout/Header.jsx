import { motion } from "framer-motion";
import solanaLogo from "../../assets/solana-logo.svg";
import WalletConnector from "../wallet/WalletConnector";

export default function Header() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <img src={solanaLogo} alt="Solana" className="h-12 mx-auto mb-4" />
        <h1 className="text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-linear-to-br from-purple-400 to-green-400">
          Outlaw Golf Arena
        </h1>
      </motion.div>
      <WalletConnector />
    </>
  );
}
