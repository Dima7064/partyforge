import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { deleteLibraryItem } from "@/lib/db/library";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

    await deleteLibraryItem(id, user.id);
    
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Ошибка" }, { status: 400 });
  }
}