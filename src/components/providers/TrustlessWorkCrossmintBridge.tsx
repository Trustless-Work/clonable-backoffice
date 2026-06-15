"use client";

import * as React from "react";
import {
  CrossmintProvider as CrossmintSdkProvider,
  CrossmintAuthProvider,
  CrossmintWalletProvider,
} from "@crossmint/client-sdk-react-ui";
import { useInitializeEscrow } from "@trustless-work/escrow";
import { CrossmintProvider } from "./CrossmintProvider";
import { RawEscrowAdapter } from "@/lib/crossmint/escrowAdapter.types";
import { ExecutorProvider } from "./ExecutorProvider";

const CROSSMINT_API_KEY =
  process.env.NEXT_PUBLIC_CROSSMINT_API_KEY || "";
const HAS_VALID_CROSSMINT_KEY = CROSSMINT_API_KEY.startsWith("ck_");

interface TrustlessWorkCrossmintBridgeProps {
  children: React.ReactNode;
}

export function TrustlessWorkCrossmintBridge({
  children,
}: TrustlessWorkCrossmintBridgeProps) {
  const { deployEscrow: twDeployEscrow } = useInitializeEscrow();

  const escrow = React.useMemo<RawEscrowAdapter>(
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

  return (
    <>
      {HAS_VALID_CROSSMINT_KEY ? (
        <CrossmintSdkProvider apiKey={CROSSMINT_API_KEY}>
          <CrossmintAuthProvider loginMethods={["email", "google"]}>
            <CrossmintWalletProvider
              createOnLogin={{
                chain: "stellar",
                // Note: Crossmint now exclusively provides Smart Wallets (C... addresses) for Stellar.
                // This is currently incompatible with the Trustless Work API which expects G... addresses.
                // See docs/CROSSMINT_FINDINGS.md for details.
                recovery: { type: "email" },
              }}
            >
              <CrossmintProvider adapters={{ escrow }}>
                <ExecutorProvider crossmintEnabled={true}>
                  {children}
                </ExecutorProvider>
              </CrossmintProvider>
            </CrossmintWalletProvider>
          </CrossmintAuthProvider>
        </CrossmintSdkProvider>
      ) : (
        children
      )}
    </>
  );
}
