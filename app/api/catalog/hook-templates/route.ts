import { NextResponse } from "next/server";
import { getHookTemplates } from "@/lib/db/catalog";

export const dynamic = "force-dynamic";


export async function GET() {
  try {
    const templates = await getHookTemplates();
    return NextResponse.json({ data: templates });
  } catch (e) {
    console.error("GET /api/catalog/hook-templates failed:", e);
    return NextResponse.json({ error: "Не удалось загрузить шаблоны крючков" }, { status: 500 });
  }
}
