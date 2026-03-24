import {
  useAppKit,
  useAppKitAccount,
} from "@reown/appkit/react";
const reownProjectId = import.meta.env.VITE_REOWN_PROJECT_ID;

function ReownWalletControls() {
  const { open } = useAppKit();
  const { isConnected } = useAppKitAccount({ namespace: "solana" });

  const handleReownConnect = () => {
    open({ view: "Connect" });
  };

  const handleOpenNetworks = () => {
    open({ view: "Networks" });
  };

  return (
    <>
      {!isConnected && (
        <>
          <button
            type="button"
            onClick={handleReownConnect}
            className="min-w-[220px] rounded-xl border-0 px-8 py-3.5 text-[0.9375rem] font-semibold tracking-wide text-white shadow-lg shadow-black/30 transition-all duration-200 bg-linear-to-r from-violet-600 via-purple-600 to-emerald-600 hover:from-violet-500 hover:via-purple-500 hover:to-emerald-500 hover:shadow-violet-500/25 hover:-translate-y-0.5 active:translate-y-0"
          >
            Connect Wallet
          </button>
          <button
            type="button"
            onClick={handleOpenNetworks}
            className="rounded-xl border border-white/10 bg-zinc-900/50 px-4 py-3 text-sm font-semibold text-zinc-200 transition-colors hover:bg-zinc-800/60"
          >
            Network
          </button>
        </>
      )}
    </>
  );
}

export default function WalletConnector() {
  const { isConnected } = useAppKitAccount({ namespace: "solana" });
  if (isConnected) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {reownProjectId ? <ReownWalletControls /> : null}
        {!reownProjectId && (
          <p className="w-full text-center text-xs text-amber-300">
            Set VITE_REOWN_PROJECT_ID in your env to enable Reown wallet modal.
          </p>
        )}
      </div>

    </div>
  );
}
