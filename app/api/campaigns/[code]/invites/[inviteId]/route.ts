import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { deleteInvite } from "@/lib/db/campaigns";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string; inviteId: string }> },
) {
  try {
    const { inviteId } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    await deleteInvite(inviteId, user.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE invite failed:", e);
    const msg = e instanceof Error ? e.message : "Ошибка";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}