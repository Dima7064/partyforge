import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { getPoolImages } from "@/lib/db/images";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

    const url = new URL(req.url);
    const type = url.searchParams.get("type") ?? undefined;
    const race_name = url.searchParams.get("race_name") ?? undefined;
    const location_type = url.searchParams.get("location_type") ?? undefined;
    const theme = url.searchParams.get("theme") ?? undefined;

    const pool = await getPoolImages({ type, race_name, location_type, theme });
    return NextResponse.json({ data: pool });
  } catch (e) {
    console.error("GET /api/image-pool failed:", e);
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}