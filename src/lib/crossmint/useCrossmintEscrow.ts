"use client";

import { useCrossmint } from "@/components/providers/CrossmintProvider";

export function useCrossmintEscrow() {
  const { adapters } = useCrossmint();
  const escrow = adapters.escrow;

  if (!escrow) {
    throw new Error("Crossmint Escrow adapter not initialized");
  }

  return escrow;
}
