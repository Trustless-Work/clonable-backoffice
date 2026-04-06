"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { LoadEscrowFormProps } from "@/components/tw-blocks/escrows/load-escrow/LoadEscrowForm";

const LoadEscrowFormNoSSR = dynamic<LoadEscrowFormProps>(
  () =>
    import("@/components/tw-blocks/escrows/load-escrow/LoadEscrowForm").then(
      (m) => m.LoadEscrowForm,
    ),
  {
    ssr: false,
    loading: () => null,
  },
);

interface LoadEscrowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoadEscrowModal({ isOpen, onClose }: LoadEscrowModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" aria-describedby="load-escrow-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            Load Escrow
          </DialogTitle>
          <p id="load-escrow-description" className="text-sm text-muted-foreground">
            Enter an escrow contract ID to load and manage its funding.
          </p>
        </DialogHeader>
        <Suspense fallback={null}>
          <LoadEscrowFormNoSSR onSuccess={onClose} />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}