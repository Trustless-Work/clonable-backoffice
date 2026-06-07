"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { EscrowsByRoleCards } from "@/components/tw-blocks/escrows/escrows-by-role/cards/EscrowsCards";
import { InitializeEscrowDialog } from "@/components/tw-blocks/escrows/single-release/initialize-escrow/dialog/InitializeEscrow";
import { InitializeEscrowDialog as InitializeMultiReleaseEscrowDialog } from "@/components/tw-blocks/escrows/multi-release/initialize-escrow/dialog/InitializeEscrow";
import { WalletButton } from "@/components/tw-blocks/wallet-kit/WalletButtons";
import { WalletValidationGate } from "@/components/tw-blocks/wallet-kit/WalletValidationGate";
import Image from "next/image";

const EscrowsBySignerCardsNoSSR = dynamic(
  () =>
    import("@/components/tw-blocks/escrows/escrows-by-signer/cards/EscrowsCards").then(
      (m) => m.EscrowsBySignerCards,
    ),
  {
    ssr: false,
    loading: () => null,
  },
);

import Link from "next/link";
import { Briefcase, Sparkles } from "lucide-react";

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
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full">
        {/* top buttons / actions */}
        <div className="flex w-full mb-4 justify-between items-center">
          <WalletValidationGate>
            <div className="flex gap-2">
              <InitializeEscrowDialog />
              <InitializeMultiReleaseEscrowDialog />
            </div>
          </WalletValidationGate>
        </div>

        {/* prominent card linking to workspace with everything */}
        <div className="w-full max-w-lg">
          <Link href="/service-provider" className="block">
            <div className="p-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <Briefcase className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">
                    Service Provider Workspace
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Click this card to enter the workspace, manage your escrows,
                    and view your milestone progress bars.
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* subtle entry to the Pollar adapter demo (issue #28) */}
        <div className="w-full max-w-lg space-y-3">
          <Link href="/pollar" className="block">
            <div className="p-3 bg-muted/20 border border-border/40 rounded-md hover:bg-muted/40 transition-colors text-sm">
              <div className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <span className="font-medium">Try Pollar mode</span>
                  <span className="text-muted-foreground ml-2">
                    — sign Trustless Work XDRs via Pollar (demo)
                  </span>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/crossmint" className="block">
            <div className="p-3 bg-[#20C997]/5 border border-[#20C997]/20 rounded-md hover:bg-[#20C997]/10 transition-colors text-sm">
              <div className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-[#20C997]" />
                <div className="flex-1">
                  <span className="font-medium text-[#20C997]">
                    Try Crossmint mode
                  </span>
                  <span className="text-muted-foreground ml-2">
                    — sign and submit Trustless Work XDRs via Crossmint (demo)
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <Suspense fallback={null}>
          <EscrowsBySignerCardsNoSSR />
        </Suspense>
      </main>
    </div>
  );
}
