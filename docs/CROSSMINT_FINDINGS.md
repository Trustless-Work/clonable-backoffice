# Crossmint Stellar Integration Findings

## 1. Verified SDK Support & APIs

The following packages have been installed and inspected:

- `@crossmint/client-sdk-react-ui`: Provides the React providers and `useWallet` hook.
- `@crossmint/client-sdk-base`: Base functionality for Crossmint interactions.
- `@crossmint/wallets-sdk`: (Sub-dependency) Contains the `StellarWallet` class and core wallet logic.

### Verified Exports

- **`useWallet`**: Returns `CrossmintWalletBaseContext` which includes:
  - `wallet`: A generic `Wallet<Chain>` instance.
  - `status`: `"not-loaded" | "in-progress" | "loaded" | "error"`.
- **`StellarWallet`**: A specialized class for Stellar interactions.
  - `static from(wallet: Wallet<Chain>): StellarWallet`: Converts a generic wallet to a Stellar wallet.
  - `sendTransaction(params: StellarTransactionInput)`: The primary method for transaction submission.

## 2. Key Discovery: Address Format Incompatibility (CRITICAL)

During the runtime validation of this spike, a critical technical blocker was identified:

- **Finding**: Crossmint's Stellar integration exclusively provides **Soroban Smart Wallets** (addresses starting with `C...`).
- **Blocker**: The current version of the Trustless Work API expects **Traditional Stellar Accounts** (addresses starting with `G...`, version byte 48).
- **Error**: Attempting to deploy an escrow using a Crossmint `C...` address results in a `400 Bad Request`:
  > `"message": "invalid version byte. expected 48, got 16"`

### Technical Root Cause
The Trustless Work API uses legacy Stellar address decoding logic, which expects an Ed25519 Public Key (version byte 48). Soroban Contract IDs, which Crossmint uses for its account-abstracted Stellar wallets, use version byte 16.

### Investigated Workarounds
- **Wallet Toggling**: Tried forcing `type: "standard"`, `type: "mpc"`, and `accountType: "custodial-eoa"`. Crossmint documentation confirms that Stellar wallets are always Soroban smart contract wallets.
- **Signer Extraction**: Attempted to find an underlying `G...` signer address within the Crossmint `wallet` object. The object is fully abstracted and does not expose a public key compatible with the legacy `G...` format.

## 3. Verified Transaction Workflow (Theoretical)

The following flow was implemented to bridge the two SDKs:

1. **Initialize**: Wrap the application in `CrossmintProvider`, `CrossmintAuthProvider`, and `CrossmintWalletProvider`.
2. **Access**: Use `const { wallet } = useWallet()` to get the generic wallet instance.
3. **Build**: Send the wallet address to Trustless Work SDK to get an unsigned XDR.
4. **Specialize**: Convert to a specialized instance: `const stellarWallet = StellarWallet.from(wallet)`.
5. **Execute**: Call `await stellarWallet.sendTransaction({ transaction: unsignedXdr, contractId: targetId })`.

## 4. Unsupported Assumptions & Known Limitations

- **Raw Signature Export**: CONFIRMED. There is no API to return just a signed XDR without submission.
- **Legacy API Incompatibility**: The current Trustless Work API is not compatible with modern Stellar Smart Wallets (Account Abstraction).

## 5. Recommended Next Steps

1. **Trustless Work API Update**: The server-side validation must be updated to support Soroban Contract IDs (`C...`) as valid signers and role holders.
2. **Crossmint Coordination**: Verify if a "Legacy" Stellar EOA account type can be enabled for specific Project IDs by Crossmint support.
3. **Indexer Updates**: Ensure the Trustless Work indexer can correctly track events emitted by or directed to `C...` addresses.

## Validation Matrix

| Flow              | Implemented | Tested | Successful |
| ----------------- | ----------- | ------ | ---------- |
| Deploy Escrow     | Yes         | Yes    | **NO** (400) |
| Update Milestone  | Yes         | No     | No         |
| Approve Milestone | Yes         | No     | No         |
| Release Funds     | Yes         | No     | No         |

**Conclusion**: The integration is technically sound in terms of SDK bridging, but is blocked by a version-byte address format mismatch on the Trustless Work API.
