"use client";

import { useQuery } from "@tanstack/react-query";
import {
    useGetEscrowsFromIndexerBySigner,
    useGetEscrowFromIndexerByContractIds
} from "@trustless-work/escrow/hooks";
import { GetEscrowsFromIndexerResponse as Escrow } from "@trustless-work/escrow/types";
import { useWalletContext } from "../../wallet-kit/WalletProvider";
import {
    groupEscrowsByType,
    groupEscrowsByDate,
    calculateMoMGrowth,
    calculateTotalAmount,
    calculateTotalBalance
} from "./aggregation";

export interface AdminAnalyticsData {
    totalEscrows: number;
    totalAmount: number;
    totalBalance: number;
    byType: ReturnType<typeof groupEscrowsByType>;
    byDate: ReturnType<typeof groupEscrowsByDate>;
    growthMoM: ReturnType<typeof calculateMoMGrowth>;
    raw: Escrow[];
}

export const useAdminEscrowAnalytics = (engagementId: string) => {
    const { walletAddress } = useWalletContext();
    const { getEscrowsBySigner } = useGetEscrowsFromIndexerBySigner();
    const { getEscrowByContractIds } = useGetEscrowFromIndexerByContractIds();

    const query = useQuery({
        queryKey: ["adminEscrowAnalytics", engagementId, walletAddress],
        enabled: !!engagementId && !!walletAddress,
        queryFn: async (): Promise<AdminAnalyticsData | null> => {
            if (!walletAddress) throw new Error("Wallet not connected");

            //Get list of escrows for the engagement
            const list = await getEscrowsBySigner({
                signer: walletAddress,
                engagementId,
            });

            if (!list || list.length === 0) {
                return {
                    totalEscrows: 0,
                    totalAmount: 0,
                    totalBalance: 0,
                    byType: [],
                    byDate: [],
                    growthMoM: [],
                    raw: [],
                };
            }

            //Mandated hook: useGetEscrowFromIndexerByContractIds
            const contractIds = list
                .map((e) => e.contractId)
                .filter((id): id is string => !!id);

            if (contractIds.length === 0) {
                return {
                    totalEscrows: 0,
                    totalAmount: 0,
                    totalBalance: 0,
                    byType: [],
                    byDate: [],
                    growthMoM: [],
                    raw: [],
                };
            }

            const detailedEscrows = await getEscrowByContractIds({
                contractIds,
                validateOnChain: false, 
            });

            if (!detailedEscrows) {
                throw new Error("Failed to fetch detailed escrows");
            }

            // Step 3: Aggregation
            return {
                totalEscrows: detailedEscrows.length,
                totalAmount: calculateTotalAmount(detailedEscrows),
                totalBalance: calculateTotalBalance(detailedEscrows),
                byType: groupEscrowsByType(detailedEscrows),
                byDate: groupEscrowsByDate(detailedEscrows),
                growthMoM: calculateMoMGrowth(detailedEscrows),
                raw: detailedEscrows,
            };
        },
        staleTime: 1000 * 60 * 5,
    });

    return query;
};
