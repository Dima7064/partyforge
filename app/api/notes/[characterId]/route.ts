import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { getNote, saveNote } from "@/lib/db/campaigns";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ characterId: string }> },
) {
  try {
    const { characterId } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    const content = await getNote(characterId, user.id);
    return NextResponse.json({ data: { content } });
  } catch (e) {
    console.error("GET /api/notes failed:", e);
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ characterId: string }> },
) {
  try {
    const { characterId } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    const { content } = await req.json();
    await saveNote(characterId, user.id, String(content ?? ""));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PUT /api/notes failed:", e);
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}