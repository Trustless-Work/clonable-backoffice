export const ROZO_ENDPOINT = "https://intentapiv4.rozo.ai/functions/v1/payment-api";
export const ROZO_APP_ID = "rozoTrustlesswork";
export const BASE_CHAIN_ID = 8453;
export const STELLAR_CHAIN_ID = 1500;

export const USDC_LIMITS = {
  min: 0.02,
  max: 3000,
} as const;

export const PAYMENT_TIMEOUT = 30 * 60 * 1000; // 30 minutes in ms
export const POLLING_INTERVAL = 7000; // 7 seconds in ms
