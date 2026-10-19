import { NextRequest, NextResponse } from "next/server";
import { joinCampaign } from "@/lib/db/campaigns";
import { getCurrentUser } from "@/lib/auth/currentUser";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    const { character_index } = await req.json();
    await joinCampaign(code, user.id, Number(character_index));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(`POST /api/campaigns/[code]/join failed:`, e);
    const msg = e instanceof Error ? e.message : "Ошибка";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}