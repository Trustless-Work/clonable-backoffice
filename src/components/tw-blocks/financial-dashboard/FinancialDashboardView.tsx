"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFinancialDashboard } from "./useFinancialDashboard";
import type { FinancialDashboardTab } from "./useFinancialDashboard";
import { formatCurrency } from "../helpers/format.helper";
import { useWalletContext } from "../wallet-kit/WalletProvider";
import {
  Activity,
  Layers3,
  PiggyBank,
  CloudOff,
  Wallet,
  Loader2,
  FileX,
  Banknote,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
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
import { Button } from "@/components/ui/button";

const chartConfigAmountBar: ChartConfig = {
  desktop: { label: "Amount", color: "var(--chart-1)" },
};

const chartConfigTypeDonut: ChartConfig = {
  visitors: { label: "Count" },
  single: { label: "Single", color: "var(--chart-1)" },
  multi: { label: "Multi", color: "var(--chart-2)" },
};

const chartConfigCreatedArea: ChartConfig = {
  desktop: { label: "Created", color: "var(--chart-1)" },
};

export function FinancialDashboardView() {
  const [activeTab, setActiveTab] = useState<FinancialDashboardTab>("all");
  const { walletAddress } = useWalletContext();
  const financialData = useFinancialDashboard(activeTab);

  const amountByDateChartData = React.useMemo(
    () => financialData.amountsByDate.map((d) => ({ month: d.date, desktop: d.amount })),
    [financialData.amountsByDate]
  );

  const escrowTypeDonutData = React.useMemo(
    () =>
      financialData.typeSlices.map((s) => ({
        browser: s.type === "single" ? "single" : "multi",
        visitors: s.value,
        fill:
          s.type === "single" ? "var(--color-single)" : "var(--color-multi)",
      })),
    [financialData.typeSlices]
  );

  const createdByDateChartData = React.useMemo(
    () =>
      financialData.createdByDate.map((d) => ({ month: d.date, desktop: d.count })),
    [financialData.createdByDate]
  );

  if (!walletAddress) {
    return (
      <div className="grid gap-6 p-6 md:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Financial Dashboard
        </h1>
        <Empty className="border-border text-center">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Wallet className="size-6 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>Connect your wallet</EmptyTitle>
            <EmptyDescription>
              Connect your wallet to see your receiver dashboard and escrow
              totals.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  if (financialData.isLoading && financialData.totalEscrows === 0) {
    return (
      <div className="grid gap-6 p-6 md:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Financial Dashboard
        </h1>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FinancialDashboardTab)}>
          <TabsList className="h-12 w-fit rounded-lg p-1.5 text-sm">
            <TabsTrigger value="all" className="h-9 px-5">All</TabsTrigger>
            <TabsTrigger value="single" className="h-9 px-5">Single Release</TabsTrigger>
            <TabsTrigger value="multi" className="h-9 px-5">Multi Release</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
          <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Loading escrows…</p>
        </div>
      </div>
    );
  }

  if (financialData.isError) {
    return (
      <div className="grid gap-6 p-6 md:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Financial Dashboard
        </h1>
        <Empty className="border-border text-center">
          <EmptyHeader>
            <EmptyTitle>Error loading escrows</EmptyTitle>
            <EmptyDescription>
              Something went wrong. You can try again.
            </EmptyDescription>
            <Button variant="outline" onClick={() => financialData.refetch()} className="mt-4">
              Retry
            </Button>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  if (!financialData.isLoading && financialData.totalEscrows === 0) {
    return (
      <div className="grid gap-6 p-6 md:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Financial Dashboard
        </h1>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FinancialDashboardTab)}>
          <TabsList className="h-12 w-fit rounded-lg p-1.5 text-sm">
            <TabsTrigger value="all" className="h-9 px-5">All</TabsTrigger>
            <TabsTrigger value="single" className="h-9 px-5">Single Release</TabsTrigger>
            <TabsTrigger value="multi" className="h-9 px-5">Multi Release</TabsTrigger>
          </TabsList>
        </Tabs>
        <Empty className="border-border text-center">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileX className="size-6 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>No escrows as receiver</EmptyTitle>
            <EmptyDescription>
              You have no escrows where you are the receiver. Totals will appear
              here once you have incoming escrow activity.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div className="grid gap-6 p-6 md:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">
        Financial Dashboard
      </h1>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FinancialDashboardTab)}>
        <TabsList className="h-12 w-fit rounded-lg p-1.5 text-sm">
          <TabsTrigger value="all" className="h-9 px-5">All</TabsTrigger>
          <TabsTrigger value="single" className="h-9 px-5">Single Release</TabsTrigger>
          <TabsTrigger value="multi" className="h-9 px-5">Multi Release</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* KPI Cards: Total Amount, Total Released, Total Balance (spec), plus Escrows count */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="gap-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
            {financialData.isLoading ? "-" : formatCurrency(financialData.totalAmount, "USDC")}
            </div>
            <p className="text-xs text-muted-foreground">Sum of all escrow amounts (SR + MR)</p>
          </CardContent>
        </Card>
        <Card className="gap-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Released</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
            {financialData.isLoading ? "-" : formatCurrency(financialData.totalReleased, "USDC")}
            </div>
            <p className="text-xs text-muted-foreground">Released to you (SR + MR milestones)</p>
          </CardContent>
        </Card>
        <Card className="gap-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
            {financialData.isLoading ? "-" : formatCurrency(financialData.totalBalance, "USDC")}
            </div>
            <p className="text-xs text-muted-foreground">Pending (Total Amount − Released)</p>
          </CardContent>
        </Card>
        <Card className="gap-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escrows</CardTitle>
            <Layers3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
            {financialData.isLoading ? "-" : financialData.totalEscrows}
            </div>
            <p className="text-xs text-muted-foreground">Total number of escrows</p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="gap-3">
          <CardHeader>
            <CardTitle>Escrow Amounts</CardTitle>
            <CardDescription>Amounts by date</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="w-full h-56 sm:h-64 lg:h-72"
              config={chartConfigAmountBar}
            >
              {amountByDateChartData.length > 0 ? (
                <BarChart accessibilityLayer data={amountByDateChartData}>
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
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8} />
                </BarChart>
              ) : (
                <Empty className="border border-dashed">
                  <EmptyHeader>
                    <EmptyMedia variant="icon"><CloudOff /></EmptyMedia>
                    <EmptyTitle>No data</EmptyTitle>
                    <EmptyDescription>No Data Available</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle>Escrow Types</CardTitle>
            <CardDescription>Escrow types</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={chartConfigTypeDonut}
              className="w-full h-56 sm:h-64 lg:h-72"
            >
              {escrowTypeDonutData.some((d) => Number(d.visitors) > 0) ? (
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={escrowTypeDonutData}
                    dataKey="visitors"
                    nameKey="browser"
                    innerRadius={60}
                  >
                    {escrowTypeDonutData.map((slice, idx) => (
                      <Cell key={`cell-${idx}`} fill={slice.fill} />
                    ))}
                  </Pie>
                </PieChart>
              ) : (
                <Empty className="border border-dashed">
                  <EmptyHeader>
                    <EmptyMedia variant="icon"><CloudOff /></EmptyMedia>
                    <EmptyTitle>No data</EmptyTitle>
                    <EmptyDescription>No Data Available</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </ChartContainer>
            <div className="mt-4 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: "var(--chart-1)" }} />
                <span className="text-xs text-muted-foreground">Single</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: "var(--chart-2)" }} />
                <span className="text-xs text-muted-foreground">Multi</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Escrow Created</CardTitle>
            <CardDescription>Created escrows by date</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="w-full h-56 sm:h-64 lg:h-72"
              config={chartConfigCreatedArea}
            >
              {createdByDateChartData.length > 0 ? (
                <AreaChart
                  accessibilityLayer
                  data={createdByDateChartData}
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
                  <YAxis
                    hide
                    type="number"
                    domain={[0, (max: number) => Math.max(max, 1)]}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
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
                    <EmptyMedia variant="icon"><CloudOff /></EmptyMedia>
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
