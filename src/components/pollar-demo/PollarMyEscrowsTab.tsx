"use client";

import * as React from "react";
import { usePollar } from "@pollar/react";
import { Loader2, RefreshCcw, Search, FileX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useEscrowsBySignerQuery } from "@/components/tw-blocks/tanstack/useEscrowsBySignerQuery";
import { PollarEscrowCard } from "./PollarEscrowCard";

type TypeFilter = "all" | "single-release" | "multi-release";
type StatusFilter =
  | "all"
  | "working"
  | "pendingRelease"
  | "released"
  | "resolved"
  | "inDispute";

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = React.useState<T>(value);
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export function PollarMyEscrowsTab() {
  const { walletAddress } = usePollar();

  const [titleFilter, setTitleFilter] = React.useState("");
  const [type, setType] = React.useState<TypeFilter>("all");
  const [status, setStatus] = React.useState<StatusFilter>("all");

  const debouncedTitle = useDebouncedValue(titleFilter, 300);

  const queryParams = {
    signer: walletAddress ?? "",
    page: 1,
    orderBy: "createdAt" as const,
    orderDirection: "desc" as const,
    // Defensive defaults for the demo: don't filter by isActive (returns all),
    // and validate on-chain so freshly-deployed escrows surface even if the
    // indexer hasn't yet flipped their isActive flag.
    validateOnChain: true,
    title: debouncedTitle || undefined,
    type: type === "all" ? undefined : type,
    status: status === "all" ? undefined : status,
    enabled: !!walletAddress,
  };

  const { data, isLoading, isError, isFetching, refetch, dataUpdatedAt } =
    useEscrowsBySignerQuery(queryParams);

  const escrows = data ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title…"
            value={titleFilter}
            onChange={(e) => setTitleFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={type}
          onValueChange={(v) => setType(v as TypeFilter)}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="single-release">Single release</SelectItem>
            <SelectItem value="multi-release">Multi release</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as StatusFilter)}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="working">Working</SelectItem>
            <SelectItem value="pendingRelease">Pending release</SelectItem>
            <SelectItem value="released">Released</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="inDispute">In dispute</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          onClick={() => refetch()}
          disabled={isFetching}
          aria-label="Refresh"
          title="Refresh"
        >
          <RefreshCcw
            className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      <details className="text-xs text-muted-foreground rounded-md border border-border/40 bg-muted/10">
        <summary className="cursor-pointer px-3 py-2 font-mono">
          Debug · {escrows.length} escrow{escrows.length === 1 ? "" : "s"}
          {dataUpdatedAt
            ? ` · last refetch ${new Date(dataUpdatedAt).toLocaleTimeString()}`
            : ""}
        </summary>
        <pre className="px-3 pb-2 overflow-x-auto">
          {JSON.stringify(
            {
              signer: queryParams.signer,
              type: queryParams.type ?? null,
              status: queryParams.status ?? null,
              title: queryParams.title ?? null,
              validateOnChain: queryParams.validateOnChain,
              enabled: queryParams.enabled,
              isFetching,
              isError,
            },
            null,
            2,
          )}
        </pre>
      </details>

      {!walletAddress ? (
        <Empty className="border-border text-center">
          <EmptyHeader>
            <EmptyTitle>Wallet not connected</EmptyTitle>
            <EmptyDescription>
              Connect with Pollar (top-right) to see escrows where you are the
              signer.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading escrows…</p>
        </div>
      ) : isError ? (
        <Empty className="border-border text-center">
          <EmptyHeader>
            <EmptyTitle>Error loading escrows</EmptyTitle>
            <EmptyDescription>
              Something went wrong. Try again.
            </EmptyDescription>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="mt-4"
            >
              Retry
            </Button>
          </EmptyHeader>
        </Empty>
      ) : escrows.length === 0 ? (
        <Empty className="border-border text-center">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileX className="size-6 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>No escrows yet</EmptyTitle>
            <EmptyDescription>
              Deploy your first escrow from the <strong>Deploy</strong> tab and
              it will appear here. The indexer can take a few seconds to ingest
              a new escrow — click <strong>Refresh</strong> if you just
              deployed.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {escrows.map((escrow) => (
            <PollarEscrowCard
              key={escrow.contractId ?? escrow.engagementId}
              escrow={escrow}
            />
          ))}
        </div>
      )}
    </div>
  );
}
