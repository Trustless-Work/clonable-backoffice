"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/components/tw-blocks/helpers/format.helper";
import { CheckCircle, Info } from "lucide-react";
import { GetEscrowsFromIndexerResponse, MultiReleaseMilestone } from "@trustless-work/escrow/types";

const BalanceProgressBarNoSSR = dynamic(
  () =>
    import(
      "@/components/tw-blocks/escrows/indicators/balance-progress/bar/BalanceProgress"
    ).then((m) => m.BalanceProgressBar),
  {
    ssr: false,
    loading: () => null,
  },
);

interface FundEscrowMainProps {
  currentEscrow: GetEscrowsFromIndexerResponse | null;
  isMultiRelease: boolean;
  isFullyFunded: boolean;
  targetAmount: number;
}

export function FundEscrowMain({
  currentEscrow,
  isMultiRelease,
  isFullyFunded,
  targetAmount,
}: FundEscrowMainProps) {
  if (!currentEscrow) {
    return (
      <Card className="border-border/60 border-dashed">
        <CardContent className="pt-12 pb-12">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Ready to Fund?
              </h3>
              <p className="text-sm text-muted-foreground">
                Select an escrow from the sidebar to view its details
                and funding progress.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4 border-b border-border/40">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isFullyFunded ? 'bg-green-100' : 'bg-primary/10'}`}>
              {isFullyFunded ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <svg
                  className="w-4 h-4 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              )}
            </div>
            {isFullyFunded ? 'Fully Funded!' : 'Funding Progress'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {isFullyFunded ? (
            <div className="text-center space-y-4 py-4" role="status" aria-live="polite">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto" aria-hidden="true">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Escrow Fully Funded!
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This escrow has reached its funding goal. The funds are now secured and ready for release according to the escrow terms.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left" role="region" aria-labelledby="next-steps-heading">
                  <div className="flex items-start gap-2 mb-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" aria-hidden="true" />
                    <h4 id="next-steps-heading" className="text-sm font-semibold text-blue-800">
                      What happens next?
                    </h4>
                  </div>
                  <ul className="text-xs text-blue-700 space-y-1 ml-6" role="list">
                    <li role="listitem">Funds are held securely in escrow</li>
                    <li role="listitem">Work can begin according to the agreement</li>
                    <li role="listitem">Milestones are completed and approved</li>
                    <li role="listitem">Funds are released as work is verified</li>
                    <li role="listitem">Any disputes are resolved through the escrow service</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <Suspense fallback={null}>
              <BalanceProgressBarNoSSR
                contractId={currentEscrow.contractId || ""}
                target={targetAmount}
                currency={currentEscrow.trustline?.symbol || ""}
              />
            </Suspense>
          )}
        </CardContent>
      </Card>

      {isMultiRelease && currentEscrow.milestones && (
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-4 border-b border-border/40">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              Milestones
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3" role="list" aria-label="Escrow milestones">
              {(
                currentEscrow.milestones as MultiReleaseMilestone[]
              ).map(
                (milestone: MultiReleaseMilestone, index: number) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border/40 rounded-lg hover:bg-muted/20 transition-colors group"
                    role="listitem"
                    aria-label={`Milestone ${index + 1}: ${milestone.description}`}
                  >
                    <div className="flex-1 mb-3 sm:mb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-6 w-6 min-h-6 min-w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary" aria-hidden="true">
                          {index + 1}
                        </div>
                        <p className="font-medium text-sm text-foreground">
                          {milestone.description}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground ml-8 font-bold" aria-label={`Amount: ${formatCurrency(milestone.amount, currentEscrow.trustline?.symbol || "")}`}>
                        {formatCurrency(
                          milestone.amount,
                          currentEscrow.trustline?.symbol || "",
                        )}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="self-start sm:self-center text-xs font-medium px-2.5 py-1"
                      aria-label={`Status: ${milestone.status || "Pending"}`}
                    >
                      {milestone.status || "Pending"}
                    </Badge>
                  </div>
                ),
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}