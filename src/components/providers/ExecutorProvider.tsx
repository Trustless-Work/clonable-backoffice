"use client";

import * as React from "react";
import { useCrossmintExecutor, useStellarWalletKitExecutor } from "@/lib/executors/useExecutors";
import { TransactionExecutor } from "@/lib/executors/types";

export type WalletMode = "wallet-kit" | "crossmint";

interface ExecutorContextType {
  executor: TransactionExecutor;
  mode: WalletMode;
  setMode: (mode: WalletMode) => void;
}

const ExecutorContext = React.createContext<ExecutorContextType | undefined>(
  undefined
);

function WalletOnlyExecutorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const walletKitExecutor = useStellarWalletKitExecutor();

  const setMode = React.useCallback((mode: WalletMode) => {
    if (mode === "wallet-kit") {
      return;
    }
  }, []);

  return (
    <ExecutorContext.Provider
      value={{
        executor: walletKitExecutor,
        mode: "wallet-kit",
        setMode,
      }}
    >
      {children}
    </ExecutorContext.Provider>
  );
}

function CrossmintEnabledExecutorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setMode] = React.useState<WalletMode>("wallet-kit");
  const walletKitExecutor = useStellarWalletKitExecutor();
  const crossmintExecutor = useCrossmintExecutor();
  const executor =
    mode === "wallet-kit" ? walletKitExecutor : crossmintExecutor;

  return (
    <ExecutorContext.Provider value={{ executor, mode, setMode }}>
      {children}
    </ExecutorContext.Provider>
  );
}

export function ExecutorProvider({
  children,
  crossmintEnabled = true,
}: {
  children: React.ReactNode;
  crossmintEnabled?: boolean;
}) {
  if (!crossmintEnabled) {
    return <WalletOnlyExecutorProvider>{children}</WalletOnlyExecutorProvider>;
  }

  return (
    <CrossmintEnabledExecutorProvider>
      {children}
    </CrossmintEnabledExecutorProvider>
  );
}

export function useTransactionExecutor() {
  const context = React.useContext(ExecutorContext);
  if (!context) {
    throw new Error("useTransactionExecutor must be used within ExecutorProvider");
  }
  return context;
}

export function useOptionalTransactionExecutor() {
  return React.useContext(ExecutorContext);
}
