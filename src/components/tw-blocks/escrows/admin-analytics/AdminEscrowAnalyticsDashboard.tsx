"use client";

import React from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Area,
    AreaChart,
    Pie,
    PieChart,
    XAxis,
    YAxis,
    Cell,
} from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
} from "@/components/ui/empty";
import { useAdminEscrowAnalytics } from "./useAdminEscrowAnalytics";
import {
    Hash,
    TrendingUp,
    Banknote,
    Coins,
    RefreshCcw,
    BarChart3,
    Layers,
    Calendar,
    Loader2,
    AlertCircle,
    CloudOff,
} from "lucide-react";
import { formatCurrency } from "../../helpers/format.helper";
import { Button } from "@/components/ui/button";

// Config for charts
const chartConfig: ChartConfig = {
    count: {
        label: "Escrows",
        color: "hsl(var(--chart-1))",
    },
    single: {
        label: "Single Release",
        color: "hsl(var(--chart-1))",
    },
    multi: {
        label: "Multi Release",
        color: "hsl(var(--chart-2))",
    },
    growth: {
        label: "Growth %",
        color: "hsl(var(--chart-3))",
    },
};

export const AdminEscrowAnalyticsDashboard = ({ engagementId }: { engagementId: string }) => {
    const { data, isLoading, isError, error, refetch, isFetching } = useAdminEscrowAnalytics(engagementId);

    if (isLoading) {
        return (
            <div className="flex h-[400px] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (isError) {
        return (
            <Empty className="h-[400px] border border-dashed">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <AlertCircle className="text-destructive" />
                    </EmptyMedia>
                    <EmptyTitle>Error loading analytics</EmptyTitle>
                    <EmptyDescription>{(error as Error)?.message}</EmptyDescription>
                </EmptyHeader>
                <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
                    Try Again
                </Button>
            </Empty>
        );
    }

    if (!data || data.totalEscrows === 0) {
        return (
            <Empty className="h-[400px] border border-dashed">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <CloudOff />
                    </EmptyMedia>
                    <EmptyTitle>No data found</EmptyTitle>
                    <EmptyDescription>No escrow data available for this engagement.</EmptyDescription>
                </EmptyHeader>
            </Empty>
        );
    }

    const currency = data.raw[0]?.trustline?.symbol || "USDC";

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                        Escrow statistics for engagement <span className="font-mono text-primary font-medium">{engagementId}</span>
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="h-9 w-9 border-border/60 bg-background/80 hover:bg-muted/80 transition-colors shadow-sm"
                    title="Refresh Data"
                >
                    <RefreshCcw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Escrows</CardTitle>
                        <Hash className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.totalEscrows}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Contracts in engagement
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border/50 font-sans">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                        <Banknote className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(data.totalAmount, currency)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Sum of amounts (SR + MR)
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border/50 font-sans">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                        <Coins className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(data.totalBalance, currency)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Total remaining balance
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">MoM Growth</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {data.growthMoM.length > 0
                                ? `${data.growthMoM[data.growthMoM.length - 1].growth}%`
                                : "0%"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Escrow creation growth
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Separator className="opacity-50" />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Charts Area */}
                <Card className="col-span-1 md:col-span-2 lg:col-span-2 bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Layers className="h-4 w-4 text-primary" /> Escrows by Type
                        </CardTitle>
                        <CardDescription>Distribution of escrow structures</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px] pb-4">
                        <ChartContainer config={chartConfig} className="h-full w-full">
                            <PieChart>
                                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                <Pie
                                    data={data.byType}
                                    dataKey="count"
                                    nameKey="type"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    stroke="transparent"
                                >
                                    {data.byType.map((_: unknown, index: number) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={index === 0 ? "white" : "hsl(var(--primary))"}
                                        />
                                    ))}
                                </Pie>
                                <ChartLegend content={<ChartLegendContent />} />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-2 lg:col-span-5 bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" /> Escrows by Date
                        </CardTitle>
                        <CardDescription>Trend of escrow creation over time</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px] pb-4">
                        <ChartContainer config={chartConfig} className="h-full w-full">
                            <AreaChart data={data.byDate} margin={{ left: 12, right: 12, top: 12 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tickFormatter={(value) => value.slice(5)} // Show MM-DD
                                />
                                <YAxis tickLine={false} axisLine={false} />
                                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                                <Area
                                    dataKey="count"
                                    type="natural"
                                    fill="white"
                                    fillOpacity={0.4}
                                    stroke="white"
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-2 lg:col-span-3 bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-primary" /> Escrows by Date (Bar Chart)
                        </CardTitle>
                        <CardDescription>Daily escrow creation metrics</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px] pb-4">
                        <ChartContainer config={chartConfig} className="h-full w-full">
                            <BarChart data={data.byDate} margin={{ top: 12 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tickFormatter={(value) => value.slice(5)}
                                />
                                <YAxis tickLine={false} axisLine={false} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar
                                    dataKey="count"
                                    fill="white"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={40}
                                />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-2 lg:col-span-4 bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-primary" /> Growth % Escrows by Month
                        </CardTitle>
                        <CardDescription>Month-over-month growth analytics</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px] pb-4">
                        <ChartContainer config={chartConfig} className="h-full w-full">
                            <BarChart data={data.growthMoM} margin={{ top: 12 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                />
                                <YAxis tickLine={false} axisLine={false} unit="%" />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="growth" radius={[4, 4, 0, 0]} maxBarSize={40}>
                                    {data.growthMoM.map((_: unknown, index: number) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={index === data.growthMoM.length - 1 ? "white" : "hsl(var(--primary) / 0.3)"}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
