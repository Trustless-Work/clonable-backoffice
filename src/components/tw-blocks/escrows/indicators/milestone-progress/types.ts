import { GetEscrowsFromIndexerResponse as Escrow } from "@trustless-work/escrow/types";

/**
 * Mode type for milestone progress calculation
 *
 * @typedef {('released' | 'approved')} EscrowMilestoneProgressMode
 *
 * - 'released': Calculate progress based on released milestones (multi-release only)
 * - 'approved': Calculate progress based on approved milestones (both single and multi-release)
 */
export type EscrowMilestoneProgressMode = 'released' | 'approved';

/**
 * Props for EscrowMilestoneProgress component
 */
export interface EscrowMilestoneProgressProps {
  /**
   * The escrow object containing milestone data
   */
  escrow: Escrow | null | undefined;

  /**
   * The mode for calculating progress:
   * - 'released': Count released milestones (requires multi-release escrow)
   * - 'approved': Count approved milestones (works with both types)
   */
  mode: EscrowMilestoneProgressMode;

  /**
   * Optional CSS class for the container
   */
  className?: string;

  /**
   * Optional flag to show text indicator (e.g., "3 of 10")
   * @default true
   */
  showText?: boolean;

  /**
   * Optional flag to show header with progress label and percentage
   * @default true
   */
  showHeader?: boolean;
}

/**
 * Result of milestone progress calculation
 */
export interface MilestoneProgressResult {
  /**
   * Total number of milestones
   */
  totalMilestones: number;

  /**
   * Number of milestones in the target state (released or approved)
   */
  completedMilestones: number;

  /**
   * Progress percentage (0-100)
   */
  percentage: number;

  /**
   * Whether the calculation is valid for the given mode and escrow type
   * False if attempting to use 'released' mode with single-release escrow
   */
  isValid: boolean;

  /**
   * Error message if calculation is invalid
   * Empty string if valid
   */
  errorMessage: string;
}

