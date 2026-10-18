import { NextRequest, NextResponse } from "next/server";
import {
  getCampaignByCode,
  deleteCampaignByCode,
  regenerateCharacter,
} from "@/lib/db/campaigns";
import { loadGeneratorData } from "@/lib/generator/data";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const campaign = await getCampaignByCode(code);
    if (!campaign) {
      return NextResponse.json(
        { error: "Кампания не найдена" },
        { status: 404 },
      );
    }
    return NextResponse.json({ data: campaign });
  } catch (e) {
    console.error(`GET /api/campaigns/[code] failed:`, e);
    return NextResponse.json(
      { error: "Не удалось загрузить кампанию" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const body = await req.json();

    if (body.action === "regenerate_character") {
      const campaign = await getCampaignByCode(code);
      if (!campaign) {
        return NextResponse.json(
          { error: "Кампания не найдена" },
          { status: 404 },
        );
      }

      const data = await loadGeneratorData();
      const regenerated = await regenerateCharacter(
        code,
        Number(body.character_index),
        data,
        campaign.input,
      );

      return NextResponse.json({ data: regenerated });
    }

    return NextResponse.json({ error: "Неизвестное действие" }, { status: 400 });
  } catch (e) {
    console.error(`PATCH /api/campaigns/[code] failed:`, e);
    return NextResponse.json(
      { error: "Не удалось обновить кампанию" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const deleted = await deleteCampaignByCode(code);
    if (!deleted) {
      return NextResponse.json(
        { error: "Кампания не найдена" },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(`DELETE /api/campaigns/[code] failed:`, e);
    return NextResponse.json(
      { error: "Не удалось удалить кампанию" },
      { status: 500 },
    );
  }
}