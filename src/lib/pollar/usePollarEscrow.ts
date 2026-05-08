"use client";

import { createPollarAdapterHook } from "@pollar/react";
import type { EscrowAdapter } from "./escrowAdapter.types";

// `createPollarAdapterHook` reads `adapters[key]` from the PollarProvider
// context, then wraps each adapter function so that calling it transparently
// runs: original fn → unsignedTransaction → signAndSubmitTx via Pollar.
export const usePollarEscrow =
  createPollarAdapterHook<EscrowAdapter>("escrow");
