import { NextRequest, NextResponse } from "next/server";
import {
  getCampaignByCode,
  deleteCampaignByCode,
  updateCampaignSettings,
} from "@/lib/db/campaigns";
import { getCurrentUser } from "@/lib/auth/currentUser";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const user = await getCurrentUser();
    const campaign = await getCampaignByCode(code, user?.id);
    if (!campaign) {
      return NextResponse.json({ error: "Кампания не найдена" }, { status: 404 });
    }
    return NextResponse.json({ data: campaign });
  } catch (e) {
    console.error(`GET /api/campaigns/[code] failed:`, e);
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    const body = await req.json();
    await updateCampaignSettings(code, user.id, {
      title: body.title,
      status: body.status,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(`PATCH /api/campaigns/[code] failed:`, e);
    const msg = e instanceof Error ? e.message : "Ошибка";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    const deleted = await deleteCampaignByCode(code, user.id);
    if (!deleted) return NextResponse.json({ error: "Не найдена" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(`DELETE /api/campaigns/[code] failed:`, e);
    const msg = e instanceof Error ? e.message : "Ошибка";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}