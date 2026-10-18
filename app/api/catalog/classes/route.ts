import { NextResponse } from "next/server";
import { getClasses } from "@/lib/db/catalog";

export const dynamic = "force-dynamic";


export async function GET() {
  try {
    const classes = await getClasses();
    return NextResponse.json({ data: classes });
  } catch (e) {
    console.error("GET /api/catalog/classes failed:", e);
    return NextResponse.json({ error: "Не удалось загрузить классы" }, { status: 500 });
  }
}
