"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Building } from "lucide-react";
import { useEscrowsByApprover } from "../useEscrowsByApprover";
import { useWalletContext } from "../../../wallet-kit/WalletProvider";
import type { GetEscrowsFromIndexerResponse as Escrow, MultiReleaseMilestone } from "@trustless-work/escrow/types";
import { EscrowMilestoneProgressBar } from "../../indicators/milestone-progress/bar/EscrowMilestoneProgress";
import { formatCurrency } from "../../../helpers/format.helper";

interface RelatedEscrowsProps {
  selectedEscrow: Escrow;
}

/**
 * Calculate total escrow amount, correctly handling both single and multi-release types
 */
function getEscrowAmount(escrow: Escrow): number {
  if (escrow.type === "single-release") {
    return escrow.amount ?? 0;
  }
  // multi-release: sum milestone amounts
  return (escrow.milestones || []).reduce(
    (acc, milestone) => acc + ((milestone as MultiReleaseMilestone).amount ?? 0),
    0
  );
}

interface RelatedEscrowsProps {
  selectedEscrow: Escrow;
}

export const RelatedEscrows: React.FC<RelatedEscrowsProps> = ({ selectedEscrow }) => {
  const { walletAddress } = useWalletContext();

  // Note: Currently fetches only escrows where the user is the approver.
  // In future iterations, this could be expanded to fetch all escrows
  // where the user has any role, or passed from the parent context.
  const { data: escrows, isLoading, isError } = useEscrowsByApprover();

  if (!walletAddress) {
    return (
      <div className="text-center text-muted-foreground">
        <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Connect your wallet to view related escrows.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center text-muted-foreground">
        <p>Loading related escrows...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-destructive">
        <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Error loading related escrows</p>
        <p className="text-sm mt-2 text-muted-foreground">Please try again later</p>
      </div>
    );
  }

  // Filter escrows by same service provider, excluding the current one
  const relatedEscrows = escrows?.filter(
    (escrow) =>
      escrow.roles.serviceProvider === selectedEscrow.roles.serviceProvider &&
      escrow.contractId !== selectedEscrow.contractId
  ) || [];

  if (relatedEscrows.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No other escrows found from this service provider.</p>
        <p className="text-sm mt-2">Service Provider: {selectedEscrow.roles.serviceProvider}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        Other escrows from the same service provider ({selectedEscrow.roles.serviceProvider})
      </div>

      {relatedEscrows.map((escrow) => (
        <Card key={escrow.contractId} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">{escrow.contractId}</div>
              <div className="text-sm text-muted-foreground">
                Amount: {formatCurrency(getEscrowAmount(escrow), escrow.trustline?.symbol)}
              </div>
            </div>
            <div className="w-32">
              <EscrowMilestoneProgressBar
                escrow={escrow}
                mode="approved"
                showText={false}
                showHeader={false}
                className="text-xs"
              />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};