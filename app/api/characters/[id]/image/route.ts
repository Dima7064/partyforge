import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { changeCharacterImage } from "@/lib/db/campaigns";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    const { image_id } = await req.json();
    await changeCharacterImage(id, user.id, String(image_id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PATCH /api/characters/[id]/image failed:", e);
    const msg = e instanceof Error ? e.message : "Ошибка";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}