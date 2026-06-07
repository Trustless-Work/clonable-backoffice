# Known Limitations

## 1. Signed XDR Export

Crossmint's primary model is **Sign + Submit**. It does not currently provide a standard client-side API to return a _signed_ XDR without also submitting it. This means the Trustless Work indexer must rely on the transaction hash returned by Crossmint rather than having the application submit the signed XDR via `sendTransaction`.

## 2. Multi-Wallet Scenarios

While Crossmint supports multiple chains, a single user session is typically tied to one identity (e.g., email). Managing multiple Stellar wallets for different roles (Funder, Approver) within the same browser session may require frequent re-authentication or complex session management.

## 3. Testnet Dependencies

All initial findings and PoC work are targeted at **Stellar Testnet**. Production migration will require updated API keys and potentially different Soroban contract IDs for USDC and other assets.

## 4. Soroban Resource Limits

Crossmint's transaction API handles resource increments and fee bidding. We need to ensure that Trustless Work's generated XDRs are compatible with Crossmint's automated fee management.

## Crossmint Integration Limitations

5. **API Key Requirement**: Crossmint execution requires a valid publishable API key (`NEXT_PUBLIC_CROSSMINT_API_KEY`) to be configured in environment variables.

6. **Contract ID Dependency**: The Crossmint executor requires a `contractId` in the transaction metadata for all escrow operations. This is currently sourced from the payload (`payload.contractId`) or the factory ID for deployments.

7. **Executor Provider Dependency**: Crossmint execution requires the `ExecutorProvider` to be present in the component tree with mode set to "crossmint". This is currently enforced on the `/crossmint` demo route.

8. **Wallet Connection Requirement**: Crossmint execution specifically requires a Crossmint-connected wallet (via email/social login).

9. **Factory Contract ID**: For deploy escrow operations, the Factory contract ID is used as the `contractId` parameter. While this follows Crossmint documentation for tracking factory-based deployments, it should be monitored for any edge cases in escrow-specific deployments.

10. **Transaction Metadata**: The current implementation passes only `contractId` in execution metadata. Additional contextual information (like escrow ID, operation type) could be valuable for debugging and analytics.
