/**
 * Escrow Milestone Progress Indicator Components
 *
 * This module provides reusable progress indicator components and utilities
 * for visualizing milestone progress in escrow contracts.
 *
 * Components:
 * - EscrowMilestoneProgressBar: Horizontal progress bar
 * - EscrowMilestoneProgressDonut: Circular progress indicator
 *
 * Hooks:
 * - useEscrowMilestoneProgress: Calculate milestone progress
 *
 * Types:
 * - EscrowMilestoneProgressMode: 'released' | 'approved'
 * - EscrowMilestoneProgressProps: Component props interface
 * - MilestoneProgressResult: Hook return type
 */
 

// Types
export type {
  EscrowMilestoneProgressMode,
  EscrowMilestoneProgressProps,
  MilestoneProgressResult,
} from "./types";

// Hook and utilities
export { useEscrowMilestoneProgress, calculateMilestoneProgress } from "./useEscrowMilestoneProgress";

// Components
export { EscrowMilestoneProgressBar } from "./bar/EscrowMilestoneProgress";
export { EscrowMilestoneProgressDonut } from "./donut/EscrowMilestoneProgress";
