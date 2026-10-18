import { NextResponse } from "next/server";
import { getToneWeights } from "@/lib/db/catalog";

export async function GET() {
  try {
    const weights = await getToneWeights();
    return NextResponse.json({ data: weights });
  } catch (e) {
    console.error("GET /api/catalog/tone-weights failed:", e);
    return NextResponse.json(
      { error: "Не удалось загрузить tone-веса" },
      { status: 500 },
    );
  }
}