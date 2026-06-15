import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  EscrowType,
  FundEscrowPayload,
  InitializeMultiReleaseEscrowPayload,
  InitializeSingleReleaseEscrowPayload,
  UpdateMultiReleaseEscrowPayload,
  UpdateSingleReleaseEscrowPayload,
  useFundEscrow,
  useInitializeEscrow,
  useUpdateEscrow,
  ChangeMilestoneStatusPayload,
  useChangeMilestoneStatus,
  ApproveMilestonePayload,
  useApproveMilestone,
  useSendTransaction,
  useStartDispute,
  useReleaseFunds,
  useResolveDispute,
  MultiReleaseStartDisputePayload,
  SingleReleaseStartDisputePayload,
  MultiReleaseReleaseFundsPayload,
  SingleReleaseReleaseFundsPayload,
  MultiReleaseResolveDisputePayload,
  SingleReleaseResolveDisputePayload,
  WithdrawRemainingFundsPayload,
  useWithdrawRemainingFunds,
} from "@trustless-work/escrow";
import { signTransaction } from "../wallet-kit/wallet-kit";
import { useWalletContext } from "@/components/tw-blocks/wallet-kit/WalletProvider";
import { ExecutionMetadata, ExecutionResult } from "@/lib/executors/types";
import { useOptionalTransactionExecutor } from "@/components/providers/ExecutorProvider";


/**
 * Use the mutations to interact with the escrows
 *
 * - Deploy Escrow
 * - Update Escrow
 * - Fund Escrow
 * - Change Milestone Status
 * - Approve Milestone
 * - Start Dispute
 * - Release Funds
 * - Resolve Dispute
 */
