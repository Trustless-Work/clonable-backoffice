"use client";

import * as React from "react";
import { GetEscrowsFromIndexerResponse as Escrow } from "@trustless-work/escrow/types";
import {
  useEscrowMilestoneProgress,
} from "../useEscrowMilestoneProgress";
import {
  EscrowMilestoneProgressMode,
  EscrowMilestoneProgressProps,
} from "../types";

/**
 * Milestone Progress Donut Component
 *
 * Displays a circular progress indicator (donut/pie chart style) showing the percentage
 * of milestones that have been released (multi-release) or approved (both types).
 *
 * Features:
 * - Circular SVG progress indicator with smooth animations
 * - Responsive sizing (default 160px)
 * - Customizable colors based on status
 * - Center text showing percentage
 * - Validation of mode+escrow type compatibility
 * - Clear error handling
 * - Optional label showing "X of Y milestones"
 */
export const EscrowMilestoneProgressDonut: React.FC<EscrowMilestoneProgressProps> = ({
  escrow,
  mode,
  className = "",
  showText = true,
}) => {
  const { percentage, completedMilestones, totalMilestones, isValid, errorMessage } =
    useEscrowMilestoneProgress(escrow as Escrow, mode as EscrowMilestoneProgressMode);

  // Handle invalid configuration
  if (!isValid) {
    return (
      <div className={`w-full ${className}`}>
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
            {errorMessage}
          </p>
        </div>
      </div>
    );
  }

  // SVG Configuration
  const size = 160; // px
  const stroke = 12; // px
  const normalizedRadius = (size - stroke) / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Determine color based on progress
  const getProgressColor = () => {
    if (percentage === 0) return "hsl(var(--muted))";
    if (percentage < 33) return "hsl(var(--destructive))";
    if (percentage < 66) return "hsl(var(--yellow-500))";
    return "hsl(var(--primary))";
  };

  return (
    <div className={`w-full flex flex-col items-center ${className}`}>
      {/* Donut visualization */}
      <div className="relative inline-flex items-center justify-center">
        <svg
          height={size}
          width={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            stroke="hsl(var(--muted))"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Progress circle */}
          <circle
            stroke={getProgressColor()}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + " " + circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={size / 2}
            cy={size / 2}
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Center text */}
        <div className="absolute flex flex-col items-center justify-center">
          <p className="text-3xl font-bold text-foreground">
            {percentage}%
          </p>
          <p className="text-xs text-muted-foreground">
            {mode === "released" ? "Released" : "Approved"}
          </p>
        </div>
      </div>

      {/* Optional label below */}
      {showText && totalMilestones > 0 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-foreground">
            <span className="font-semibold">{completedMilestones}</span>
            {" of "}
            <span className="font-semibold">{totalMilestones}</span>
            {" milestones"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {mode === "released" ? "Released" : "Approved"}
          </p>
        </div>
      )}

      {/* Empty state */}
      {totalMilestones === 0 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            No milestones
          </p>
        </div>
      )}
    </div>
  );
};

export default EscrowMilestoneProgressDonut;
