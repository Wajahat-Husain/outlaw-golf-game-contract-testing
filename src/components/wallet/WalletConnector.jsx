import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function WalletConnector() {
  return (
    <div className="flex justify-center">
      <WalletMultiButton className="min-w-[220px]! rounded-xl! border-0! px-8! py-3.5! text-[0.9375rem]! font-semibold! tracking-wide! text-white! shadow-lg! shadow-black/30! transition-all! duration-200! bg-linear-to-r! from-violet-600! via-purple-600! to-emerald-600! hover:from-violet-500! hover:via-purple-500! hover:to-emerald-500! hover:shadow-violet-500/25! hover:-translate-y-0.5! active:translate-y-0!" />
    </div>
  );
}
