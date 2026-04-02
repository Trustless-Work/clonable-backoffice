# Pollar × Trustless Work — Spike Results

## What worked
- Google OAuth login via Pollar WalletButton
- Wallet address retrieval from usePollar()
- Escrow initialization via Trustless Work API /deployer/single-release
- XDR signing and submission via signAndSubmitTx()
- Transaction confirmed on Stellar testnet

## What broke / unknowns
- TW API key must be exposed as `NEXT_PUBLIC_API_KEY` (client-side fetch, no server route)
- PollarProvider API uses `config.apiKey`, not `publishableKey`
- signAndSubmitTx compatibility with TW XDR format needs more testing
- Full escrow lifecycle (milestones, approvals, release) not tested

## Recommendation
Pursue — Pollar successfully abstracts wallet creation, OAuth login, and transaction
signing. UX is significantly simpler for non-crypto users.

## Next steps
1. Test full escrow lifecycle — milestones, approvals, and release flow end to end.
2. Implement `PollarWalletAdapter` in `src/lib/wallet/pollarAdapter.ts` and wire it
   to the existing escrow flows so both Pollar and the current Stellar wallet are
   supported interchangeably.
3. Move the TW API key to a server-side route (`/api/trustless-work/...`) so
   `NEXT_PUBLIC_API_KEY` is no longer exposed in the client bundle.
4. Add error boundary or loading states to `PollarWalletProvider` for production use.
5. Evaluate Pollar's embedded wallet flow as an alternative to Freighter/Albedo
   for onboarding non-crypto users.

## Setup
1. `npm install`
2. Add to `.env.local`:
   ```
   NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY=
   NEXT_PUBLIC_API_KEY=
   NEXT_PUBLIC_TW_BASE_URL=https://dev.api.trustlesswork.com
   ```
3. `npm run dev`
4. Go to `/pollar-spike`
