"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { useWalletContext } from "../wallet-kit/WalletProvider";
import { useEscrowsByRoleQuery } from "../tanstack/useEscrowsByRoleQuery";
import { formatCurrency } from "../helpers/format.helper";
import type {
  GetEscrowsFromIndexerResponse as Escrow,
  MultiReleaseMilestone,
} from "@trustless-work/escrow/types";
import {
  Wallet,
  Loader2,
  FileX,
  Receipt,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

type EscrowStatus = "disputed" | "resolved" | "released" | "approved" | "working";

function getEscrowStatus(escrow: Escrow): EscrowStatus {
  if (escrow.flags?.disputed) return "disputed";
  if (escrow.flags?.resolved) return "resolved";
  if (escrow.flags?.released) return "released";
  if (escrow.flags?.approved) return "approved";
  return "working";
}

function getStatusBadge(status: EscrowStatus): React.ReactNode {
  switch (status) {
    case "disputed":
      return <Badge variant="destructive">Disputed</Badge>;
    case "resolved":
      return <Badge variant="outline">Resolved</Badge>;
    case "released":
      return <Badge variant="default">Released</Badge>;
    case "approved":
      return <Badge variant="secondary">Approved</Badge>;
    case "working":
      return <Badge variant="outline">Working</Badge>;
  }
}

function getStatusIcon(status: EscrowStatus): React.ReactNode {
  switch (status) {
    case "disputed":
      return <XCircle className="h-4 w-4 text-destructive" />;
    case "resolved":
    case "released":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case "approved":
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case "working":
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

function getMilestoneDescription(escrow: Escrow): string {
  const fallback = escrow.description || "No description";

  if (!escrow.milestones || escrow.milestones.length === 0) {
    return fallback;
  }

  if (escrow.type === "single-release") {
    return escrow.milestones[0]?.description || fallback;
  }

  const activeMilestone = escrow.milestones.find((m) => {
    const multiMilestone = m as MultiReleaseMilestone;
    return !multiMilestone.flags?.released && !multiMilestone.flags?.resolved;
  });

  return activeMilestone?.description || escrow.milestones[0]?.description || fallback;
}

export function RecentPaymentsView() {
  const { walletAddress } = useWalletContext();

  const {
    data: escrows,
    isLoading,
    isError,
    refetch,
  } = useEscrowsByRoleQuery({
    role: "receiver",
    roleAddress: walletAddress ?? "",
    orderBy: "createdAt",
    orderDirection: "desc",
    enabled: !!walletAddress,
  });

  // Show loading during initial wallet hydration to avoid false disconnected state
  if (isLoading && !walletAddress) {
    return (
      <div className="grid gap-6 p-6 md:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Recent Payments
        </h1>
        <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
          <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!walletAddress) {
    return (
      <div className="grid gap-6 p-6 md:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Recent Payments
        </h1>
        <Empty className="border-border text-center">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Wallet className="size-6 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>Connect your wallet</EmptyTitle>
            <EmptyDescription>
              Connect your wallet to see your recent payments and escrow activity.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 p-6 md:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Recent Payments
        </h1>
        <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
          <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Loading escrows…</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="grid gap-6 p-6 md:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Recent Payments
        </h1>
        <Empty className="border-border text-center">
          <EmptyHeader>
            <EmptyTitle>Error loading escrows</EmptyTitle>
            <EmptyDescription>
              Something went wrong. You can try again.
            </EmptyDescription>
            <Button variant="outline" onClick={() => refetch()} className="mt-4">
              Retry
            </Button>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  if (!escrows || escrows.length === 0) {
    return (
      <div className="grid gap-6 p-6 md:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Recent Payments
        </h1>
        <Empty className="border-border text-center">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileX className="size-6 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>No payments found</EmptyTitle>
            <EmptyDescription>
              You have no escrows where you are the receiver. Payments will appear
              here once you have incoming escrow activity.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div className="grid gap-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          Recent Payments
        </h1>
        <Badge variant="secondary" className="text-xs">
          {escrows.length} {escrows.length === 1 ? "escrow" : "escrows"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {escrows.map((escrow) => {
          const status = getEscrowStatus(escrow);
          const amount = escrow.type === "single-release"
            ? escrow.amount ?? 0
            : escrow.milestones?.reduce((sum, m) => sum + (m as MultiReleaseMilestone).amount, 0) || 0;

          return (
            <Card key={escrow.contractId} className="gap-3 hover:shadow-md transition-shadow">
              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline" className="text-xs">
                      {escrow.type === "single-release" ? "Single" : "Multi"}
                    </Badge>
                  </div>
                  {getStatusIcon(status)}
                </div>
                <CardTitle className="text-base line-clamp-2">
                  {escrow.title || "Untitled Escrow"}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Amount</p>
                  <p className="text-xl font-bold">
                    {escrow.trustline?.symbol
                      ? formatCurrency(amount, escrow.trustline.symbol)
                      : amount.toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Milestone</p>
                  <p className="text-sm line-clamp-2">
                    {getMilestoneDescription(escrow)}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <div className="mt-1">{getStatusBadge(status)}</div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-xs font-medium mt-1">
                      {escrow.createdAt?._seconds
                        ? new Date(escrow.createdAt._seconds * 1000).toLocaleDateString("en-US", {
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
        })}
      </div>
    </div>
  );
}
