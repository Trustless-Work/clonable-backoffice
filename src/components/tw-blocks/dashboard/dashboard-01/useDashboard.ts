"use client";

import React from "react";
import { useWalletContext } from "../../wallet-kit/WalletProvider";
import { useEscrowsBySignerQuery } from "../../tanstack/useEscrowsBySignerQuery";
import type { GetEscrowsFromIndexerResponse as Escrow } from "@trustless-work/escrow/types";

type AmountsByDatePoint = { date: string; amount: number };
type CreatedByDatePoint = { date: string; count: number };
type DonutSlice = { type: "single" | "multi"; value: number; fill: string };

function getCreatedDateKey(createdAt: Escrow["createdAt"]): string {
  // createdAt is a Firestore-like timestamp: { _seconds, _nanoseconds }
  const seconds = (createdAt as unknown as { _seconds?: number })?._seconds;
  const d = seconds ? new Date(seconds * 1000) : new Date();
  // YYYY-MM-DD
  return d.toISOString().slice(0, 10);
}

function getSingleReleaseAmount(escrow: Escrow): number {
  // Single release stores total in .amount
  const raw = (escrow as unknown as { amount?: number | string }).amount;
  const n = Number(raw ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function getMultiReleaseAmount(escrow: Escrow): number {
  // Multi release accumulates across milestones
  const milestones = (
    escrow as unknown as {
      milestones?: Array<{ amount?: number | string }>;
    }
  ).milestones;
  if (!Array.isArray(milestones)) return 0;
  return milestones.reduce((acc: number, m) => {
    const n = Number(m?.amount ?? 0);
    return acc + (Number.isFinite(n) ? n : 0);
  }, 0);
}

function getEscrowAmount(escrow: Escrow): number {
  if (escrow.type === "single-release") return getSingleReleaseAmount(escrow);
  if (escrow.type === "multi-release") return getMultiReleaseAmount(escrow);
  return 0;
}

export function useDashboard() {
  const { walletAddress } = useWalletContext();

  const {
    data = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useEscrowsBySignerQuery({
    signer: walletAddress ?? "",
    enabled: !!walletAddress,
  });

  const totalEscrows = React.useMemo<number>(() => data.length, [data.length]);

  const totalAmount = React.useMemo<number>(() => {
    return data.reduce((acc: number, e) => acc + getEscrowAmount(e), 0);
  }, [data]);

  const totalBalance = React.useMemo<number>(() => {
    return data.reduce((acc: number, e) => acc + Number(e?.balance ?? 0), 0);
  }, [data]);

  const typeSlices = React.useMemo<DonutSlice[]>(() => {
    let single = 0;
    let multi = 0;
    for (const e of data) {
      if (e.type === "single-release") single += 1;
      else if (e.type === "multi-release") multi += 1;
    }
    return [
      { type: "single", value: single, fill: "var(--color-single)" },
      { type: "multi", value: multi, fill: "var(--color-multi)" },
    ];
  }, [data]);

  const amountsByDate = React.useMemo<AmountsByDatePoint[]>(() => {
    const map = new Map<string, number>();
    for (const e of data) {
      const key = getCreatedDateKey(e.createdAt);
      const current = map.get(key) ?? 0;
      map.set(key, current + getEscrowAmount(e));
    }
    return Array.from(map.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  }, [data]);

  const createdByDate = React.useMemo<CreatedByDatePoint[]>(() => {
    const map = new Map<string, number>();
    for (const e of data) {
      const key = getCreatedDateKey(e.createdAt);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  }, [data]);

  return {
    isLoading,
    isFetching,
    isError,
    refetch,
    totalEscrows,
    totalAmount,
    totalBalance,
    typeSlices,
    amountsByDate,
    createdByDate,
  } as const;
}
