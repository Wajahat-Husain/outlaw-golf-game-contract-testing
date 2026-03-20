import { motion, AnimatePresence } from "framer-motion";
import { useDashboard } from "../../contexts/DashboardContext";
import WalletBar from "./WalletBar";
import GlobalStateSection from "./GlobalStateSection";
import UserTab from "./tabs/UserTab";
import AdminTab from "./tabs/AdminTab";
import ResolverTab from "./tabs/ResolverTab";

function TabIndicator() {
  return (
    <motion.div
      layoutId="activeTab"
      className="h-0.5 w-8 rounded-full bg-linear-to-r from-violet-400 to-emerald-400 shadow-[0_0_12px_rgba(167,139,250,0.5)]"
      transition={{
        type: "spring",
        bounce: 0.2,
        duration: 0.55,
      }}
    />
  );
}

export default function ConnectedDashboard() {
  const {
    isInitialized,
    isAdmin,
    isResolver,
    activeTab,
    setActiveTab,
    isLoading,
    error,
    handleInitializeProgram,
  } = useDashboard();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <WalletBar />

      {isInitialized ? (
        <div className="space-y-8">
          <GlobalStateSection />

          <div className="card p-0! overflow-hidden">
            <div className="tabs-shell mx-4 sm:mx-5 mt-4 sm:mt-5 mb-0">
              <button
                type="button"
                className={`tab-button ${
                  activeTab === "user"
                    ? "tab-button-active"
                    : "tab-button-inactive"
                }`}
                onClick={() => setActiveTab("user")}
              >
                <span className="relative inline-flex flex-col items-center gap-1.5 w-full">
                  <span className="flex items-center justify-center gap-1.5">
                    <span aria-hidden>👤</span>
                    <span>User</span>
                  </span>
                  {activeTab === "user" && <TabIndicator />}
                </span>
              </button>
              {isAdmin && (
                <button
                  type="button"
                  className={`tab-button ${
                    activeTab === "admin"
                      ? "tab-button-active"
                      : "tab-button-inactive"
                  }`}
                  onClick={() => setActiveTab("admin")}
                >
                  <span className="relative inline-flex flex-col items-center gap-1.5 w-full">
                    <span className="flex items-center justify-center gap-1.5">
                      <span aria-hidden>⚙️</span>
                      <span>Admin</span>
                    </span>
                    {activeTab === "admin" && <TabIndicator />}
                  </span>
                </button>
              )}
              {isResolver && (
                <button
                  type="button"
                  className={`tab-button ${
                    activeTab === "resolver"
                      ? "tab-button-active"
                      : "tab-button-inactive"
                  }`}
                  onClick={() => setActiveTab("resolver")}
                >
                  <span className="relative inline-flex flex-col items-center gap-1.5 w-full">
                    <span className="flex items-center justify-center gap-1.5">
                      <span aria-hidden>🎯</span>
                      <span>Resolver</span>
                    </span>
                    {activeTab === "resolver" && <TabIndicator />}
                  </span>
                </button>
              )}
            </div>

            <div className="px-4 sm:px-5 pb-5 pt-2">
              <AnimatePresence mode="wait">
                {activeTab === "user" && <UserTab key="user" />}
                {activeTab === "admin" && isAdmin && (
                  <AdminTab key="admin" />
                )}
                {activeTab === "resolver" && isResolver && (
                  <ResolverTab key="resolver" />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="card text-center max-w-lg mx-auto"
        >
          <h2 className="text-center text-2xl sm:text-[1.65rem] font-extrabold tracking-tight mb-3 bg-linear-to-r from-violet-200 via-purple-200 to-emerald-200 bg-clip-text text-transparent">
            Initialize program
          </h2>
          <p className="text-zinc-500 mb-8 text-sm leading-relaxed px-2">
            Deploy the on-chain global state once. After initialization you can
            create and join wagers.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleInitializeProgram}
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
          className="mt-6 hint-box hint-box--warn flex items-start gap-3"
          role="alert"
        >
          <span className="text-lg shrink-0" aria-hidden>
            ⚠️
          </span>
          <p className="text-sm font-medium leading-relaxed">{error}</p>
        </motion.div>
      )}
    </motion.div>
  );
}
