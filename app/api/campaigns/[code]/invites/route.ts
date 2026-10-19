import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { createInvite, getInvites } from "@/lib/db/campaigns";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    const invites = await getInvites(code, user.id);
    return NextResponse.json({ data: invites });
  } catch (e) {
    console.error("GET invites failed:", e);
    const msg = e instanceof Error ? e.message : "Ошибка";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    const body = await req.json();
    const invite = await createInvite(code, user.id, {
      role: body.role === "master" ? "master" : "player",
      expiresInHours: body.expiresInHours ? Number(body.expiresInHours) : undefined,
      maxUses: body.maxUses ? Number(body.maxUses) : undefined,
    });
    return NextResponse.json({ data: invite });
  } catch (e) {
    console.error("POST invites failed:", e);
    const msg = e instanceof Error ? e.message : "Ошибка";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}