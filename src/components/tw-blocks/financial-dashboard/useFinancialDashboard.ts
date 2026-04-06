"use client";

import React from "react";
import { useWalletContext } from "../wallet-kit/WalletProvider";
import { useEscrowsByRoleQuery } from "../tanstack/useEscrowsByRoleQuery";
import type { GetEscrowsFromIndexerResponse as Escrow } from "@trustless-work/escrow/types";

export type FinancialDashboardTab = "all" | "single" | "multi";

type AmountsByDatePoint = { date: string; amount: number };
type CreatedByDatePoint = { date: string; count: number };
type DonutSlice = { type: "single" | "multi"; value: number; fill: string };

function filterByTab(data: Escrow[], tab: FinancialDashboardTab): Escrow[] {
  if (tab === "single") return data.filter((e) => e.type === "single-release");
  if (tab === "multi") return data.filter((e) => e.type === "multi-release");
  return data;
}

function getCreatedDateKey(createdAt: Escrow["createdAt"]): string {
  const seconds = (createdAt as unknown as { _seconds?: number })?._seconds;
  const d = seconds ? new Date(seconds * 1000) : new Date();
  return d.toISOString().slice(0, 10);
}

function getSingleReleaseAmount(escrow: Escrow): number {
  const raw = (escrow as unknown as { amount?: number | string }).amount;
  const n = Number(raw ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function getMultiReleaseAmount(escrow: Escrow): number {
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

function getReleasedAmount(escrow: Escrow): number {
  if (escrow.type === "single-release") {
    const amount = getSingleReleaseAmount(escrow);
    return escrow.flags?.released ? amount : 0;
  }
  if (escrow.type === "multi-release") {
    const milestones = (
      escrow as unknown as {
        milestones?: Array<{ amount?: number | string; status?: string }>;
      }
    ).milestones;
    if (!Array.isArray(milestones)) return 0;
    return milestones.reduce((acc: number, m) => {
      if (m?.status === "released") {
        const n = Number(m?.amount ?? 0);
        return acc + (Number.isFinite(n) ? n : 0);
      }
      return acc;
    }, 0);
  }
  return 0;
}

export function useFinancialDashboard(tab: FinancialDashboardTab) {
  const { walletAddress } = useWalletContext();

  const {
    data = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useEscrowsByRoleQuery({
    role: "receiver",
    roleAddress: walletAddress ?? "",
    orderDirection: "desc",
    enabled: !!walletAddress,
  });

  const filtered = React.useMemo(
    () => filterByTab(data, tab),
    [data, tab]
  );

  const totalEscrows = React.useMemo<number>(
    () => filtered.length,
    [filtered.length]
  );

  const totalAmount = React.useMemo<number>(() => {
    return filtered.reduce((acc: number, e) => acc + getEscrowAmount(e), 0);
  }, [filtered]);

  const totalReleased = React.useMemo<number>(() => {
    return filtered.reduce(
      (acc: number, e) => acc + getReleasedAmount(e),
      0
    );
  }, [filtered]);

  const totalBalance = React.useMemo<number>(
    () => totalAmount - totalReleased,
    [totalAmount, totalReleased]
  );

  const typeSlices = React.useMemo<DonutSlice[]>(() => {
    let single = 0;
    let multi = 0;
    for (const e of filtered) {
      if (e.type === "single-release") single += 1;
      else if (e.type === "multi-release") multi += 1;
    }
    return [
      { type: "single", value: single, fill: "var(--color-single)" },
      { type: "multi", value: multi, fill: "var(--color-multi)" },
    ];
  }, [filtered]);

  const amountsByDate = React.useMemo<AmountsByDatePoint[]>(() => {
    const map = new Map<string, number>();
    for (const e of filtered) {
      const key = getCreatedDateKey(e.createdAt);
      const current = map.get(key) ?? 0;
      map.set(key, current + getEscrowAmount(e));
    }
    return Array.from(map.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  }, [filtered]);

  const createdByDate = React.useMemo<CreatedByDatePoint[]>(() => {
    const map = new Map<string, number>();
    for (const e of filtered) {
      const key = getCreatedDateKey(e.createdAt);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  }, [filtered]);

  return {
    isLoading,
    isFetching,
    isError,
    refetch,
    totalEscrows,
    totalAmount,
    totalReleased,
    totalBalance,
    typeSlices,
    amountsByDate,
    createdByDate,
  } as const;
}

export type UseFinancialDashboardReturn = ReturnType<typeof useFinancialDashboard>;
