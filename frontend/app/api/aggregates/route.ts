import { NextResponse } from "next/server";
import { mockAggregates } from "@/lib/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region");
  const window = searchParams.get("window") || "last_60m";

  if (region && mockAggregates[region]) {
    return NextResponse.json({
      ...mockAggregates[region],
      window,
    });
  }

  // Return all aggregates if no region specified
  return NextResponse.json(
    Object.values(mockAggregates).map((agg) => ({ ...agg, window }))
  );
}
