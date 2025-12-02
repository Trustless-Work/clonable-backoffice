// @ts-nocheck
import * as React from "react";
import { useGetMultipleEscrowBalancesQuery } from "@/components/tw-blocks/tanstack/useGetMultipleEscrowBalances";
import { formatCurrency } from "@/components/tw-blocks/helpers/format.helper";

type BalanceProgressDonutProps = {
  contractId: string;
  target: number;
  currency: string;
};

export const BalanceProgressDonut = ({
  contractId,
  target,
  currency,
}: BalanceProgressDonutProps) => {
  const isContractProvided = Boolean(
    contractId && contractId.trim().length > 0
  );

  const { data, isLoading, isError } = useGetMultipleEscrowBalancesQuery({
    addresses: isContractProvided ? [contractId] : [],
    enabled: isContractProvided,
  });

  const currentBalanceRaw = Number(data?.[0]?.balance ?? 0);
  const safeTarget = Number.isFinite(target) && target > 0 ? target : 0;
  const progressValue =
    safeTarget > 0
      ? Math.min(100, Math.max(0, (currentBalanceRaw / safeTarget) * 100))
      : 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
        <p>
          <span className="font-bold mr-1">Balance:</span>
          {isLoading
            ? "Loading…"
            : isError
            ? "-"
            : formatCurrency(currentBalanceRaw, currency)}
        </p>
        <p>
          <span className="font-bold mr-1">Target:</span>{" "}
          {formatCurrency(safeTarget, currency)}
        </p>
      </div>
      {(() => {
        const size = 160; // px
        const stroke = 12; // px
        const radius = (size - stroke) / 2;
        const circumference = 2 * Math.PI * radius;
        const pct = isLoading || isError ? 0 : progressValue;
        const dashOffset = circumference * (1 - pct / 100);

        return (
          <div className="flex justify-center">
            <div className="relative" style={{ width: size, height: size }}>
              <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Track */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  strokeWidth={stroke}
                  stroke="currentColor"
                  className="text-muted-foreground/20"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Progress */}
                <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={stroke}
                    stroke="currentColor"
                    className="text-primary"
                    fill="none"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                  />
                </g>
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{Math.round(pct)}%</span>
                <span className="text-muted-foreground text-sm">Progress</span>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
