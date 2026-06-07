"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Hammer,
  Info,
  Layers3,
  Loader2,
  Sparkles,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateFromTxHash } from "@trustless-work/escrow";
import type {
  EscrowType,
  InitializeMultiReleaseEscrowPayload,
  InitializeSingleReleaseEscrowPayload,
} from "@trustless-work/escrow/types";
import { useEscrowsMutations } from "@/components/tw-blocks/tanstack/useEscrowsMutations";
import { useTransactionExecutor } from "@/components/providers/ExecutorProvider";
import {
  EmbeddedAuthForm,
  useWallet as useCrossmintWallet,
  useCrossmintAuth,
} from "@crossmint/client-sdk-react-ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CrossmintMyEscrowsTab } from "@/components/crossmint-demo/CrossmintMyEscrowsTab";

const USDC_TESTNET_TRUSTLINE = {
  address: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
  symbol: "USDC",
};

const CROSSMINT_API_KEY = process.env.NEXT_PUBLIC_CROSSMINT_API_KEY || "";
const HAS_VALID_CROSSMINT_KEY =
  CROSSMINT_API_KEY.startsWith("ck") || CROSSMINT_API_KEY.startsWith("sk");

function FieldLabel({
  htmlFor,
  children,
  hint,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  hint: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Label
        htmlFor={htmlFor}
        className="font-bold text-xs uppercase tracking-wider text-muted-foreground"
      >
        {children}
      </Label>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground transition-colors cursor-help"
            aria-label="More info"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="max-w-xs text-xs leading-relaxed"
        >
          {hint}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function CrossmintDemoPageContent() {
  const { wallet: crossmintWallet, status: crossmintStatus } =
    useCrossmintWallet();
  const { logout } = useCrossmintAuth();
  const { deployEscrow } = useEscrowsMutations();
  const { setMode } = useTransactionExecutor();
  const { updateFromTxHash } = useUpdateFromTxHash();
  const queryClient = useQueryClient();

  const activeWalletAddress = crossmintWallet?.address;

  // Debug logging for wallet information
  React.useEffect(() => {
    if (crossmintStatus === "loaded") {
      console.log("[Crossmint] Wallet Loaded:", {
        address: crossmintWallet?.address,
        publicKey: (crossmintWallet as any)?.publicKey,
        owner: (crossmintWallet as any)?.owner,
        signer: (crossmintWallet as any)?.signer,
        fullWallet: crossmintWallet,
        status: crossmintStatus,
        config: {
          chain: "stellar",
          type: "mpc",
          recovery: { type: "email" }
        }
      });
    }
    setMode("crossmint");
  }, [crossmintWallet, crossmintStatus, setMode]);


  const [escrowType, setEscrowType] =
    React.useState<EscrowType>("single-release");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [amount, setAmount] = React.useState<string>("");
  const [platformFee, setPlatformFee] = React.useState<string>("");
  const [milestoneDescription, setMilestoneDescription] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [lastTxHash, setLastTxHash] = React.useState<string | null>(null);

  const handleDeploy = async () => {
    if (!activeWalletAddress) {
      toast.error("Connect your wallet first");
      return;
    }

    // Basic Stellar address validation
    // G... = Public Key, C... = Contract ID (Smart Wallet)
    const isValidStellarAddress = (addr: string) =>
      (addr.startsWith("G") || addr.startsWith("C")) && addr.length === 56;

    if (!isValidStellarAddress(activeWalletAddress)) {
      console.error(
        "[Crossmint] Invalid Stellar address:",
        activeWalletAddress,
      );
      toast.error(
        "Invalid wallet address format. Expected a Stellar Public Key (G...) or Contract ID (C...).",
      );
      return;
    }

    // For the API call, we MUST use a G... address.
    // If the wallet is a Smart Wallet (C...), we need the signer.
    if (activeWalletAddress.startsWith("C")) {
      toast.error("Platform Mismatch Detected", {
        description:
          "Crossmint provides a Smart Wallet ('C...'), but Trustless Work API requires a Traditional Account ('G...'). See docs/CROSSMINT_FINDINGS.md.",
        duration: 8000,
      });
      console.error(
        "[Crossmint] API compatibility error: Wallet address starts with 'C', but 'G' address is required for the payload. The current API version does not support Soroban Contract IDs as signers.",
      );
      return;
    }

    const displayTitle = title || "Crossmint Escrow";
    const displayDescription =
      description || "Escrow created via the executor abstraction demo.";
    const numericAmount = Number(amount) || 10;
    const numericPlatformFee = Number(platformFee) || 5;
    const displayMilestone =
      milestoneDescription || "Complete the first deliverable";

    const baseRoles = {
      approver: activeWalletAddress,
      serviceProvider: activeWalletAddress,
      platformAddress: activeWalletAddress,
      releaseSigner: activeWalletAddress,
      disputeResolver: activeWalletAddress,
    };

    setIsSubmitting(true);
    try {
      let txHash: string | undefined;

      if (escrowType === "single-release") {
        const payload: InitializeSingleReleaseEscrowPayload = {
          signer: activeWalletAddress,
          engagementId: `CROSS-${Date.now()}`,
          title: displayTitle,
          description: displayDescription,
          amount: numericAmount,
          platformFee: numericPlatformFee,
          roles: { ...baseRoles, receiver: activeWalletAddress },
          trustline: USDC_TESTNET_TRUSTLINE,
          milestones: [{ description: displayMilestone }],
        };
        const response = await deployEscrow.mutateAsync({
          payload,
          type: "single-release",
          address: activeWalletAddress,
        });
        txHash = (response as { hash?: string }).hash;
      } else {
        const payload: InitializeMultiReleaseEscrowPayload = {
          signer: activeWalletAddress,
          engagementId: `CROSS-${Date.now()}`,
          title: displayTitle,
          description: displayDescription,
          platformFee: numericPlatformFee,
          roles: baseRoles,
          trustline: USDC_TESTNET_TRUSTLINE,
          milestones: [
            {
              description: displayMilestone,
              amount: numericAmount,
              receiver: activeWalletAddress,
            },
          ],
        };
        const response = await deployEscrow.mutateAsync({
          payload,
          type: "multi-release",
          address: activeWalletAddress,
        });
        txHash = (response as { hash?: string }).hash;
      }

      if (txHash) {
        setLastTxHash(txHash);
        try {
          await updateFromTxHash({ txHash });
        } catch (syncError) {
          console.warn(
            "[Crossmint] Indexer sync failed, escrow may take a moment to appear",
            syncError,
          );
        }

        toast.success("Escrow deployed successfully!");
        queryClient.invalidateQueries({ queryKey: ["escrows"] });

        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ["escrows"] });
        }, 3000);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to deploy escrow");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-sans max-w-6xl mx-auto px-4 py-8 md:py-16">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="p-3 bg-white dark:bg-[#1A1C1E] shadow-sm rounded-xl hover:shadow-md transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#111111] dark:bg-white rounded-lg flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white dark:text-[#111111]" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Crossmint</h1>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                Integration Spike
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-3 md:items-end w-full md:w-auto">
          {crossmintStatus === "loaded" ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    logout();
                    toast.success("Logged out successfully");
                  }}
                  className="group rounded-xl border border-[#F0F2F5] dark:border-[#2C2E33] bg-white dark:bg-[#1A1C1E] px-4 py-3 text-right shadow-sm hover:border-destructive/30 hover:bg-destructive/5 transition-all cursor-pointer"
                >
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold group-hover:text-destructive transition-colors">
                    Connected Crossmint wallet
                  </p>
                  <p className="text-xs font-mono break-all max-w-[240px]">
                    {crossmintWallet?.address || "Awaiting wallet"}
                  </p>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Click to log out</TooltipContent>
            </Tooltip>
          ) : crossmintStatus === "in-progress" ? (
            <div className="w-full md:w-[500px] rounded-2xl border border-[#F0F2F5] dark:border-[#2C2E33] bg-white dark:bg-[#1A1C1E] p-6 shadow-sm flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#20C997]" />
              <p className="text-sm font-bold">Connecting wallet…</p>
              <p className="text-xs text-muted-foreground text-center">
                Please complete the sign-in flow in the popup.
              </p>
            </div>
          ) : (
            <div className="w-full md:w-[500px] rounded-2xl border border-[#F0F2F5] dark:border-[#2C2E33] bg-white dark:bg-[#1A1C1E] p-6 shadow-sm">
              <div className="space-y-4">
                <EmbeddedAuthForm />
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white dark:bg-[#1A1C1E] p-6 rounded-2xl shadow-sm border border-[#F0F2F5] dark:border-[#2C2E33]">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Layers3 className="h-4 w-4 text-[#20C997]" />
              Escrow Lifecycle
            </h3>
            <div className="space-y-4">
              {[
                {
                  icon: <Hammer />,
                  title: "Deploy",
                  desc: "Unsigned XDR to signed submission",
                  status: "complete",
                },
                {
                  icon: <Wallet />,
                  title: "Fund",
                  desc: "Lock USDC in escrow",
                  status: "pending",
                },
                {
                  icon: <CheckCircle2 />,
                  title: "Release",
                  desc: "Transfer funds to provider",
                  status: "pending",
                },
              ].map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${i === 0 ? "bg-[#20C997] text-white" : "bg-[#F0F2F5] dark:bg-[#2C2E33] text-muted-foreground"}`}
                  >
                    {React.cloneElement(step.icon as React.ReactElement, {
                      className: "h-4 w-4",
                    })}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-[#111111] dark:bg-white p-6 rounded-2xl text-white dark:text-[#111111]">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Abstraction first
            </h3>
            <p className="text-sm opacity-80 leading-relaxed">
              The deploy flow now goes through a transaction executor, so the
              wallet implementation can be swapped without touching the escrow
              lifecycle logic.
            </p>
            <Button
              variant="link"
              className="p-0 h-auto text-white dark:text-[#111111] font-bold mt-4 text-xs gap-1"
            >
              Read Security Docs <Info className="h-3 w-3" />
            </Button>
          </section>

          {lastTxHash && (
            <section className="bg-[#20C997]/10 border border-[#20C997]/20 p-5 rounded-2xl">
              <p className="text-sm font-bold text-[#20C997] mb-1 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Last deployment hash
              </p>
              <p className="text-xs font-mono break-all opacity-70 mb-3">
                {lastTxHash}
              </p>
              <Button asChild variant="outline" size="sm" className="w-full">
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${lastTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Stellar Expert
                </a>
              </Button>
            </section>
          )}
        </div>

        <div className="lg:col-span-8">
          <Tabs defaultValue="deploy" className="w-full">
            <TabsList className="bg-[#F0F2F5] dark:bg-[#2C2E33] p-1 rounded-xl h-12 mb-8">
              <TabsTrigger
                value="deploy"
                className="rounded-lg font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-[#1A1C1E] data-[state=active]:shadow-sm px-8"
              >
                Deploy
              </TabsTrigger>
              <TabsTrigger
                value="my-escrows"
                className="rounded-lg font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-[#1A1C1E] data-[state=active]:shadow-sm px-8"
              >
                My Escrows
              </TabsTrigger>
            </TabsList>

            <TabsContent value="deploy" className="space-y-6">
              <Card className="border-none shadow-sm bg-white dark:bg-[#1A1C1E] rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-[#F0F2F5] dark:border-[#2C2E33] pb-6">
                  <CardTitle className="text-xl font-black">
                    Escrow Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <FieldLabel
                        htmlFor="escrow-type"
                        hint="Choose between a single payout or milestone-based payments."
                      >
                        Escrow Type
                      </FieldLabel>
                      <Select
                        value={escrowType}
                        onValueChange={(v) => setEscrowType(v as EscrowType)}
                      >
                        <SelectTrigger
                          id="escrow-type"
                          className="bg-[#F8F9FA] dark:bg-[#0B0C0D] border-none h-12 font-medium"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single-release">
                            Single Release
                          </SelectItem>
                          <SelectItem value="multi-release">
                            Multi Release
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <FieldLabel
                        htmlFor="title"
                        hint="A recognizable name for this engagement."
                      >
                        Project Title
                      </FieldLabel>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Crossmint Escrow"
                        className="bg-[#F8F9FA] dark:bg-[#0B0C0D] border-none h-12 font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <FieldLabel
                      htmlFor="description"
                      hint="Describe the scope of work for this escrow."
                    >
                      Project Description
                    </FieldLabel>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Escrow created via the executor abstraction demo."
                      className="bg-[#F8F9FA] dark:bg-[#0B0C0D] border-none min-h-[100px] font-medium py-3"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <FieldLabel
                        htmlFor="amount"
                        hint="The total amount of USDC for this escrow/milestone."
                      >
                        Amount (USDC)
                      </FieldLabel>
                      <Input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="10"
                        className="bg-[#F8F9FA] dark:bg-[#0B0C0D] border-none h-12 font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel
                        htmlFor="platform-fee"
                        hint="Percentage of the total amount that goes to the platform."
                      >
                        Platform Fee (%)
                      </FieldLabel>
                      <Input
                        id="platform-fee"
                        type="number"
                        value={platformFee}
                        onChange={(e) => setPlatformFee(e.target.value)}
                        placeholder="5"
                        className="bg-[#F8F9FA] dark:bg-[#0B0C0D] border-none h-12 font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <FieldLabel
                      htmlFor="milestone"
                      hint="What needs to be delivered for this payout."
                    >
                      Milestone Deliverable
                    </FieldLabel>
                    <Input
                      id="milestone"
                      value={milestoneDescription}
                      onChange={(e) => setMilestoneDescription(e.target.value)}
                      placeholder="Complete the first deliverable"
                      className="bg-[#F8F9FA] dark:bg-[#0B0C0D] border-none h-12 font-medium"
                    />
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={handleDeploy}
                      disabled={isSubmitting || !activeWalletAddress}
                      className="w-full bg-[#111111] dark:bg-white text-white dark:text-[#111111] hover:bg-black/90 dark:hover:bg-white/90 h-14 rounded-xl font-black text-lg gap-2 transition-all active:scale-[0.98]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-5 w-5" />
                          Deploy Escrow
                        </>
                      )}
                    </Button>
                    {!activeWalletAddress && (
                      <p className="text-center text-xs text-muted-foreground mt-3 font-medium">
                        Connect the selected wallet to enable deployment.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="my-escrows">
              <CrossmintMyEscrowsTab walletAddress={activeWalletAddress} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function CrossmintSetupFallback() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0C0D] text-[#111111] dark:text-[#EEEEEE] flex items-center justify-center px-4">
      <Card className="w-full max-w-xl border-none shadow-sm bg-white dark:bg-[#1A1C1E] rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-[#F0F2F5] dark:border-[#2C2E33] pb-6">
          <CardTitle className="text-xl font-black">
            Crossmint demo setup required
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8 space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Set <code className="font-mono">NEXT_PUBLIC_CROSSMINT_API_KEY</code>
            to a real Crossmint publishable key to enable the Crossmint wallet
            mode on this route.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The rest of the app still works with Stellar Wallet Kit while this
            key is missing.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CrossmintDemoPage() {
  if (!HAS_VALID_CROSSMINT_KEY) {
    return <CrossmintSetupFallback />;
  }

  return <CrossmintDemoPageContent />;
}
