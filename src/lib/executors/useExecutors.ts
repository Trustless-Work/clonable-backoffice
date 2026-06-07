"use client";

import { useSendTransaction } from "@trustless-work/escrow";
import { signTransaction } from "@/components/tw-blocks/wallet-kit/wallet-kit";
import { useWalletContext } from "@/components/tw-blocks/wallet-kit/WalletProvider";
import {
  ExecutionMetadata,
  ExecutionResult,
  TransactionExecutor,
} from "./types";
import { useWallet, StellarWallet } from "@crossmint/client-sdk-react-ui";

/**
 * Stellar Wallet Kit Executor Implementation
 */
export function useStellarWalletKitExecutor(): TransactionExecutor {
  const { sendTransaction } = useSendTransaction();
  const { walletAddress } = useWalletContext();

  return {
    execute: async (
      unsignedXdr: string,
      _metadata?: ExecutionMetadata
    ): Promise<ExecutionResult> => {
      void _metadata;
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }

      try {
        const signedTxXdr = await signTransaction({
          unsignedTransaction: unsignedXdr,
          address: walletAddress,
        });

        if (!signedTxXdr) {
          throw new Error("signTransaction produced an empty XDR. User may have cancelled or signing failed.");
        }

        const response = await sendTransaction(signedTxXdr);
        const hash = (response as { hash?: string }).hash || "";

        if (response.status === "SUCCESS") {
          return {
            hash,
            status: "SUCCESS",
            explorerLink: hash
              ? `https://stellar.expert/explorer/testnet/tx/${hash}`
              : undefined,
          };
        }

        return {
          hash,
          status: "ERROR",
          error: "Transaction failed",
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
          hash: "",
          status: "ERROR",
          error: message,
        };
      }
    },
  };
}

/**
 * Crossmint Executor Implementation
 */
export function useCrossmintExecutor(): TransactionExecutor {
  const { wallet } = useWallet();

  return {
    execute: async (
      unsignedXdr: string,
      metadata?: ExecutionMetadata
    ): Promise<ExecutionResult> => {
      if (!wallet) {
        throw new Error("Crossmint wallet not loaded");
      }

      if (!metadata?.contractId) {
        throw new Error("Crossmint requires a contractId for transaction submission");
      }

      try {
        const stellarWallet = StellarWallet.from(wallet);
        const result = await stellarWallet.sendTransaction({
          transaction: unsignedXdr,
          contractId: metadata.contractId,
        });

        return {
          hash: result.hash,
          status: "SUCCESS",
          explorerLink: result.explorerLink,
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
          hash: "",
          status: "ERROR",
          error: message,
        };
      }
    },
  };
}
