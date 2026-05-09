import { NextRequest, NextResponse } from "next/server";

// Simple log storage (in production use database)
const webhookLogs: Array<{
  timestamp: string;
  method: string;
  body: any;
  headers: Record<string, string>;
}> = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headers = Object.fromEntries(request.headers);

    const logEntry = {
      timestamp: new Date().toISOString(),
      method: request.method,
      body,
      headers: {
        "content-type": headers["content-type"],
        "user-agent": headers["user-agent"],
        "x-n8n-webhook-token": headers["x-n8n-webhook-token"] || "none",
      },
    };

    webhookLogs.push(logEntry);
    console.log("Webhook received:", logEntry);

    return NextResponse.json({
      status: "logged",
      timestamp: logEntry.timestamp,
      bodyKeys: Object.keys(body),
    });
  } catch (error) {
    console.error("Webhook log error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    total_logs: webhookLogs.length,
    last_5_logs: webhookLogs.slice(-5),
  });
}
