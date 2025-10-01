import { NextResponse } from "next/server";
import { mockAlerts } from "@/lib/mock-data";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  
  const alert = mockAlerts.find((a) => a.id === id);
  
  if (!alert) {
    return NextResponse.json({ error: "Alert not found" }, { status: 404 });
  }

  // In production, this would update the database
  alert.status = "rejected";

  // Create action log entry
  const actionLog = {
    id: `act_${Date.now()}`,
    alert_id: id,
    action: "reject",
    by: "supervisor_demo",
    ts: new Date().toISOString(),
    note: body.note || "",
  };

  return NextResponse.json({
    ok: true,
    alert,
    actionLog,
  });
}
