"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Hammer,
  Info,
  Layers3,
  ListTree,
  Loader2,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { usePollar, WalletButton } from "@pollar/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { useUpdateFromTxHash } from "@trustless-work/escrow";
import { usePollarEscrow } from "@/lib/pollar/usePollarEscrow";
import type {
  EscrowType,
  InitializeMultiReleaseEscrowPayload,
  InitializeSingleReleaseEscrowPayload,
} from "@trustless-work/escrow/types";
import { PollarMyEscrowsTab } from "@/components/pollar-demo/PollarMyEscrowsTab";

const USDC_TESTNET_TRUSTLINE = {
  address: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
  symbol: "USDC",
};

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
      <Label htmlFor={htmlFor}>{children}</Label>
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
        <TooltipContent side="right" className="max-w-xs text-xs leading-relaxed">
          {hint}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function LifecycleStep({
  icon,
  title,
  cost,
  description,
  highlight,
}: {
  icon: React.ReactNode;
  title: string;
  cost: string;
  description: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex-1 min-w-[160px] rounded-md border p-3 ${
        highlight
          ? "border-primary/40 bg-primary/5"
          : "border-border/40 bg-muted/20"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className={highlight ? "text-primary" : "text-muted-foreground"}>
          {icon}
        </span>
        <span className="text-sm font-medium">{title}</span>
      </div>
      <p className="text-xs text-muted-foreground leading-snug mb-2">
        {description}
      </p>
      <Badge variant="outline" className="text-[10px] py-0 h-4">
        {cost}
      </Badge>
    </div>
  );
}

export default function PollarDemoPage() {
  const { walletAddress, openLoginModal, tx, getClient } = usePollar();
  const { deployEscrow } = usePollarEscrow();
  const { updateFromTxHash } = useUpdateFromTxHash();
  const queryClient = useQueryClient();

  const [escrowType, setEscrowType] =
    React.useState<EscrowType>("single-release");
  const [title, setTitle] = React.useState("Demo Pollar Escrow");
  const [description, setDescription] = React.useState(
    "Escrow created via Pollar adapter to demonstrate XDR signing without custom glue code.",
  );
  const [amount, setAmount] = React.useState<string>("10");
  const [platformFee, setPlatformFee] = React.useState<string>("5");
  const [milestoneDescription, setMilestoneDescription] = React.useState(
    "Deliver the demo deliverable",
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleDeploy = async () => {
    if (!walletAddress) {
      toast.error("Connect your Pollar wallet first");
      return;
    }
    const numericAmount = Number(amount);
    const numericPlatformFee = Number(platformFee);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast.error("Amount must be a positive number");
      return;
    }
    if (!Number.isFinite(numericPlatformFee) || numericPlatformFee < 0) {
      toast.error("Platform fee must be a non-negative number");
      return;
    }

    const baseRoles = {
      approver: walletAddress,
      serviceProvider: walletAddress,
      platformAddress: walletAddress,
      releaseSigner: walletAddress,
      disputeResolver: walletAddress,
    };

    setIsSubmitting(true);
    try {
      if (escrowType === "single-release") {
        const payload: InitializeSingleReleaseEscrowPayload = {
          signer: walletAddress,
          engagementId: `ENG-${Date.now()}`,
          title,
          description,
          amount: numericAmount,
          platformFee: numericPlatformFee,
          roles: { ...baseRoles, receiver: walletAddress },
          trustline: USDC_TESTNET_TRUSTLINE,
          milestones: [{ description: milestoneDescription }],
        };
        await deployEscrow({ payload, type: "single-release" });
      } else {
        const payload: InitializeMultiReleaseEscrowPayload = {
          signer: walletAddress,
          engagementId: `ENG-${Date.now()}`,
          title,
          description,
          platformFee: numericPlatformFee,
          roles: baseRoles,
          trustline: USDC_TESTNET_TRUSTLINE,
          milestones: [
            {
              description: milestoneDescription,
              amount: numericAmount,
              receiver: walletAddress,
            },
          ],
        };
        await deployEscrow({ payload, type: "multi-release" });
      }

      // Pollar submits the signed XDR directly to Horizon, bypassing
      // Trustless Work's `useSendTransaction`. The TW indexer therefore
      // doesn't learn about the deploy on its own — we explicitly notify it
      // with the tx hash so the new escrow is ingested.
      const txState = getClient().getTransactionState();
      if (txState?.step === "success" && txState.hash) {
        try {
          await updateFromTxHash({ txHash: txState.hash });
        } catch (syncError) {
          console.warn(
            "[Pollar] updateFromTxHash failed; the escrow may take longer to appear in the indexer",
            syncError,
          );
        }
      }

      toast.success("Escrow deployed — switch to My Escrows tab to see it");
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["escrows"] });
      }, 3000);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTxStatus = () => {
    switch (tx.step) {
      case "idle":
        return (
          <p className="text-sm text-muted-foreground">
            No transaction yet. Fill the form and click <em>Deploy escrow</em>.
          </p>
        );
      case "building":
        return (
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Building transaction…
          </div>
        );
      case "built":
        return (
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Transaction built. Awaiting signature…
          </div>
        );
      case "signing":
        return (
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing and submitting via Pollar…
          </div>
        );
      case "success":
        return (
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="default">Success</Badge>
              <code className="text-xs break-all">{tx.hash}</code>
            </div>
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              View on Stellar Expert
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <p className="text-xs text-muted-foreground mt-2">
              Note: this only created the contract on Soroban — no USDC was
              moved. To actually fund and release, the next steps in the
              lifecycle are <code>fundEscrow</code> →{" "}
              <code>approveMilestone</code> → <code>releaseFunds</code>.
            </p>
          </div>
        );
      case "error":
        return (
          <div className="flex flex-col gap-2 text-sm">
            <Badge variant="destructive">Error</Badge>
            <p className="text-muted-foreground">
              {tx.details ?? "Transaction failed"}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="font-sans min-h-screen p-8 sm:p-20">
      <header className="flex justify-between items-center w-full mb-12">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 hover:bg-accent rounded-full transition-colors"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Image
            src="/favicon.ico"
            alt="Trustless Work"
            width={40}
            height={40}
          />
          <h2 className="text-xl font-bold uppercase border-l-2 border-primary pl-4">
            Pollar Mode
          </h2>
        </div>
        <WalletButton />
      </header>

      <main className="max-w-4xl mx-auto flex flex-col gap-6">
        <div className="border border-primary/20 bg-primary/5 rounded-lg p-4 flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium mb-1">
              Trustless Work × Pollar — escrow adapter demo (issue #28)
            </p>
            <p className="text-muted-foreground">
              This page mounts <code>{"<PollarProvider>"}</code> with an{" "}
              <code>escrow</code> adapter that wraps Trustless Work&apos;s{" "}
              <code>useInitializeEscrow</code> hook. Calling{" "}
              <code>usePollarEscrow().deployEscrow</code> intercepts the
              unsigned XDR and delegates signing &amp; submission to Pollar —
              no custom glue code in this repo.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Layers3 className="h-4 w-4 text-primary" />
              How a Trustless Work escrow flows
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-wrap items-stretch gap-2">
              <LifecycleStep
                highlight
                icon={<Layers3 className="h-4 w-4" />}
                title="1. Deploy"
                cost="XLM only"
                description="Create the escrow contract on Soroban with metadata (roles, expected amount, milestones, trustline). No USDC moved."
              />
              <div className="hidden sm:flex items-center text-muted-foreground">
                <ArrowRight className="h-4 w-4" />
              </div>
              <LifecycleStep
                icon={<Wallet className="h-4 w-4" />}
                title="2. Fund"
                cost="XLM + USDC"
                description="Funder sends USDC to the contract. Requires an established USDC trustline on the funder wallet."
              />
              <div className="hidden sm:flex items-center text-muted-foreground">
                <ArrowRight className="h-4 w-4" />
              </div>
              <LifecycleStep
                icon={<CheckCircle2 className="h-4 w-4" />}
                title="3. Approve & Release"
                cost="XLM"
                description="Approver validates each milestone; release signer transfers USDC from the contract to the receiver."
              />
              <div className="hidden sm:flex items-center text-muted-foreground">
                <ArrowRight className="h-4 w-4" />
              </div>
              <LifecycleStep
                icon={<ShieldAlert className="h-4 w-4" />}
                title="Dispute (alt)"
                cost="XLM"
                description="Either party can start a dispute; the dispute resolver decides how funds are split between receiver and sender."
              />
            </div>
            <div className="flex items-start gap-2 rounded-md bg-muted/30 border border-border/40 p-3 text-xs text-muted-foreground">
              <Info className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
              <p>
                <strong>This demo implements only step 1 (Deploy).</strong>{" "}
                That&apos;s enough to validate the Pollar adapter pattern — the
                other 7 signing operations (<code>fundEscrow</code>,{" "}
                <code>releaseFunds</code>, <code>approveMilestone</code>,{" "}
                <code>changeMilestoneStatus</code>, <code>startDispute</code>,{" "}
                <code>resolveDispute</code>, <code>updateEscrow</code>) follow
                the same pattern and are tracked as TODO in{" "}
                <code>src/lib/pollar/escrowAdapter.types.ts</code>. See the{" "}
                <a
                  href="https://docs.trustlesswork.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Trustless Work docs
                  <ExternalLink className="h-3 w-3" />
                </a>{" "}
                for the full lifecycle.
              </p>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="deploy" className="w-full">
          <TabsList>
            <TabsTrigger value="deploy" className="gap-2">
              <Hammer className="h-4 w-4" />
              Deploy
            </TabsTrigger>
            <TabsTrigger value="my-escrows" className="gap-2">
              <ListTree className="h-4 w-4" />
              My Escrows
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deploy" className="flex flex-col gap-6 mt-4">
            {!walletAddress ? (
              <Card>
                <CardHeader>
                  <CardTitle>Connect with Pollar</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <p className="text-sm text-muted-foreground">
                    Sign in via Google, GitHub, email or an existing Stellar
                    wallet through Pollar to start.
                  </p>
                  <Button onClick={openLoginModal}>Open Pollar login</Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Deploy a demo escrow</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="grid gap-2">
                      <FieldLabel
                        htmlFor="escrow-type"
                        hint={
                          <>
                            <strong>Single release:</strong> one bulk release
                            of the full amount when the (single) milestone is
                            approved.
                            <br />
                            <strong>Multi release:</strong> separate release
                            per milestone, each with its own amount and
                            receiver. Use for multi-stage engagements.
                          </>
                        }
                      >
                        Escrow type
                      </FieldLabel>
                      <Select
                        value={escrowType}
                        onValueChange={(v) => setEscrowType(v as EscrowType)}
                      >
                        <SelectTrigger id="escrow-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single-release">
                            Single release
                          </SelectItem>
                          <SelectItem value="multi-release">
                            Multi release
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <FieldLabel
                        htmlFor="title"
                        hint="Display name for the escrow. Free-text, stored on-chain as metadata."
                      >
                        Title
                      </FieldLabel>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>

                    <div className="grid gap-2">
                      <FieldLabel
                        htmlFor="description"
                        hint="What the escrow is for. Free-text metadata visible to all parties."
                      >
                        Description
                      </FieldLabel>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <FieldLabel
                          htmlFor="amount"
                          hint={
                            escrowType === "single-release" ? (
                              <>
                                Total USDC the escrow expects to be funded
                                with.{" "}
                                <strong>
                                  No USDC moves at deploy time
                                </strong>
                                ; the value is stored as metadata so step 2
                                (fundEscrow) knows the target amount.
                              </>
                            ) : (
                              <>
                                USDC released when this milestone is approved.
                                In multi-release, the total funding is the sum
                                of all milestone amounts. No USDC moves at
                                deploy.
                              </>
                            )
                          }
                        >
                          {escrowType === "single-release"
                            ? "Amount (USDC)"
                            : "Milestone amount (USDC)"}
                        </FieldLabel>
                        <Input
                          id="amount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <FieldLabel
                          htmlFor="platform-fee"
                          hint={
                            <>
                              Commission percentage taken by{" "}
                              <code>platformAddress</code> when funds are
                              released. A value of <code>5</code> means 5%.
                            </>
                          }
                        >
                          Platform fee (%)
                        </FieldLabel>
                        <Input
                          id="platform-fee"
                          type="number"
                          min="0"
                          step="0.01"
                          value={platformFee}
                          onChange={(e) => setPlatformFee(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <FieldLabel
                        htmlFor="milestone-description"
                        hint="What the service provider must complete for this milestone. Approver checks it later before approving release."
                      >
                        Milestone description
                      </FieldLabel>
                      <Input
                        id="milestone-description"
                        value={milestoneDescription}
                        onChange={(e) =>
                          setMilestoneDescription(e.target.value)
                        }
                      />
                    </div>

                    <div className="rounded-md bg-muted/30 border border-border/40 p-3 text-xs text-muted-foreground flex items-start gap-2">
                      <Info className="h-4 w-4 shrink-0 mt-0.5" />
                      <div className="space-y-2">
                        <p>
                          <strong>Roles:</strong> for demo simplicity, every
                          role is set to your connected Pollar wallet.
                        </p>
                        <ul className="list-disc list-inside space-y-1 pl-1">
                          <li>
                            <code>approver</code> — validates milestones
                            before release
                          </li>
                          <li>
                            <code>serviceProvider</code> — does the work
                          </li>
                          <li>
                            <code>releaseSigner</code> — signs the release tx
                          </li>
                          <li>
                            <code>disputeResolver</code> — splits funds if
                            disputed
                          </li>
                          <li>
                            <code>platformAddress</code> — receives the
                            platform fee
                          </li>
                          <li>
                            <code>receiver</code> — gets the released USDC
                            (single release only; in multi-release each
                            milestone has its own)
                          </li>
                        </ul>
                        <p>
                          <strong>Trustline:</strong> hardcoded to USDC on
                          Stellar testnet. The contract uses this as the asset
                          it expects when funded.
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={handleDeploy}
                      disabled={isSubmitting || tx.step === "signing"}
                      className="w-full"
                    >
                      {isSubmitting || tx.step === "signing" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Deploying…
                        </>
                      ) : (
                        <>
                          <RefreshCcw className="h-4 w-4 mr-2" />
                          Deploy escrow
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Transaction status</CardTitle>
                  </CardHeader>
                  <CardContent>{renderTxStatus()}</CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="my-escrows" className="mt-4">
            <PollarMyEscrowsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
