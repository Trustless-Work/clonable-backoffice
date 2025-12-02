"use client";

import { EscrowsByRoleCards } from "@/components/tw-blocks/escrows/escrows-by-role/cards/EscrowsCards";
import { InitializeEscrowDialog } from "@/components/tw-blocks/escrows/single-release/initialize-escrow/dialog/InitializeEscrow";
import { InitializeEscrowDialog as InitializeMultiReleaseEscrowDialog } from "@/components/tw-blocks/escrows/multi-release/initialize-escrow/dialog/InitializeEscrow";
import { WalletButton } from "@/components/tw-blocks/wallet-kit/WalletButtons";
import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <header className="flex justify-between items-center w-full">
        <div className="flex items-center gap-4">
          <Image
            src="/favicon.ico"
            alt="Trustless Work"
            width={48}
            height={48}
          />

          <h2 className="text-2xl font-bold uppercase border-l-2 border-primary pl-4">
            Backoffice
          </h2>
        </div>

        <WalletButton />
      </header>
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex w-full mb-4">
          <div className="flex w-1/6 gap-2">
            <InitializeEscrowDialog />
            <InitializeMultiReleaseEscrowDialog />
          </div>
        </div>

        <EscrowsByRoleCards />
      </main>
    </div>
  );
}
