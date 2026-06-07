"use client";

import * as React from "react";
import { 
  CrossmintProvider, 
  CrossmintAuthProvider, 
  CrossmintWalletProvider,
  useWallet,
  StellarWallet, // Verified export
} from "@crossmint/client-sdk-react-ui";
import { useInitializeEscrow } from "@trustless-work/escrow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Send, Wallet } from "lucide-react";
import { toast } from "sonner";

// NOTE: You must set these in your .env.local
const CROSSMINT_API_KEY = process.env.NEXT_PUBLIC_CROSSMINT_API_KEY || "";
const HAS_VALID_CROSSMINT_KEY = CROSSMINT_API_KEY.startsWith("ck_");

const USDC_TESTNET_TRUSTLINE = {
  address: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
  symbol: "USDC",
};

// Configurable Factory ID for PoC - Trustless Work deployment contract
const TW_FACTORY_CONTRACT_ID = process.env.NEXT_PUBLIC_TW_FACTORY_CONTRACT_ID || "";

function PocContent() {
  const { wallet, status } = useWallet();
  const { deployEscrow } = useInitializeEscrow();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [lastTxHash, setLastTxHash] = React.useState<string | null>(null);

  const handlePocDeploy = async () => {
    if (!wallet || !wallet.address) {
      toast.error("Connect your Crossmint wallet first");
      return;
    }

    // Runtime validation for Factory ID
    if (!TW_FACTORY_CONTRACT_ID || TW_FACTORY_CONTRACT_ID === "CAE5F6..." || !TW_FACTORY_CONTRACT_ID.startsWith("C")) {
      toast.error("Invalid Factory Contract ID", {
        description: "Please set NEXT_PUBLIC_TW_FACTORY_CONTRACT_ID to a valid Soroban Contract ID."
      });
      console.error("[PoC] Missing or invalid TW_FACTORY_CONTRACT_ID:", TW_FACTORY_CONTRACT_ID);
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Generate Unsigned XDR via Trustless Work
      const payload = {
        signer: wallet.address,
        engagementId: `POC-${Date.now()}`,
        title: "Crossmint PoC Escrow",
        description: "Testing Trustless Work XDR handoff to Crossmint",
        amount: 1,
        platformFee: 0,
        roles: {
          approver: wallet.address,
          serviceProvider: wallet.address,
          platformAddress: wallet.address,
          releaseSigner: wallet.address,
          disputeResolver: wallet.address,
          receiver: wallet.address,
        },
        trustline: USDC_TESTNET_TRUSTLINE,
        milestones: [{ description: "PoC Milestone" }],
      };

      console.log("[PoC] Requesting XDR from Trustless Work...");
      const { unsignedTransaction } = await deployEscrow(payload, "single-release");

      if (!unsignedTransaction) {
        throw new Error("Failed to generate unsigned XDR");
      }
      console.log("[PoC] Received XDR:", unsignedTransaction.slice(0, 20) + "...");

      // 2. Submit XDR to Crossmint using VERIFIED API
      console.log("[PoC] Wrapping generic wallet to StellarWallet...");
      const stellarWallet = StellarWallet.from(wallet);
      
      console.log("[PoC] Submitting XDR to Crossmint...");
      // Using verified API: sendTransaction({ transaction: string, contractId: string })
      const result = await stellarWallet.sendTransaction({
        transaction: unsignedTransaction,
        contractId: TW_FACTORY_CONTRACT_ID, // Handing off the Factory ID for deployment
      });

      console.log("[PoC] Crossmint Result:", result);
      // Result is guaranteed to have hash if status is successful based on types
      setLastTxHash(result.hash);
      toast.success("PoC Success! XDR signed and submitted by Crossmint.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("[PoC] Error:", error);
      toast.error(`PoC Failed: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-10 shadow-lg border-primary/20">
      <CardHeader className="bg-primary/5 border-b">
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5 text-primary" />
          Validated Handoff PoC (Implementation Candidate)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="p-4 rounded-lg bg-muted/50 border space-y-2">
          <p className="text-sm font-medium flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Crossmint Status: <span className={`capitalize font-bold ${status === 'loaded' ? 'text-green-600' : 'text-orange-500'}`}>{status}</span>
          </p>
          {wallet?.address && (
            <p className="text-xs font-mono break-all opacity-70">
              Address: {wallet.address}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            This PoC uses the <strong>verified</strong> Crossmint SDK APIs:
            <br />
            <code className="text-xs bg-muted p-1 rounded mt-2 block">
              StellarWallet.from(wallet).sendTransaction(&#123; transaction, contractId &#125;)
            </code>
          </p>
          
          <Button 
            onClick={handlePocDeploy} 
            disabled={isSubmitting || status !== "loaded"}
            className="w-full h-12 text-lg font-bold shadow-md transition-all active:scale-95"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Processing via Crossmint...
              </>
            ) : (
              <>
                Execute Trustless Work XDR
              </>
            )}
          </Button>
        </div>

        {lastTxHash && (
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 animate-in fade-in slide-in-from-bottom-2">
            <p className="text-sm font-bold text-green-600 mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
              On-chain Transaction Success
            </p>
            <p className="text-xs font-mono break-all opacity-70 mb-3">{lastTxHash}</p>
            <Button asChild variant="outline" size="sm" className="w-full">
              <a 
                href={`https://stellar.expert/explorer/testnet/tx/${lastTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Stellar Expert
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function CrossmintPocPage() {
  if (!HAS_VALID_CROSSMINT_KEY) {
    return (
      <div className="min-h-screen p-8 bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Card className="w-full max-w-2xl mx-auto shadow-lg border-primary/20">
          <CardHeader className="bg-primary/5 border-b">
            <CardTitle>Crossmint PoC requires a real API key</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-3">
            <p className="text-sm text-muted-foreground">
              Set <code>NEXT_PUBLIC_CROSSMINT_API_KEY</code> to a real Crossmint
              publishable key to use this route.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <CrossmintProvider apiKey={CROSSMINT_API_KEY}>
      <CrossmintAuthProvider loginMethods={["email", "google"]}>
        <CrossmintWalletProvider 
          createOnLogin={{ 
            chain: "stellar",
            recovery: { type: "email" } 
          }}
        >
          <div className="min-h-screen p-8 bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
            <PocContent />
          </div>
        </CrossmintWalletProvider>
      </CrossmintAuthProvider>
    </CrossmintProvider>
  );
}
