"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { WalletButton } from "@/components/tw-blocks/wallet-kit/WalletButtons";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Briefcase } from "lucide-react";

const ServiceProviderTableNoSSR = dynamic(
    () =>
        import(
            "@/components/tw-blocks/escrows/service-provider/ServiceProviderTable"
        ).then((m) => m.ServiceProviderTable),
    {
        ssr: false,
        loading: () => null,
    }
);

/**
 * Service Provider Workspace Page
 *
 * This page displays all escrows where the connected wallet is the service provider.
 * It provides a dedicated workspace for service providers to view and manage their escrows.
 *
 * Features:
 * - Wallet connection requirement
 * - Escrows table filtered by service provider role
 * - Empty, loading, and error state handling
 * - Navigation to escrow details
 *
 * Route: /service-provider
 */
export default function ServiceProviderWorkspace() {
    return (
        <div className="font-sans grid grid-rows-[auto_1fr_20px] items-start justify-items-center min-h-screen p-8 pb-20 gap-8 sm:p-20">
            {/* Header */}
            <header className="flex justify-between items-center w-full">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-4">
                        <Image
                            src="/favicon.ico"
                            alt="Trustless Work"
                            width={48}
                            height={48}
                        />

                        <h2 className="text-2xl font-bold uppercase border-l-2 border-primary pl-4">
                            Backoffice
                        </h2>
                    </Link>
                </div>

                <WalletButton />
            </header>

            {/* Main Content */}
            <main className="flex flex-col gap-6 row-start-2 items-center sm:items-start w-full">
                {/* Navigation and Role Banner */}
                <div className="flex flex-col gap-4 w-full">
                    {/* Back Link */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Backoffice
                    </Link>

                    {/* Role Explanation Banner */}
                    <div className="w-full bg-primary/10 border border-primary/20 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
                                <Briefcase className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-foreground">
                                    Service Provider Workspace
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    You are viewing escrows where you are assigned as the{" "}
                                    <span className="font-medium text-primary">
                                        Service Provider
                                    </span>
                                    . This is your workspace for delivering work on escrow
                                    milestones.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Escrows Table */}
                <div id="escrows-section" className="w-full">
                    <Suspense fallback={null}>
                        <ServiceProviderTableNoSSR />
                    </Suspense>
                </div>
            </main>
        </div>
    );
}
