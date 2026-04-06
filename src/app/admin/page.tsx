"use client";

import React, { useState, useEffect } from "react";
import { AdminEscrowAnalyticsDashboard } from "@/components/tw-blocks/escrows/admin-analytics";
import { WalletButton } from "@/components/tw-blocks/wallet-kit/WalletButtons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Search, Filter } from "lucide-react";

export default function AdminPage() {
    const [inputValue, setInputValue] = useState("");
    const [engagementId, setEngagementId] = useState("");

    useEffect(() => {
        const saved = localStorage.getItem("admin_last_engagement_id");
        if (saved) {
            setInputValue(saved);
            setEngagementId(saved);
        }
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setEngagementId(inputValue);
        if (inputValue) {
            localStorage.setItem("admin_last_engagement_id", inputValue);
        } else {
            localStorage.removeItem("admin_last_engagement_id");
        }
    };

    return (
        <div className="font-sans min-h-screen p-8 sm:p-20 bg-background/95">
            <header className="flex justify-between items-center w-full mb-12">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-accent rounded-full transition-colors">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <div className="flex items-center gap-4">
                        <Image
                            src="/favicon.ico"
                            alt="Trustless Work"
                            width={40}
                            height={40}
                        />
                        <h2 className="text-xl font-bold uppercase border-l-2 border-primary pl-4 pointer-events-none">
                            Admin Portal
                        </h2>
                    </div>
                </div>

                <WalletButton />
            </header>

            <main className="max-w-7xl mx-auto flex flex-col gap-10">
                <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-end justify-between bg-card/40 backdrop-blur-md border border-border/40 rounded-2xl p-8 shadow-sm">
                    <div className="space-y-2 text-center lg:text-left flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
                        <p className="text-muted-foreground max-w-md">
                            Monitor escrow performance, financial breakdown, and engagement health metrics across the Trustless Work ecosystem.
                        </p>
                    </div>

                    <div className="w-full lg:max-w-md">
                        <form onSubmit={handleSearch} className="flex flex-col gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                                    <Search className="w-4 h-4 text-primary" />
                                    Engagement Identifier
                                </label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search (e.g. ENG-123)..."
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            className="h-11 pl-10 text-base border-border/60 focus:border-primary/60 bg-background/80 transition-shadow shadow-xs focus:shadow-md"
                                        />
                                    </div>
                                    <Button type="submit" size="default" className="h-11 px-6 gap-2 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95">
                                        View
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="mt-4">
                    {engagementId ? (
                        <AdminEscrowAnalyticsDashboard engagementId={engagementId} />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed border-border/50 rounded-2xl bg-card/30 text-muted-foreground gap-4">
                            <div className="p-4 bg-muted/50 rounded-full">
                                <Search className="h-8 w-8 opacity-20" />
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-medium text-foreground/70">No Engagement Selected</p>
                                <p className="text-sm">Search for an engagement ID above to view the dashboard.</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
