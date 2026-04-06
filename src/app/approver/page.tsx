"use client";

import { Suspense } from "react";
import { ApproverEscrowsTable } from "@/components/tw-blocks/escrows/escrows-by-role/approver/ApproverEscrowsTable";
import { WalletButton } from "@/components/tw-blocks/wallet-kit/WalletButtons";
import { Info } from "lucide-react";
import Image from "next/image";

/**
 * Approver Workspace Page
 *
 * This page displays all escrows where the connected wallet is assigned the Approver role.
 * The Approver is responsible for reviewing and approving work in escrows.
 *
 * Features:
 * - Role-based discovery (locked to "approver" role)
 * - Wallet connection required
 * - Filtering, sorting, and pagination
 * - Read-only view (approval actions to be added in future tasks)
 */
export default function ApproverWorkspace() {
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
            Approver Workspace
          </h2>
        </div>

        <WalletButton />
      </header>

      <main className="flex flex-col gap-6 row-start-2 items-center sm:items-start w-full">
        {/* Informational Banner */}
        <div className="w-full bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">
              You are acting as an Approver
            </h3>
            <p className="text-sm text-muted-foreground">
              This workspace shows all escrows where you are responsible for reviewing and approving work.
              As an Approver, you will be able to review milestones, approve releases, and manage disputes.
            </p>
          </div>
        </div>

        {/* Escrows Table */}
        <Suspense fallback={null}>
          <ApproverEscrowsTable />
        </Suspense>
      </main>
    </div>
  );
}
