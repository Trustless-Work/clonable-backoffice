import { GetEscrowsFromIndexerResponse as Escrow } from "@trustless-work/escrow/types";
import { startOfMonth, format } from "date-fns";

export interface ChartDataPoint {
    date: string;
    count: number;
}

export interface TypeDataPoint {
    type: string;
    count: number;
    fill?: string;
}

export interface GrowthDataPoint {
    month: string;
    count: number;
    growth: number;
}

/**
 * Groups escrows by their type (single-release vs multi-release)
 */
export const groupEscrowsByType = (escrows: Escrow[]): TypeDataPoint[] => {
    const types = escrows.reduce((acc, escrow) => {
        const type = escrow.type || "unknown";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(types).map(([type, count]) => ({
        type: type === "single-release" ? "Single Release" : "Multi Release",
        count,
    }));
};

/**
 * Groups escrows by creation date (YYYY-MM-DD) for trend analysis
 */
export const groupEscrowsByDate = (escrows: Escrow[]): ChartDataPoint[] => {
    const groups = escrows.reduce((acc, escrow) => {
        const date = new Date(escrow.createdAt._seconds * 1000);
        const dateKey = format(date, "yyyy-MM-dd");
        acc[dateKey] = (acc[dateKey] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(groups)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({
            date,
            count,
        }));
};

/**
 * Calculates month-over-month growth percentages
 */
export const calculateMoMGrowth = (escrows: Escrow[]): GrowthDataPoint[] => {
    const months: Record<string, number> = {};

    // Sort escrows by date
    const sortedEscrows = [...escrows].sort((a, b) => a.createdAt._seconds - b.createdAt._seconds);

    if (sortedEscrows.length === 0) return [];

    // Get range of months
    const firstDate = new Date(sortedEscrows[0].createdAt._seconds * 1000);
    const lastDate = new Date(sortedEscrows[sortedEscrows.length - 1].createdAt._seconds * 1000);

    let current = startOfMonth(firstDate);
    const end = startOfMonth(lastDate);

    while (current <= end) {
        const monthKey = format(current, "yyyy-MM");
        months[monthKey] = 0;
        current = startOfMonth(new Date(current.setMonth(current.getMonth() + 1)));
    }

    // Count escrows per month
    sortedEscrows.forEach(escrow => {
        const date = new Date(escrow.createdAt._seconds * 1000);
        const monthKey = format(date, "yyyy-MM");
        if (months[monthKey] !== undefined) {
            months[monthKey]++;
        }
    });

    const monthEntries = Object.entries(months).sort(([a], [b]) => a.localeCompare(b));

    return monthEntries.map(([month, count], index) => {
        let growth = 0;
        if (index > 0) {
            const prevCount = monthEntries[index - 1][1];
            if (prevCount === 0) {
                growth = count > 0 ? 100 : 0; 
            } else {
                growth = ((count - prevCount) / prevCount) * 100;
            }
        }

        return {
            month: format(new Date(month + "-01"), "MMM yy"),
            count,
            growth: Math.round(growth * 100) / 100, 
        };
    });
};

/**
 * Calculates the sum of amounts across all escrows (SR + MR)
 */
export const calculateTotalAmount = (escrows: Escrow[]): number => {
    return escrows.reduce((acc, escrow) => {
        if (escrow.type === "single-release") {
            return acc + (escrow.amount || 0);
        }
        // For multi-release, amount is the sum of milestones
        const milestoneSum = escrow.milestones?.reduce(
            (mAcc, m) => mAcc + ((m as { amount?: number }).amount || 0),
            0
        ) || 0;
        return acc + milestoneSum;
    }, 0);
};

/**
 * Calculates the total balance across all escrows
 */
export const calculateTotalBalance = (escrows: Escrow[]): number => {
    return escrows.reduce((acc, escrow) => acc + (escrow.balance || 0), 0);
};
