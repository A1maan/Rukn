import { NextResponse } from "next/server";
import { mockAlerts } from "@/lib/mock-data";
import { AlertStatus } from "@/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as AlertStatus | null;
  const window = searchParams.get("window");

  let filtered = mockAlerts;

  if (status) {
    filtered = filtered.filter((alert) => alert.status === status);
  }

  // In production, would filter by time window
  // For now, just return filtered alerts

  return NextResponse.json(filtered);
}
