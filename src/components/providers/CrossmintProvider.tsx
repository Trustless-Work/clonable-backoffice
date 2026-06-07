"use client";

import * as React from "react";
import { useWallet } from "@crossmint/client-sdk-react-ui";
import { useSendTransaction } from "@trustless-work/escrow";
import { 
  CrossmintContextType, 
  RawEscrowAdapter, 
  DeployEscrowAdapterParams, 
  CrossmintEscrowAdapter 
} from "@/lib/crossmint/escrowAdapter.types";

const CrossmintContext = React.createContext<CrossmintContextType | undefined>(undefined);

export function CrossmintProvider({
  children,
  adapters,
}: {
  children: React.ReactNode;
  adapters: { escrow?: RawEscrowAdapter };
}) {
  const { wallet } = useWallet();
  const walletAddress = wallet?.address;
  const { sendTransaction } = useSendTransaction();
  const [tx, setTx] = React.useState<CrossmintContextType["tx"]>({ step: "idle" });

  const wrappedEscrowAdapter = React.useMemo<CrossmintEscrowAdapter | undefined>(() => {
    if (!adapters.escrow) return undefined;

    return {
      deployEscrow: async (params: DeployEscrowAdapterParams) => {
        if (!walletAddress) throw new Error("Wallet not connected");

        setTx({ step: "building" });
        try {
          // 1. Get unsigned transaction from the bridge (Trustless Work SDK)
          const { unsignedTransaction } = await adapters.escrow!.deployEscrow(params);
          setTx({ step: "built" });

          // 2. Crossmint handles signing and submission via its own flow
          // Note: In the current implementation, we might want to use the executor 
          // but if we are in this adapter, we are explicitly doing Crossmint.
          setTx({ step: "signing" });
          
          // For now, this adapter seems to be a placeholder or used in specific contexts.
          // The main flow uses useEscrowsMutations which uses the Executor.
          
          throw new Error("CrossmintProvider adapter not fully implemented. Use the Executor instead.");
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Unknown error";
          setTx({ step: "error", details: message });
          throw error;
        }
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
