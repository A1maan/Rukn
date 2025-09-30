import { NextResponse } from "next/server";
import { mockFlaggedRequests } from "@/lib/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region");
  const urgency = searchParams.get("urgency");
  const status = searchParams.get("status") || "pending";

  let filtered = mockFlaggedRequests.filter((req) => req.status === status);

  if (region) {
    filtered = filtered.filter((req) => req.region === region);
  }

  if (urgency) {
    filtered = filtered.filter((req) => req.urgency === urgency);
  }

  return NextResponse.json(filtered);
}

export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const body = await request.json();
  
  const request_item = mockFlaggedRequests.find((r) => r.id === id);
  
  if (!request_item) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  // Update status
  if (body.status) {
    request_item.status = body.status;
  }

  return NextResponse.json({
    ok: true,
    request: request_item,
  });
}
