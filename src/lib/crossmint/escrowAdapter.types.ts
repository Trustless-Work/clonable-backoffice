import type {
  EscrowType,
  InitializeMultiReleaseEscrowPayload,
  InitializeSingleReleaseEscrowPayload,
} from "@trustless-work/escrow/types";

// We'll import the response types from the SDK
import type { SendTransactionResponse } from "@trustless-work/escrow";

export type DeployEscrowAdapterParams = {
  payload:
    | InitializeSingleReleaseEscrowPayload
    | InitializeMultiReleaseEscrowPayload;
  type: EscrowType;
};

// The "Raw" version used by the Bridge/Adapter
// This matches what Trustless Work SDK returns before signing
export interface RawEscrowAdapter {
  deployEscrow: (params: DeployEscrowAdapterParams) => Promise<{ unsignedTransaction: string }>;
}

/**
 * The "Processed" version used by the UI/Context
 * This returns the result of the submission.
 * We use SendTransactionResponse which is the standard response from the SDK's sendTransaction method.
 */
export interface CrossmintEscrowAdapter {
  deployEscrow: (params: DeployEscrowAdapterParams) => Promise<SendTransactionResponse>;
}

export interface CrossmintContextType {
  adapters: {
    escrow?: CrossmintEscrowAdapter;
  };
  walletAddress: string | null;
  tx: {
    step: "idle" | "building" | "built" | "signing" | "success" | "error";
    hash?: string;
    details?: string;
  };
}
