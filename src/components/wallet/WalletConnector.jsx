import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function WalletConnector() {
  return (
    <div className="flex justify-center">
      <WalletMultiButton className="bg-linear-to-r! from-purple-600! to-green-600! hover:from-purple-700! hover:to-green-700! text-white! rounded-xl! px-8! py-3! font-semibold! shadow-xl! transition-all! border-0! hover:shadow-purple-500/50! min-w-[200px]!" />
    </div>
  );
}
