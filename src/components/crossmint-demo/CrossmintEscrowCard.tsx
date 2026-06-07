"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, Clock, CheckCircle2, XCircle } from "lucide-react";
import type {
  GetEscrowsFromIndexerResponse as Escrow,
  MultiReleaseMilestone,
} from "@trustless-work/escrow/types";
import { formatCurrency } from "@/components/tw-blocks/helpers/format.helper";

type DisplayStatus = "disputed" | "resolved" | "released" | "working";

function getEscrowStatus(escrow: Escrow): DisplayStatus {
  if (escrow.flags?.disputed) return "disputed";
  if (escrow.flags?.resolved) return "resolved";
  if (escrow.flags?.released) return "released";
  return "working";
}

function StatusBadge({ status }: { status: DisplayStatus }) {
  const map: Record<
    DisplayStatus,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
  > = {
    disputed: { label: "Disputed", variant: "destructive" },
    resolved: { label: "Resolved", variant: "outline" },
    released: { label: "Released", variant: "default" },
    working: { label: "Working", variant: "outline" },
  };
  const { label, variant } = map[status];
  return <Badge variant={variant} className="rounded-full px-3">{label}</Badge>;
}

function StatusIcon({ status }: { status: DisplayStatus }) {
  switch (status) {
    case "disputed":
      return <XCircle className="h-4 w-4 text-destructive" />;
    case "resolved":
    case "released":
      return <CheckCircle2 className="h-4 w-4 text-[#20C997]" />;
    case "working":
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

function escrowAmount(escrow: Escrow): number {
  if (escrow.type === "single-release") {
    return escrow.amount ?? 0;
  }
  return (
    escrow.milestones?.reduce(
      (sum, m) => sum + ((m as MultiReleaseMilestone).amount ?? 0),
      0,
    ) ?? 0
  );
}

function shortContractId(contractId?: string): string {
  if (!contractId) return "-";
  if (contractId.length <= 12) return contractId;
  return `${contractId.slice(0, 6)}…${contractId.slice(-4)}`;
}

export function CrossmintEscrowCard({ escrow }: { escrow: Escrow }) {
  const status = getEscrowStatus(escrow);
  const amount = escrowAmount(escrow);
  const symbol = escrow.trustline?.symbol ?? "USDC";

  return (
    <Card className="border-none shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_25px_rgba(0,0,0,0.1)] transition-all bg-white dark:bg-[#1A1C1E] rounded-xl overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-[#F0F2F5] dark:bg-[#2C2E33] text-xs font-semibold rounded-md border-none">
                {escrow.type === "single-release" ? "Single Release" : "Multi Release"}
              </Badge>
            </div>
            <CardTitle className="text-lg font-bold tracking-tight mt-2">
              {escrow.title || "Untitled Escrow"}
            </CardTitle>
          </div>
          <StatusIcon status={status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Total Amount</p>
          <p className="text-2xl font-black text-[#111111] dark:text-white">
            {formatCurrency(amount, symbol)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Status</p>
            <StatusBadge status={status} />
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Created</p>
            <p className="text-sm font-medium">
              {escrow.createdAt?._seconds
                ? new Date(
                    escrow.createdAt._seconds * 1000,
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })
                : "-"}
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-[#F0F2F5] dark:border-[#2C2E33]">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Contract ID</p>
          <p className="text-xs font-mono text-muted-foreground break-all">
            {escrow.contractId || "Pending deployment..."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
