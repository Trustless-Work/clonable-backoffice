export type PaymentStatus = "unpaid" | "detected" | "completed" | "bounced" | "failed";

export interface CreatePaymentRequest {
  contractId: string;
  escrowTitle?: string;
  escrowType?: string;
}

interface RozoDisplay {
  title: string;
  description: string | null;
  currency: string;
}

interface RozoSource {
  chainId: string;
  tokenSymbol: string;
  tokenAddress: string;
  amount: string;
  receiverAddress: string;
  receiverMemo: string | null;
  fee: string;
  senderAddress: string | null;
  txHash: string | null;
  amountReceived: string | null;
  confirmedAt: string | null;
}

interface RozoDestination {
  chainId: string;
  receiverAddress: string;
  receiverMemo: string | null;
  tokenSymbol: string;
  tokenAddress: string;
  amount: string;
  txHash: string | null;
  confirmedAt: string | null;
}

export interface RozoPaymentResponse {
  id: string;
  appId: string;
  orderId: string | null;
  status: string;
  errorCode: string | null;
  type: "anyAmount";
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  display: RozoDisplay;
  source: RozoSource;
  destination: RozoDestination;
}

export type CreatePaymentResponse = RozoPaymentResponse;
export type GetPaymentResponse = RozoPaymentResponse;

export interface RozoError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
