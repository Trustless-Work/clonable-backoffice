import {
  MultiReleaseMilestone,
  SingleReleaseMilestone,
} from "@trustless-work/escrow";
import { GetEscrowsFromIndexerResponse as Escrow } from "@trustless-work/escrow/types";
import {
  EscrowMilestoneProgressMode,
  MilestoneProgressResult,
} from "./types";

/**
 * Checks if a milestone is released in multi-release escrow
 * @param milestone The milestone object
 * @returns true if milestone has flags.released set to true
 */
function isMilestoneReleased(
  milestone: SingleReleaseMilestone | MultiReleaseMilestone
): boolean {
  if ("flags" in milestone) {
    return (milestone as MultiReleaseMilestone).flags?.released === true;
  }
  return false;
}

/**
 * Checks if a milestone is approved in either single or multi-release escrow
 * @param milestone The milestone object
 * @returns true if milestone.approved is true (single-release) or flags.approved is true (multi-release)
 */
function isMilestoneApproved(
  milestone: SingleReleaseMilestone | MultiReleaseMilestone
): boolean {
  if ("flags" in milestone) {
    return (milestone as MultiReleaseMilestone).flags?.approved === true;
  } else {
    return (milestone as SingleReleaseMilestone).approved === true;
  }
}

/**
 * Calculates the progress of milestone completion in an escrow
 *
 * @param escrow The escrow object containing milestone data
 * @param mode The calculation mode: 'released' or 'approved'
 * @returns MilestoneProgressResult with calculation details and validation status
 * Validation Rules:
 * - For 'released' mode: escrow.type must be 'multi-release'
 * - For 'approved' mode: works with both 'single-release' and 'multi-release'
 *
 * Edge Cases:
 * - Zero milestones: Returns 0% progress
 * - Invalid mode + escrow type combination: Returns isValid: false
 */
export function calculateMilestoneProgress(
  escrow: Escrow | null | undefined,
  mode: EscrowMilestoneProgressMode
): MilestoneProgressResult {
  // Handle missing escrow
  if (!escrow) {
    return {
      totalMilestones: 0,
      completedMilestones: 0,
      percentage: 0,
      isValid: false,
      errorMessage: "Escrow data is not available",
    };
  }

  const milestones = escrow.milestones || [];
  const totalMilestones = milestones.length;

  // Handle zero milestones
  if (totalMilestones === 0) {
    return {
      totalMilestones: 0,
      completedMilestones: 0,
      percentage: 0,
      isValid: true,
      errorMessage: "",
    };
  }

  // Validation: 'released' mode only works with multi-release escrows
  if (mode === "released" && escrow.type !== "multi-release") {
    return {
      totalMilestones,
      completedMilestones: 0,
      percentage: 0,
      isValid: false,
      errorMessage:
        "'released' mode is only available for multi-release escrows",
    };
  }

  // Calculate completed milestones based on mode
  let completedMilestones = 0;

  if (mode === "released") {
    // Count released milestones (multi-release only)
    completedMilestones = milestones.filter(isMilestoneReleased).length;
  } else if (mode === "approved") {
    // Count approved milestones (both single and multi-release)
    completedMilestones = milestones.filter(isMilestoneApproved).length;
  }

  // Calculate percentage
  const percentage = Math.round((completedMilestones / totalMilestones) * 100);

  return {
    totalMilestones,
    completedMilestones,
    percentage: Math.min(100, Math.max(0, percentage)), // Clamp between 0-100
    isValid: true,
    errorMessage: "",
  };
}

/**
 * Hook for calculating milestone progress
 *
 * @param escrow The escrow object
 * @param mode The calculation mode
 * @returns MilestoneProgressResult
 */
export function useEscrowMilestoneProgress(
  escrow: Escrow | null | undefined,
  mode: EscrowMilestoneProgressMode
): MilestoneProgressResult {
  return calculateMilestoneProgress(escrow, mode);
}
