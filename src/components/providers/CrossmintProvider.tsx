"use client";

import * as React from "react";
import { useWallet } from "@crossmint/client-sdk-react-ui";
import {
  CrossmintContextType,
  RawEscrowAdapter,
  CrossmintEscrowAdapter,
  DeployEscrowAdapterParams,
} from "@/lib/crossmint/escrowAdapter.types";

const CrossmintContext = React.createContext<CrossmintContextType | undefined>(undefined);

/**
 * CrossmintProvider wraps the Crossmint wallet SDK and provides a context-based
 * escrow adapter. This is a secondary integration path — the primary escrow flow
 * uses useEscrowsMutations which delegates to the TransactionExecutor from
 * ExecutorProvider (see src/lib/executors/useExecutors.ts).
 *
 * This provider is included in the TrustlessWorkCrossmintBridge for the /crossmint
 * demo route, but the actual transaction execution is handled by ExecutorProvider
 * with mode="crossmint".
 */
export function CrossmintProvider({
  children,
  adapters,
}: {
  children: React.ReactNode;
  adapters: { escrow?: RawEscrowAdapter };
}) {
  const { wallet } = useWallet();
  const walletAddress = wallet?.address;
  const [tx, setTx] = React.useState<CrossmintContextType["tx"]>({ step: "idle" });

  const wrappedEscrowAdapter = React.useMemo<CrossmintEscrowAdapter | undefined>(() => {
    if (!adapters.escrow) return undefined;

    return {
      deployEscrow: async (_params: DeployEscrowAdapterParams) => {
        if (!walletAddress) throw new Error("Wallet not connected");

        setTx({ step: "error", details: "Direct adapter path not implemented — use ExecutorProvider with mode='crossmint' instead" });
        throw new Error(
          "CrossmintProvider adapter path is not implemented. " +
          "Use ExecutorProvider with mode='crossmint' for transaction execution. " +
          "See src/lib/executors/useExecutors.ts for the Crossmint executor."
        );
      },
    };
  }, [adapters.escrow, walletAddress]);

  return (
    <CrossmintContext.Provider value={{ adapters: { escrow: wrappedEscrowAdapter }, walletAddress: walletAddress || null, tx }}>
      {children}
    </CrossmintContext.Provider>
  );
}

export function useCrossmint() {
  const context = React.useContext(CrossmintContext);
  if (!context) throw new Error("useCrossmint must be used within CrossmintProvider");
  return context;
}
