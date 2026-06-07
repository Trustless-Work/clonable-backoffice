"use client";

import * as React from "react";
import { Loader2, PlusCircle, Search } from "lucide-react";
import { useEscrowsByRoleQuery } from "@/components/tw-blocks/tanstack/useEscrowsByRoleQuery";
import { CrossmintEscrowCard } from "./CrossmintEscrowCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function CrossmintMyEscrowsTab({
  walletAddress,
}: {
  walletAddress?: string | null;
}) {
  const [searchTerm, setSearchTerm] = React.useState("");

  const { data: escrows, isLoading } = useEscrowsByRoleQuery({
    role: "approver",
    roleAddress: walletAddress || "",
  });

  const filteredEscrows = React.useMemo(() => {
    if (!escrows) return [];
    return escrows.filter((escrow) =>
      escrow.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      escrow.contractId?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [escrows, searchTerm]);

  if (!walletAddress) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-[#F0F2F5] dark:bg-[#2C2E33] p-4 rounded-full mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold mb-2">Connect your wallet</h3>
        <p className="text-muted-foreground max-w-xs">
          Connect an active wallet to view and manage your Trustless Work escrows.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#20C997] mb-4" />
        <p className="text-muted-foreground">Loading your escrows...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or contract ID..."
            className="pl-10 bg-white dark:bg-[#1A1C1E] border-none shadow-sm h-11"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="w-full sm:w-auto bg-[#111111] dark:bg-white text-white dark:text-[#111111] hover:bg-black/90 dark:hover:bg-white/90 h-11 px-6 font-bold rounded-lg gap-2">
          <PlusCircle className="h-4 w-4" />
          New Escrow
        </Button>
      </div>

      {filteredEscrows.length === 0 ? (
        <div className="bg-white dark:bg-[#1A1C1E] rounded-xl p-12 text-center border-2 border-dashed border-[#F0F2F5] dark:border-[#2C2E33]">
          <p className="text-muted-foreground">
            {searchTerm ? "No escrows match your search." : "You haven't created any escrows yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEscrows.map((escrow, idx) => {
            const stableKey = escrow.contractId || (escrow as any).id || `escrow-${idx}-${escrow.createdAt}`;
            return (
              <CrossmintEscrowCard
                key={stableKey}
                escrow={escrow}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