export const useEscrowsMutations = () => {
  const queryClient = useQueryClient();
  const { deployEscrow } = useInitializeEscrow();
  const { updateEscrow } = useUpdateEscrow();
  const { fundEscrow } = useFundEscrow();
  const { changeMilestoneStatus } = useChangeMilestoneStatus();
  const { approveMilestone } = useApproveMilestone();
  const { sendTransaction } = useSendTransaction();
  const { startDispute } = useStartDispute();
  const { releaseFunds } = useReleaseFunds();
  const { resolveDispute } = useResolveDispute();
  const { withdrawRemainingFunds } = useWithdrawRemainingFunds();
  const { walletAddress } = useWalletContext();
  const executorContext = useOptionalTransactionExecutor();

  const executeTransaction = async (
    unsignedTransaction: string,
    metadata?: ExecutionMetadata,
    address?: string,
  ): Promise<ExecutionResult> => {
    // Use the executor from context if available (handles both crossmint and wallet-kit modes)
    if (executorContext) {
      return executorContext.executor.execute(unsignedTransaction, metadata);
    }

    // Fallback: direct Wallet Kit flow (for routes without ExecutorProvider)
    const signerAddress = address || walletAddress;
    if (!signerAddress) {
      throw new Error("Wallet not connected");
    }

    try {
      const signedTxXdr = await signTransaction({
        unsignedTransaction,
        address: signerAddress,
      });

      if (!signedTxXdr) {
        throw new Error("Signed transaction is missing.");
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
  };

  /**
   * Deploy Escrow
   */
  const deployEscrowMutation = useMutation({
    mutationFn: async ({
      payload,
      type,
      address,
    }: {
      payload:
        | InitializeSingleReleaseEscrowPayload
        | InitializeMultiReleaseEscrowPayload;
      type: EscrowType;
      address: string;
    }) => {
      if (process.env.NODE_ENV === "development") {
        console.log("[useEscrowsMutations] Deploying escrow:", { type, payload });
      }
      
      try {
        const deployResponse = (await deployEscrow(payload, type)) as unknown as {
          unsignedTransaction?: string;
          contractId: string;
          escrow: unknown;
          message: string;
          status: string;
        };
        const { unsignedTransaction, contractId } = deployResponse;

        if (process.env.NODE_ENV === "development") {
          console.log("[useEscrowsMutations] Deploy response received:", { contractId, hasUnsignedTx: !!unsignedTransaction });
        }

        if (!unsignedTransaction) {
          throw new Error(
            "Unsigned transaction is missing from deployEscrow response.",
          );
        }

        const executionResult = await executeTransaction(
          unsignedTransaction,
          { contractId },
          address,
        );

        if (executionResult.status !== "SUCCESS") {
          throw new Error(executionResult.error || "Transaction failed to send");
        }

        return {
          ...deployResponse,
          payload,
          type,
          contractId,
          hash: executionResult.hash,
          explorerLink: executionResult.explorerLink,
          transactionStatus: executionResult.status,
        };
      } catch (error: unknown) {
        console.error("[useEscrowsMutations] Full error object:", error);
        if (
          typeof error === "object" &&
          error !== null &&
          "response" in error &&
          typeof (error as any).response === "object"
        ) {
          const axiosError = error as {
            response: { status: number; data?: any };
          };
          console.error(
            "[useEscrowsMutations] Deploy failed with status",
            axiosError.response.status,
            ":",
            JSON.stringify(axiosError.response.data, null, 2),
          );
          const message =
            axiosError.response.data?.message ||
            axiosError.response.data?.error ||
            JSON.stringify(axiosError.response.data) ||
            "Deploy failed";

          // Show a descriptive toast for API errors
          toast.error(`API Error (${axiosError.response.status}): ${message}`, {
            duration: 5000,
          });

          throw new Error(`API Error: ${message}`);
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  /**
   * Update Escrow
   */
  const updateEscrowMutation = useMutation({
    mutationFn: async ({
      payload,
      type,
      address,
    }: {
      payload:
        | UpdateSingleReleaseEscrowPayload
        | UpdateMultiReleaseEscrowPayload;
      type: EscrowType;
      address: string;
    }) => {
      if (process.env.NODE_ENV === "development") {
        console.log("[useEscrowsMutations] Updating escrow:", { type, payload });
      }
      
      try {
        const updateResponse = (await updateEscrow(payload, type)) as {
          unsignedTransaction?: string;
          contractId: string;
          message: string;
          status: string;
        };
        const { unsignedTransaction, contractId } = updateResponse;

        if (!unsignedTransaction) {
          throw new Error(
            "Unsigned transaction is missing from updateEscrow response.",
          );
        }

        const executionResult = await executeTransaction(
          unsignedTransaction,
          { contractId },
          address,
        );

        if (executionResult.status !== "SUCCESS") {
          throw new Error(executionResult.error || "Transaction failed to send");
        }

        return {
          ...updateResponse,
          payload,
          type,
          contractId,
          hash: executionResult.hash,
          explorerLink: executionResult.explorerLink,
          transactionStatus: executionResult.status,
        };
      } catch (error: unknown) {
        console.error("[useEscrowsMutations] Update failed:", error);
        if (
          typeof error === "object" &&
          error !== null &&
          "response" in error &&
          typeof (error as any).response === "object"
        ) {
          const axiosError = error as {
            response: { status: number; data?: any };
          };
          const message =
            axiosError.response.data?.message ||
            axiosError.response.data?.error ||
            JSON.stringify(axiosError.response.data);
          toast.error(`Update Error (${axiosError.response.status}): ${message}`);
          throw new Error(`API Error: ${message}`);
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  /**
   * Fund Escrow
   */
  const fundEscrowMutation = useMutation({
    mutationFn: async ({
      payload,
      type,
      address,
    }: {
      payload: FundEscrowPayload;
      type: EscrowType;
      address: string;
    }) => {
      const { unsignedTransaction } = await fundEscrow(payload, type);

      if (!unsignedTransaction) {
        throw new Error(
          "Unsigned transaction is missing from fundEscrow response.",
        );
      }

      const executionResult = await executeTransaction(
        unsignedTransaction,
        { contractId: payload.contractId },
        address,
      );

      if (executionResult.status !== "SUCCESS") {
        throw new Error(executionResult.error || "Transaction failed to send");
      }

      return executionResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  /**
   * Approve Milestone
   */
  const approveMilestoneMutation = useMutation({
    mutationFn: async ({
      payload,
      type,
      address,
    }: {
      payload: ApproveMilestonePayload;
      type: EscrowType;
      address: string;
    }) => {
      const { unsignedTransaction } = await approveMilestone(payload, type);

      if (!unsignedTransaction) {
        throw new Error(
          "Unsigned transaction is missing from approveMilestone response.",
        );
      }

      const executionResult = await executeTransaction(
        unsignedTransaction,
        { contractId: payload.contractId },
        address,
      );

      if (executionResult.status !== "SUCCESS") {
        throw new Error(executionResult.error || "Transaction failed to send");
      }

      return executionResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  /**
   * Change Milestone Status
   */
  const changeMilestoneStatusMutation = useMutation({
    mutationFn: async ({
      payload,
      type,
      address,
    }: {
      payload: ChangeMilestoneStatusPayload;
      type: EscrowType;
      address: string;
    }) => {
      const { unsignedTransaction } = await changeMilestoneStatus(
        payload,
        type,
      );

      if (!unsignedTransaction) {
        throw new Error(
          "Unsigned transaction is missing from changeMilestoneStatus response.",
        );
      }

      const executionResult = await executeTransaction(
        unsignedTransaction,
        { contractId: payload.contractId },
        address,
      );

      if (executionResult.status !== "SUCCESS") {
        throw new Error(executionResult.error || "Transaction failed to send");
      }

      return executionResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  /**
   * Start Dispute
   */
  const startDisputeMutation = useMutation({
    mutationFn: async ({
      payload,
      type,
      address,
    }: {
      payload:
        | MultiReleaseStartDisputePayload
        | SingleReleaseStartDisputePayload;
      type: EscrowType;
      address: string;
    }) => {
      const { unsignedTransaction } = await startDispute(payload, type);

      if (!unsignedTransaction) {
        throw new Error(
          "Unsigned transaction is missing from startDispute response.",
        );
      }

      const executionResult = await executeTransaction(
        unsignedTransaction,
        { contractId: payload.contractId },
        address,
      );

      if (executionResult.status !== "SUCCESS") {
        throw new Error(executionResult.error || "Transaction failed to send");
      }

      return executionResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  /**
   * Release Funds
   */
  const releaseFundsMutation = useMutation({
    mutationFn: async ({
      payload,
      type,
      address,
    }: {
      payload:
        | MultiReleaseReleaseFundsPayload
        | SingleReleaseReleaseFundsPayload;
      type: EscrowType;
      address: string;
    }) => {
      const { unsignedTransaction } = await releaseFunds(payload, type);

      if (!unsignedTransaction) {
        throw new Error(
          "Unsigned transaction is missing from releaseFunds response.",
        );
      }

      const executionResult = await executeTransaction(
        unsignedTransaction,
        { contractId: payload.contractId },
        address,
      );

      if (executionResult.status !== "SUCCESS") {
        throw new Error(executionResult.error || "Transaction failed to send");
      }

      return executionResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  /**
   * Resolve Dispute
   */
  const resolveDisputeMutation = useMutation({
    mutationFn: async ({
      payload,
      type,
      address,
    }: {
      payload:
        | MultiReleaseResolveDisputePayload
        | SingleReleaseResolveDisputePayload;
      type: EscrowType;
      address: string;
    }) => {
      const { unsignedTransaction } = await resolveDispute(payload, type);

      if (!unsignedTransaction) {
        throw new Error(
          "Unsigned transaction is missing from resolveDispute response.",
        );
      }

      const executionResult = await executeTransaction(
        unsignedTransaction,
        { contractId: payload.contractId },
        address,
      );

      if (executionResult.status !== "SUCCESS") {
        throw new Error(executionResult.error || "Transaction failed to send");
      }

      return executionResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  /**
   * Withdraw Remaining Funds
   */
  const withdrawRemainingFundsMutation = useMutation({
    mutationFn: async ({
      payload,
      address,
    }: {
      payload: WithdrawRemainingFundsPayload;
      address: string;
    }) => {
      const { unsignedTransaction } = await withdrawRemainingFunds(payload);

      if (!unsignedTransaction) {
        throw new Error(
          "Unsigned transaction is missing from withdrawRemainingFunds response.",
        );
      }

      const executionResult = await executeTransaction(
        unsignedTransaction,
        { contractId: payload.contractId },
        address,
      );

      if (executionResult.status !== "SUCCESS") {
        throw new Error(executionResult.error || "Transaction failed to send");
      }

      return executionResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  return {
    deployEscrow: deployEscrowMutation,
    updateEscrow: updateEscrowMutation,
    fundEscrow: fundEscrowMutation,
    changeMilestoneStatus: changeMilestoneStatusMutation,
    approveMilestone: approveMilestoneMutation,
    startDispute: startDisputeMutation,
    releaseFunds: releaseFundsMutation,
    resolveDispute: resolveDisputeMutation,
    withdrawRemainingFunds: withdrawRemainingFundsMutation,
  };
};
