"use client";

import * as React from "react";
import { Progress } from "@/components/ui/progress";
import { GetEscrowsFromIndexerResponse as Escrow } from "@trustless-work/escrow/types";
import {
  useEscrowMilestoneProgress,
} from "../useEscrowMilestoneProgress";
import {
  EscrowMilestoneProgressMode,
  EscrowMilestoneProgressProps,
} from "../types";

/**
 * Milestone Progress Bar Component
 *
 * Displays a horizontal progress bar showing the percentage of milestones
 * that have been released (multi-release) or approved (both types).
 *
 * Features:
 * - Dynamic progress calculation based on milestone states
 * - Validation of mode+escrow type compatibility
 * - Clear error handling for invalid configurations
 * - Optional text indicator showing "X of Y milestones"
 * - Responsive design with Tailwind CSS
 */
export const EscrowMilestoneProgressBar: React.FC<EscrowMilestoneProgressProps> = ({
  escrow,
  mode,
  className = "",
  showText = true,
  showHeader = true,
}) => {
  const { percentage, completedMilestones, totalMilestones, isValid, errorMessage } =
    useEscrowMilestoneProgress(escrow as Escrow, mode as EscrowMilestoneProgressMode);

  // Handle invalid configuration
  if (!isValid) {
    if (showHeader) {
      return (
        <div className={`w-full ${className}`}>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
              {errorMessage}
            </p>
          </div>
        </div>
      );
    } else {
      // For compact mode, just show empty progress bar
      return (
        <div className={`w-full ${className}`}>
          <Progress value={0} className="w-full" />
        </div>
      );
    }
  }

  // Handle zero milestones
  if (totalMilestones === 0) {
    return (
      <div className={`w-full ${className}`}>
        {showHeader && (
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>No milestones</span>
          </div>
        )}
        <Progress value={0} className="w-full" />
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Header with percentage only */}
      {showHeader && (
        <div className="flex justify-end text-sm text-muted-foreground mb-2">
          <p>
            <span className="font-bold">{percentage}%</span>
          </p>
        </div>
      )}

      {/* Progress bar */}
      <Progress value={percentage} className="w-full" />

      {/* Optional text indicator */}
      {showText && (
        <div className="mt-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">
            {completedMilestones}
          </span>
          {" of "}
          <span className="font-semibold text-foreground">
            {totalMilestones}
          </span>
          {" milestones "}
          <span>{mode === "released" ? "released" : "approved"}</span>
        </div>
      )}
    </div>
  );
};

export default EscrowMilestoneProgressBar;
