import { NextResponse } from "next/server";
import { getBackgrounds } from "@/lib/db/catalog";

export const dynamic = "force-dynamic";


export async function GET() {
  try {
    const backgrounds = await getBackgrounds();
    return NextResponse.json({ data: backgrounds });
  } catch (e) {
    console.error("GET /api/catalog/backgrounds failed:", e);
    return NextResponse.json({ error: "Не удалось загрузить предыстории" }, { status: 500 });
  }
}
