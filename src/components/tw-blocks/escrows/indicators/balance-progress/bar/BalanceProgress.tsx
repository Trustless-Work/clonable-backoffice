import * as React from "react";
import { Progress } from "@/components/ui/progress";
import { useGetMultipleEscrowBalancesQuery } from "@/components/tw-blocks/tanstack/useGetMultipleEscrowBalances";
import { formatCurrency } from "@/components/tw-blocks/helpers/format.helper";

type BalanceProgressBarProps = {
  contractId: string;
  target: number;
  currency: string;
};

export const BalanceProgressBar = ({
  contractId,
  target,
  currency,
}: BalanceProgressBarProps) => {
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
      <Progress
        value={isLoading || isError ? 0 : progressValue}
        className="w-full"
      />
    </div>
  );
};
