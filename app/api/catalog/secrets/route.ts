import { NextResponse } from "next/server";
import { getSecrets } from "@/lib/db/catalog";

export async function GET() {
  try {
    const secrets = await getSecrets();
    return NextResponse.json({ data: secrets });
  } catch (e) {
    console.error("GET /api/catalog/secrets failed:", e);
    return NextResponse.json(
      { error: "Не удалось загрузить тайны" },
      { status: 500 },
    );
  }
}