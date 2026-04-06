"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GetEscrowsFromIndexerResponse as Escrow, MultiReleaseMilestone } from "@trustless-work/escrow/types";
import { formatCurrency } from "@/components/tw-blocks/helpers/format.helper";
import { useCopy } from "@/components/tw-blocks/helpers/useCopy";
import { Copy } from "lucide-react";
import { EscrowMilestoneProgressBar } from "@/components/tw-blocks/escrows/indicators/milestone-progress/bar/EscrowMilestoneProgress";

interface EscrowSummaryProps {
  escrow: Escrow;
}

export const EscrowSummary = ({ escrow }: EscrowSummaryProps) => {
  const isMultiRelease = escrow.type === "multi-release";
  const { copyToClipboard } = useCopy();

  return (
    <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Escrow Summary</span>
          <Badge variant={isMultiRelease ? "default" : "secondary"}>
            {isMultiRelease ? "Multi Release" : "Single Release"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-sm font-medium text-muted-foreground">
              Escrow ID
            </label>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm font-mono truncate flex-1" title={escrow.contractId}>
                {escrow.contractId}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(escrow.contractId || "")}
                className="h-6 w-6 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Asset
            </label>
            <p className="text-sm">
              {escrow.trustline?.symbol || "Unknown"}
            </p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Description
          </label>
          <p className="text-sm">{escrow.title || "No description"}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Total Amount
          </label>
          <p className="text-lg font-semibold">
            {isMultiRelease
              ? formatCurrency(
                  escrow.milestones?.reduce(
                    (acc, milestone) => acc + (milestone as MultiReleaseMilestone).amount,
                    0
                  ) || 0,
                  escrow.trustline?.symbol || ""
                )
              : formatCurrency(escrow.amount ?? 0, escrow.trustline?.symbol || "")}
          </p>
        </div>
        {/* milestone progress summary - support both single and multi-release */}
        <div className="mt-4">
          <span className="text-sm font-medium text-muted-foreground block mb-2">
            Approval Progress
          </span>
          <EscrowMilestoneProgressBar
            escrow={escrow}
            mode="approved"
            showText={false}
          />
        </div>
      </CardContent>
    </Card>
  );
};