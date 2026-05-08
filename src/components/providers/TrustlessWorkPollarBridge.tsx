"use client";

import * as React from "react";
import { PollarProvider } from "@pollar/react";
import { useInitializeEscrow } from "@trustless-work/escrow";
import type { EscrowAdapter } from "@/lib/pollar/escrowAdapter.types";

interface TrustlessWorkPollarBridgeProps {
  children: React.ReactNode;
}

// Bridge component that lives inside <TrustlessWorkConfig>, extracts the
// Trustless Work signing functions (currently just `deployEscrow`), wraps
// them as a Pollar adapter, and mounts <PollarProvider> with that adapter.
//
// Descendants can then use `usePollarEscrow()` to call the signing ops
// without ever touching the unsigned XDR — Pollar signs and submits.
export function TrustlessWorkPollarBridge({
  children,
}: TrustlessWorkPollarBridgeProps) {
  const { deployEscrow: twDeployEscrow } = useInitializeEscrow();

  const escrow = React.useMemo<EscrowAdapter>(
    () => ({
      deployEscrow: async ({ payload, type }) => {
        const response = await twDeployEscrow(payload, type);
        if (!response.unsignedTransaction) {
          throw new Error(
            "Trustless Work deployEscrow returned no unsignedTransaction",
          );
        }
        return { unsignedTransaction: response.unsignedTransaction };
      },
    }),
    [twDeployEscrow],
  );

  const apiKey = process.env.NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY;

  if (!apiKey) {
    return (
      <div className="p-8 max-w-xl mx-auto mt-16 border border-destructive/40 bg-destructive/10 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">
          Pollar is not configured
        </h2>
        <p className="text-sm text-muted-foreground">
          Set <code>NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY</code> in your{" "}
          <code>.env</code> to enable the <code>/pollar</code> demo.
        </p>
      </div>
    );
  }

  return (
    <PollarProvider config={{ apiKey, baseUrl: 'http://localhost:3052' }} adapters={{ escrow }}>
      {children}
    </PollarProvider>
  );
}
