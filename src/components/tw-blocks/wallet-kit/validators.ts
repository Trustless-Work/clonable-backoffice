/**
 * Validator for the wallet address
 *
 * @param wallet - The wallet address
 * @param options - Optional configuration
 * @param options.allowSmartWallet - Whether to allow Soroban contract IDs (starting with 'C'). Defaults to false.
 * @returns True if the wallet address is valid, false otherwise
 */
export const isValidWallet = (
  wallet: string,
  { allowSmartWallet = false }: { allowSmartWallet?: boolean } = {},
) => {
  if (wallet.length !== 56) {
    return false;
  }

  const prefix = wallet[0];
  const isValidPrefix = prefix === "G" || (allowSmartWallet && prefix === "C");

  if (!isValidPrefix) {
    return false;
  }

  const base32Regex = /^[A-Z2-7]+$/;
  if (!base32Regex.test(wallet)) {
    return false;
  }

  return true;
};
