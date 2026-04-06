// Unified wallet interface — allows future support for multiple providers
export type WalletAdapter = {
  address: string;
  signTransaction: (xdr: string) => Promise<string>;
};

// Placeholder for future TWWalletAdapter (current @trustless-work/blocks flow)
// export class TWWalletAdapter implements WalletAdapter { ... }

// Placeholder for future PollarWalletAdapter
// export class PollarWalletAdapter implements WalletAdapter { ... }
