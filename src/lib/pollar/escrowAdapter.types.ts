import type { EscrowAdapter as PollarEscrowAdapter, EscrowFn } from "@pollar/core";
import type {
  EscrowType,
  InitializeMultiReleaseEscrowPayload,
  InitializeSingleReleaseEscrowPayload,
} from "@trustless-work/escrow/types";

export type DeployEscrowAdapterParams = {
  payload:
    | InitializeSingleReleaseEscrowPayload
    | InitializeMultiReleaseEscrowPayload;
  type: EscrowType;
};

// V1: only `deployEscrow` is wired. The other 7 Trustless Work signing ops
// (fundEscrow, releaseFunds, approveMilestone, changeMilestoneStatus,
// startDispute, resolveDispute, updateEscrow) follow the same pattern and
// will be added in a follow-up.
export interface EscrowAdapter extends PollarEscrowAdapter {
  deployEscrow: EscrowFn<DeployEscrowAdapterParams>;
}
