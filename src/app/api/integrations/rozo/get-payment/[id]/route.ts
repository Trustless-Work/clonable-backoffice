import { NextRequest, NextResponse } from "next/server";
import { RozoClient, RozoApiError } from "@/lib/integrations/rozo/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Invalid payment ID" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ROZO_API_KEY;

    const client = new RozoClient(apiKey);
    const payment = await client.getPayment(id);

    return NextResponse.json(payment, { status: 200 });
  } catch (error: unknown) {
    console.error("[ROZO] Get payment error:", error);
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
