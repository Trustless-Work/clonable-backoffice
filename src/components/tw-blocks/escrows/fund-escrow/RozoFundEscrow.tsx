"use client";

import { useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, RefreshCw, AlertCircle, CheckCircle, Loader, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useRozoPayment } from "./useRozoPayment";

interface RozoFundEscrowProps {
  contractId: string;
  escrowPublicKey: string;
  onPaymentCreated?: (paymentId: string) => void;
}

export function RozoFundEscrow({
  contractId,
  escrowPublicKey,
  onPaymentCreated,
}: RozoFundEscrowProps) {
  const {
    amount,
    setAmount,
    paymentId,
    paymentStatus,
    baseAddress,
    isLoading,
    error,
    createPayment,
    refreshPayment,
  } = useRozoPayment(contractId, escrowPublicKey);

  const createdAtRef = useRef<number | null>(null);

  // Env warning on mount
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_API_KEY) {
      console.warn("Missing NEXT_PUBLIC_API_KEY environment variable");
    }
  }, []);

  // Track creation time and handle 30min timeout
  useEffect(() => {
    if (paymentStatus === "unpaid" && !createdAtRef.current) {
      createdAtRef.current = Date.now();
    } else if (paymentStatus !== "unpaid") {
      createdAtRef.current = null;
    }

    // Check for 30min timeout
    const timeoutInterval = setInterval(() => {
      if (paymentStatus === "unpaid" && createdAtRef.current) {
        const elapsedMs = Date.now() - createdAtRef.current;
        const elapsedMin = elapsedMs / (1000 * 60);
        if (elapsedMin > 30) {
          toast.error("Payment expired after 30 minutes. Please create a new payment.");
          createdAtRef.current = null;
          // Reset form would happen here if you have a reset handler
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(timeoutInterval);
  }, [paymentStatus]);

  const handleCreatePayment = async () => {
    // Validation
    const numAmount = parseFloat(amount as string);

    if (!amount || isNaN(numAmount)) {
      toast.error("Enter amount");
      return;
    }

    if (numAmount < 0.02) {
      toast.error("Minimum is $0.02");
      return;
    }

    if (numAmount > 3000) {
      toast.error("Maximum is $3000");
      return;
    }

    // Create payment
    await createPayment();
    if (onPaymentCreated && paymentId) {
      onPaymentCreated(paymentId);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    if (status.includes("completed")) return "default";
    if (status.includes("failed") || status.includes("bounced") || status.includes("expired")) return "destructive";
    return "outline";
  };

  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { icon: React.ReactNode; label: string; description: string }> = {
      idle: { icon: null, label: "Ready", description: "Enter amount and create payment" },
      creating: { icon: <Loader className="w-4 h-4 animate-spin text-primary" />, label: "Creating", description: "Creating payment..." },
      unpaid: { icon: <RefreshCw className="w-4 h-4 animate-spin text-primary" />, label: "Waiting for Payment", description: "Waiting for payment..." },
      detected: { icon: <Loader className="w-4 h-4 animate-spin text-primary" />, label: "Detected", description: "Payment detected, confirming on Stellar..." },
      completed: { icon: <CheckCircle className="w-4 h-4 text-green-600" />, label: "Completed", description: "Escrow funded!" },
      bounced: { icon: <XCircle className="w-4 h-4 text-red-600" />, label: "Bounced", description: "Wrong amount sent" },
      failed: { icon: <XCircle className="w-4 h-4 text-red-600" />, label: "Failed", description: error || "Payment failed" },
      expired: { icon: <AlertCircle className="w-4 h-4 text-amber-600" />, label: "Expired", description: "Payment expired" },
    };

    return statusMap[status] || statusMap.idle;
  };

  return (
    <div className="space-y-6">
      {!paymentId && (
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-4 border-b border-border/40">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </div>
              Fund from Base Chain (USDC)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount (USDC)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount ($0.02 - $3000)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0.02"
                  max="3000"
                  step="0.01"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground mt-1" role="note">
                  Limits: $0.02 - $3,000 USDC
                </p>
              </div>
              <Button
                onClick={handleCreatePayment}
                disabled={isLoading || !amount}
                className="w-full"
              >
                {isLoading ? "Creating Payment..." : "Generate Base USDC Deposit"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {paymentId && (
        <Card className={`border-border/60 shadow-sm ${
          paymentStatus.includes("completed") ? "border-green-200 bg-green-50/30" :
          paymentStatus.includes("failed") || paymentStatus.includes("bounced") || paymentStatus.includes("expired") ? "border-red-200 bg-red-50/30" : ""
        }`}>
          <CardHeader className="pb-4 border-b border-border/40">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                paymentStatus.includes("completed") ? "bg-green-100" :
                paymentStatus.includes("failed") || paymentStatus.includes("bounced") || paymentStatus.includes("expired") ? "bg-red-100" :
                "bg-primary/10"
              }`}>
                {getStatusDisplay(paymentStatus).icon || (
                  paymentStatus.includes("completed") ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : paymentStatus.includes("failed") || paymentStatus.includes("bounced") || paymentStatus.includes("expired") ? (
                    <XCircle className="w-4 h-4 text-red-600" />
                  ) : (
                    <RefreshCw className="w-4 h-4 text-primary animate-spin" />
                  )
                )}
              </div>
              Send USDC to Base Address
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {baseAddress && (
              <div className="flex justify-center mb-6">
                <div className="border border-border/40 rounded-lg p-2">
                  <QRCodeSVG
                    value={baseAddress}
                    size={200}
                    level="M"
                    includeMargin={true}
                  />
                </div>
              </div>
            )}

            {baseAddress && (
              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <p className="text-xs text-muted-foreground mb-2">Base Deposit Address</p>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-sm font-mono break-all" aria-label="Base deposit address">{baseAddress}</code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(baseAddress)}
                    aria-label="Copy deposit address"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="mb-6">
              <p className="text-sm font-medium mb-2">Payment Status</p>
              <div className="flex items-center gap-2">
                <Badge className="capitalize" variant={getStatusBadgeVariant(paymentStatus)}>
                  {getStatusDisplay(paymentStatus).label}
                </Badge>
                {paymentStatus.includes("completed") && (
                  <span className="text-xs text-green-700 font-medium">Escrow funded!</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/40">
              <p className="text-xs text-muted-foreground">
                Auto-refreshing every 7s...
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast.loading("Checking payment...");
                  refreshPayment();
                }}
                disabled={isLoading}
                aria-label="Refresh payment status"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg" role="alert" aria-live="polite">
              <p className="text-xs text-blue-800">
                <strong>Important:</strong> Send only USDC on Base network to this address. 
                Do not send from unsupported chains.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-2" role="alert">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-xs text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {paymentStatus === "completed" && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4" role="alert">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-900">Payment Completed</p>
              <p className="text-xs text-green-800 mt-1">Your escrow has been funded successfully on Stellar.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
