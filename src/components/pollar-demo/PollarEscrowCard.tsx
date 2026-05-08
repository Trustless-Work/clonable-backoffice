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
  return <Badge variant={variant}>{label}</Badge>;
}

function StatusIcon({ status }: { status: DisplayStatus }) {
  switch (status) {
    case "disputed":
      return <XCircle className="h-4 w-4 text-destructive" />;
    case "resolved":
    case "released":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
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

export function PollarEscrowCard({ escrow }: { escrow: Escrow }) {
  const status = getEscrowStatus(escrow);
  const amount = escrowAmount(escrow);
  const symbol = escrow.trustline?.symbol ?? "USDC";

  return (
    <Card className="gap-3 hover:shadow-md transition-shadow">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="text-xs">
              {escrow.type === "single-release" ? "Single" : "Multi"}
            </Badge>
          </div>
          <StatusIcon status={status} />
        </div>
        <CardTitle className="text-base line-clamp-2">
          {escrow.title || "Untitled escrow"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Amount</p>
          <p className="text-xl font-bold">{formatCurrency(amount, symbol)}</p>
        </div>

        {escrow.engagementId && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Engagement</p>
            <p className="text-sm font-mono">{escrow.engagementId}</p>
          </div>
        )}

        <div>
          <p className="text-xs text-muted-foreground mb-1">Contract</p>
          <p className="text-xs font-mono">
            {shortContractId(escrow.contractId)}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <div className="mt-1">
              <StatusBadge status={status} />
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Created</p>
            <p className="text-xs font-medium mt-1">
              {escrow.createdAt?._seconds
                ? new Date(
                    escrow.createdAt._seconds * 1000,
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : "-"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
