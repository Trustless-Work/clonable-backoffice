"use client";

import { usePollar, WalletButton } from "@pollar/react";
import "@pollar/react/styles.css";
import { useState, useEffect } from "react";

// NOTE(@pollar/react 0.5.2): `signAndSubmitTx` is present in the type
// definitions. If it throws at runtime (e.g. "not implemented"), verify the
// correct method name against the SDK source or Pollar docs and update the
// call below. To inspect all available methods: console.log(Object.keys(ctx))
// inside a component that calls usePollar().

interface EscrowForm {
  title: string;
  description: string;
  amount: string;
  serviceProvider: string;
  approver: string;
}

export default function PollarSpikePage() {
  const { walletAddress, isAuthenticated, logout, signAndSubmitTx, transaction, network } = usePollar();

  const [form, setForm] = useState<EscrowForm>({
    title: "",
    description: "",
    amount: "",
    serviceProvider: "",
    approver: "",
  });
  const [xdr, setXdr] = useState<string | null>(null);
  const [escrowError, setEscrowError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signError, setSignError] = useState<string | null>(null);

  // Pre-fill address-based fields once the wallet connects
  useEffect(() => {
    if (walletAddress) {
      setForm((prev) => ({
        ...prev,
        serviceProvider: prev.serviceProvider || walletAddress,
        approver: prev.approver || walletAddress,
      }));
    }
  }, [walletAddress]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleInitializeEscrow(e: React.FormEvent) {
    e.preventDefault();
    setEscrowError(null);
    setXdr(null);
    setIsSubmitting(true);

    try {
      const payload = {
        signer: walletAddress,
        engagementId: `spike-${Date.now()}`,
        title: form.title,
        description: form.description,
        roles: {
          approver: form.approver,
          serviceProvider: form.serviceProvider,
          platformAddress: walletAddress,
          releaseSigner: walletAddress,
          disputeResolver: walletAddress,
          receiver: walletAddress,
        },
        amount: Number(form.amount),
        platformFee: 1,
        milestones: [{ description: "Initial milestone" }],
        trustline: {
          address: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
          symbol: "USDC",
        },
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_TW_BASE_URL}/deployer/single-release`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY ?? "",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setEscrowError(data.error ?? "Unknown error");
        return;
      }

      setXdr(data.unsignedTransaction ?? JSON.stringify(data));
    } catch (err) {
      setEscrowError(err instanceof Error ? err.message : "Fetch failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignAndSubmit() {
    if (!xdr) return;
    setSignError(null);
    try {
      await signAndSubmitTx(xdr);
    } catch (err) {
      setSignError(err instanceof Error ? err.message : "Sign & submit failed");
    }
  }

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto space-y-8">
      {/* HEADER */}
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pollar × Trustless Work Spike</h1>
        {isAuthenticated ? (
          <button
            onClick={logout}
            className="px-4 py-2 text-sm rounded border border-neutral-600 hover:bg-neutral-800 transition-colors"
          >
            Sign out
          </button>
        ) : (
          <WalletButton />
        )}
      </header>

      {/* SESSION */}
      <section className="space-y-1 rounded border border-neutral-700 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
          Session
        </h2>
        <p className="text-sm">
          Status:{" "}
          <span
            className={isAuthenticated ? "text-green-400" : "text-neutral-400"}
          >
            {isAuthenticated ? "Authenticated" : "Not authenticated"}
          </span>
        </p>
        <p className="text-sm break-all">
          Address:{" "}
          <span className="font-mono text-xs">
            {walletAddress || "Not available"}
          </span>
        </p>
      </section>

      {/* INITIALIZE ESCROW */}
      {isAuthenticated && (
        <section className="space-y-4 rounded border border-neutral-700 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
            Initialize Escrow
          </h2>
          <form onSubmit={handleInitializeEscrow} className="space-y-3">
            {(
              [
                { name: "title", label: "Title", type: "text" },
                {
                  name: "description",
                  label: "Description",
                  type: "text",
                },
                { name: "amount", label: "Amount (USDC)", type: "number" },
                {
                  name: "serviceProvider",
                  label: "Service Provider",
                  type: "text",
                },
                { name: "approver", label: "Approver", type: "text" },
              ] as const
            ).map(({ name, label, type }) => (
              <div key={name} className="flex flex-col gap-1">
                <label
                  htmlFor={name}
                  className="text-xs text-neutral-400"
                >
                  {label}
                </label>
                <input
                  id={name}
                  name={name}
                  type={type}
                  value={form[name]}
                  onChange={handleChange}
                  className="rounded border border-neutral-600 bg-neutral-900 px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors text-white"
            >
              {isSubmitting ? "Initializing…" : "Init escrow"}
            </button>
          </form>

          {escrowError && (
            <p className="text-sm text-red-400">{escrowError}</p>
          )}

          {xdr && (
            <div className="space-y-1">
              <p className="text-xs text-neutral-400">Unsigned transaction (XDR)</p>
              <code className="block break-all rounded bg-neutral-900 p-3 text-xs font-mono text-green-400">
                {xdr}
              </code>
            </div>
          )}
        </section>
      )}

      {/* SIGN */}
      {xdr && (
        <section className="space-y-3 rounded border border-neutral-700 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
            Sign & Submit
          </h2>
          <p className="text-xs font-mono break-all text-neutral-300">{xdr}</p>
          <button
            onClick={handleSignAndSubmit}
            disabled={
              transaction?.step === "signing" ||
              transaction?.step === "building"
            }
            className="px-4 py-2 text-sm rounded bg-green-700 hover:bg-green-800 disabled:opacity-50 transition-colors text-white"
          >
            {transaction?.step === "signing" ||
            transaction?.step === "building"
              ? "Signing…"
              : "Sign & submit"}
          </button>

          {signError && (
            <p className="text-sm text-red-400">{signError}</p>
          )}

          {transaction?.step === "error" && (
            <p className="text-sm text-red-400">
              {transaction.details ?? "Transaction failed"}
            </p>
          )}

          {transaction?.step === "success" && (
            <a
              href={`https://stellar.expert/explorer/${network}/tx/${transaction.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm text-blue-400 hover:underline"
            >
              View on Stellar Expert →
            </a>
          )}
        </section>
      )}
    </main>
  );
}
