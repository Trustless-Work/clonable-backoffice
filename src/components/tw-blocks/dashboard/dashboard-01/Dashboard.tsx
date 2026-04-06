"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useDashboard } from "./useDashboard";
import { formatCurrency } from "../../helpers/format.helper";
import { Activity, Layers3, PiggyBank, CloudOff } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

const chartConfigBar: ChartConfig = {
  desktop: {
    label: "Amount",
    color: "var(--chart-1)",
  },
};

const chartConfigDonut: ChartConfig = {
  visitors: { label: "Count" },
  single: { label: "Single", color: "var(--chart-1)" },
  multi: { label: "Multi", color: "var(--chart-2)" },
};

const chartConfigArea: ChartConfig = {
  desktop: {
    label: "Created",
    color: "var(--chart-1)",
  },
};

export const Dashboard01 = () => {
  const {
    isLoading,
    totalEscrows,
    totalAmount,
    totalBalance,
    typeSlices,
    amountsByDate,
    createdByDate,
  } = useDashboard();

  const barData = React.useMemo(
    () => amountsByDate.map((d) => ({ month: d.date, desktop: d.amount })),
    [amountsByDate]
  );

  const donutData = React.useMemo(
    () =>
      typeSlices.map((s) => ({
        browser: s.type === "single" ? "single" : "multi",
        visitors: s.value,
        fill:
          s.type === "single" ? "var(--color-single)" : "var(--color-multi)",
      })),
    [typeSlices]
  );

  const areaData = React.useMemo(
    () => createdByDate.map((d) => ({ month: d.date, desktop: d.count })),
    [createdByDate]
  );

  return (
    <div className="grid gap-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="gap-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escrows</CardTitle>
            <Layers3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "-" : totalEscrows}
            </div>
            <p className="text-xs text-muted-foreground">
              Total number of escrows
            </p>
          </CardContent>
        </Card>

        <Card className="gap-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "-" : formatCurrency(totalAmount, "USDC")}
            </div>
            <p className="text-xs text-muted-foreground">
              Sum of amounts (SR + MR)
            </p>
          </CardContent>
        </Card>

        <Card className="gap-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "-" : formatCurrency(totalBalance, "USDC")}
            </div>
            <p className="text-xs text-muted-foreground">
              Total balance across all escrows
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar chart: Amounts by date (shadcn pattern) */}
        <Card className="gap-3">
          <CardHeader>
            <CardTitle>Escrow Amounts</CardTitle>
            <CardDescription>Amounts by date</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="w-full h-56 sm:h-64 lg:h-72"
              config={chartConfigBar}
            >
              {barData.length > 0 ? (
                <BarChart accessibilityLayer data={barData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) =>
                      new Date(String(value)).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar
                    dataKey="desktop"
                    fill="var(--color-desktop)"
                    radius={8}
                  />
                </BarChart>
              ) : (
                <Empty className="border border-dashed">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <CloudOff />
                    </EmptyMedia>
                    <EmptyTitle>No data</EmptyTitle>
                    <EmptyDescription>No Data Available</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Donut chart: Escrow types (shadcn pattern) */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle>Escrow Types</CardTitle>
            <CardDescription>Escrow types</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={chartConfigDonut}
              className="w-full h-56 sm:h-64 lg:h-72"
            >
              {donutData.some((d) => Number(d.visitors) > 0) ? (
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={donutData}
                    dataKey="visitors"
                    nameKey="browser"
                    innerRadius={60}
                  >
                    {donutData.map((slice, idx) => (
                      <Cell key={`cell-${idx}`} fill={slice.fill} />
                    ))}
                  </Pie>
                </PieChart>
              ) : (
                <Empty className="border border-dashed">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <CloudOff />
                    </EmptyMedia>
                    <EmptyTitle>No data</EmptyTitle>
                    <EmptyDescription>No Data Available</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </ChartContainer>
            <div className="mt-4 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: "var(--chart-1)" }}
                />
                <span className="text-xs text-muted-foreground">Single</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: "var(--chart-2)" }}
                />
                <span className="text-xs text-muted-foreground">Multi</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Area chart: Created escrows (shadcn pattern) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Escrow Created</CardTitle>
            <CardDescription>Created escrows by date</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="w-full h-56 sm:h-64 lg:h-72"
              config={chartConfigArea}
            >
              {areaData.length > 0 ? (
                <AreaChart
                  accessibilityLayer
                  data={areaData}
                  margin={{ left: 12, right: 12 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) =>
                      new Date(String(value)).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Area
                    dataKey="desktop"
                    type="natural"
                    fill="var(--color-desktop)"
                    fillOpacity={0.4}
                    stroke="var(--color-desktop)"
                  />
                </AreaChart>
              ) : (
                <Empty className="border border-dashed">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <CloudOff />
                    </EmptyMedia>
                    <EmptyTitle>No data</EmptyTitle>
                    <EmptyDescription>No Data Available</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
