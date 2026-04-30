import { NextRequest, NextResponse } from "next/server";
import { RozoClient, RozoApiError } from "@/lib/integrations/rozo/client";

const isSorobanContractId = (id: string): boolean => {
  if (!id || typeof id !== "string") return false;
  if (id.length !== 56) return false;
  if (!id.startsWith("C")) return false;
  const base32Regex = /^[A-Z2-7]{55}$/;
  return base32Regex.test(id.slice(1));
};

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ROZO_API_KEY;
    const appId = process.env.ROZO_APP_ID;

    if (!appId) {
      console.error("[ROZO] ROZO_APP_ID not configured");
      return NextResponse.json(
        { error: "ROZO integration not configured" },
        { status: 500 }
      );
    }

    const body = await request.json() as Record<string, unknown>;
    const { contractId } = body;

    if (typeof contractId !== "string" || !contractId) {
      return NextResponse.json(
        { error: "Invalid contractId" },
        { status: 400 }
      );
    }

    if (!isSorobanContractId(contractId)) {
      return NextResponse.json(
        { error: "Invalid Soroban contract format. Expected format: C-prefixed 56-character base32 string" },
        { status: 400 }
      );
    }

    const client = new RozoClient(apiKey);
    const payment = await client.createPayment(contractId);

    return NextResponse.json(payment, { status: 201 });
  } catch (error: unknown) {
    console.error("[ROZO] Create payment error:", error);
    if (error instanceof RozoApiError) {
      return NextResponse.json(
        { error: error.message, code: error.rozoCode },
        { status: error.statusCode }
      );
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
