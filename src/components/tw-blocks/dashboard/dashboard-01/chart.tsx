"use client";

import React from "react";
import { Tooltip as RechartsTooltip } from "recharts";

export type ChartConfig = Record<string, { label: string; color?: string }>;

interface ChartContainerProps {
  config: ChartConfig;
  className?: string;
  children: React.ReactNode;
}

export function ChartContainer({
  config,
  className,
  children,
}: ChartContainerProps) {
  const style: React.CSSProperties = {};
  for (const [key, value] of Object.entries(config)) {
    const varName = `--color-${key}` as const;
    if (value.color) (style as any)[varName] = value.color;
  }
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

type RechartsPayloadItem = {
  value?: number | string;
  dataKey?: string;
  color?: string;
  name?: string;
};

type RechartsTooltipContentProps = {
  active?: boolean;
  label?: string | number;
  payload?: RechartsPayloadItem[];
};

export type ChartTooltipContentProps = {
  hideLabel?: boolean;
  indicator?: "line" | "dot";
} & RechartsTooltipContentProps;

export function ChartTooltip(
  props: React.ComponentProps<typeof RechartsTooltip>
) {
  return <RechartsTooltip {...props} />;
}

export function ChartTooltipContent({
  active,
  label,
  payload,
  hideLabel,
}: ChartTooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-md border bg-background p-2 text-sm shadow-sm">
      {!hideLabel ? <div className="mb-1 font-medium">{label}</div> : null}
      <div className="space-y-1">
        {payload.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color }}
              aria-hidden
            />
            <span className="text-muted-foreground">
              {item.name ?? String(item.dataKey)}
            </span>
            <span className="font-medium ml-auto">
              {item.value as React.ReactNode}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
