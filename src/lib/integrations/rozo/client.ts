import {
  CreatePaymentResponse,
  GetPaymentResponse,
  RozoError,
} from "./types";
import {
  ROZO_ENDPOINT,
  ROZO_APP_ID,
  PAYMENT_TIMEOUT,
} from "./constants";

export class RozoApiError extends Error {
  constructor(
    public statusCode: number,
    public rozoCode: string,
    message: string
  ) {
    super(message);
    this.name = "RozoApiError";
  }
}

export class RozoClient {
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: Record<string, string | number | object>
  ): Promise<T> {
    const url = `${ROZO_ENDPOINT}${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PAYMENT_TIMEOUT);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (this.apiKey) {
        headers.Authorization = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = (await response.json()) as RozoError;
        console.error("[ROZO] API error:", {
          status: response.status,
          path,
          error: errorData,
        });
        throw new RozoApiError(
          response.status,
          errorData.code,
          errorData.message || response.statusText
        );
      }

      const data = (await response.json()) as T;
      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          console.error("[ROZO] Request timeout:", { path, timeout: PAYMENT_TIMEOUT });
          throw new Error("ROZO API request timeout");
        }
        throw error;
      }
      throw new Error("Unknown ROZO API error");
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async createPayment(
    contractId: string
  ): Promise<CreatePaymentResponse> {
    console.log("[ROZO] Creating payment:", { contractId });

      const body: Record<string, string | number | object> = {
      appId: ROZO_APP_ID,
      type: "anyAmount",
      display: {
        title: "Fund Trustless Work Escrow",
        currency: "USD",
      },
      source: {
        chainId: "8453",
        tokenSymbol: "USDC",
      },
      destination: {
        chainId: "1500",
        receiverAddress: contractId,
        tokenSymbol: "USDC",
      },
    };

    const response = await this.request<CreatePaymentResponse>(
      "POST",
      "",
      body
    );

    console.log("[ROZO] Payment created:", {
      paymentId: response.id,
      status: response.status,
    });

    return response;
  }

  async getPayment(paymentId: string): Promise<GetPaymentResponse> {
    console.log("[ROZO] Checking payment status:", { paymentId });

    const response = await this.request<GetPaymentResponse>(
      "GET",
      `/payments/${paymentId}`
    );

    console.log("[ROZO] Payment status:", {
      paymentId,
      status: response.status,
    });

    return response;
  }
}
