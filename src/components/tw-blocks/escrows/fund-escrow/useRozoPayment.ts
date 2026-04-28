"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseRozoPaymentReturn {
  amount: string;
  setAmount: (value: string) => void;
  paymentId: string | null;
  paymentStatus: string;
  baseAddress: string | null;
  isLoading: boolean;
  error: string | null;
  createPayment: () => Promise<void>;
  refreshPayment: () => Promise<void>;
}

export function useRozoPayment(
  contractId: string,
  escrowPublicKey: string,
): UseRozoPaymentReturn {
  const [amount, setAmount] = useState("");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState("idle");
  const [baseAddress, setBaseAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPaymentRef = useRef<() => Promise<void>>();

  const createPayment = useCallback(async () => {
    if (!amount || !contractId || !escrowPublicKey) {
      setError("Missing required fields");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 0.02 || numAmount > 3000) {
      setError("Amount must be between $0.02 and $3,000 USDC");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/integrations/rozo/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numAmount,
          contractId,
          escrowPublicKey,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        const errorMsg = errorData.code
          ? `${errorData.error} (${errorData.code})`
          : errorData.error || "Failed to create payment";
        throw new Error(errorMsg);
      }

      const data = await res.json();
      setPaymentId(data.id);
      setPaymentStatus(data.status);
      setBaseAddress(data.source?.receiverAddress || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [amount, contractId, escrowPublicKey]);

  const refreshPayment = useCallback(async () => {
    if (!paymentId) return;

    try {
      const res = await fetch(`/api/integrations/rozo/get-payment/${paymentId}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to refresh payment");
      }

      const data = await res.json();
      setPaymentStatus(data.status);
    } catch (_err) {
      console.error("Polling error:", _err);
    }
  }, [paymentId]);

  useEffect(() => {
    refreshPaymentRef.current = refreshPayment;
  }, [refreshPayment]);
 
  useEffect(() => {
    if (!paymentId) return;
    if (["completed", "failed", "bounced", "payment_completed", "payment_bounced", "payment_expired", "payment_refunded"].includes(paymentStatus)) {
      return;
    }

    const interval = setInterval(() => {
      if (refreshPaymentRef.current) {
        refreshPaymentRef.current();
      }
    }, 7000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId, paymentStatus]);

  return {
    amount,
    setAmount,
    paymentId,
    paymentStatus,
    baseAddress,
    isLoading,
    error,
    createPayment,
    refreshPayment,
  };
}
