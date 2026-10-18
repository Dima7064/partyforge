import { NextRequest, NextResponse } from "next/server";
import { getTraits } from "@/lib/db/catalog";

export async function GET(req: NextRequest) {
  try {
    const type = new URL(req.url).searchParams.get("type");
    let traits = await getTraits();
    if (type) {
      traits = traits.filter((t) => t.type === type);
    }
    return NextResponse.json({ data: traits });
  } catch (e) {
    console.error("GET /api/catalog/traits failed:", e);
    return NextResponse.json(
      { error: "Не удалось загрузить черты" },
      { status: 500 },
    );
  }
}