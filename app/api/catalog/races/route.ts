import { NextResponse } from "next/server";
import { getRaces } from "@/lib/db/catalog";

export async function GET() {
  try {
    const races = await getRaces();
    return NextResponse.json({ data: races });
  } catch (e) {
    console.error("GET /api/catalog/races failed:", e);
    return NextResponse.json({ error: "Не удалось загрузить расы" }, { status: 500 });
  }
}
