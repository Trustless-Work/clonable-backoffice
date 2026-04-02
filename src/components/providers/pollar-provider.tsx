"use client";
import { PollarProvider } from "@pollar/react";
import type { ReactNode } from "react";

export function PollarWalletProvider({ children }: { children: ReactNode }) {
  return (
    <PollarProvider
      config={{
        apiKey: process.env.NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY ?? "",
        stellarNetwork: "testnet",
      }}
    >
      {children}
    </PollarProvider>
  );
}
