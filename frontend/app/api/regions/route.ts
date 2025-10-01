import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public/data/ksa-provinces.geojson");
    const data = await fs.readFile(filePath, "utf-8");
    const geoJSON = JSON.parse(data);
    
    return NextResponse.json(geoJSON);
  } catch (error) {
    console.error("Error reading GeoJSON:", error);
    return NextResponse.json(
      { error: "Failed to load regions" },
      { status: 500 }
    );
  }
}
