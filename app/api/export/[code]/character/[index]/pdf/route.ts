import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { getCampaignByCode } from "@/lib/db/campaigns";
import { registerPdfFonts } from "@/lib/pdf/fonts";
import { CharacterSheetDocument } from "@/lib/pdf/CharacterSheet";
import { unlockAchievement } from "@/lib/db/achievements";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const THEME_LABEL: Record<string, string> = {
  classic: "Классика D&D",
  skyrim: "Скайрим",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string; index: string }> },
) {
  try {
    const { code, index } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

    const campaign = await getCampaignByCode(code, user.id);
    if (!campaign) {
      return NextResponse.json({ error: "Кампания не найдена" }, { status: 404 });
    }

    const idx = Number(index);
    if (!Number.isInteger(idx) || idx < 0 || idx >= campaign.characters.length) {
      return NextResponse.json({ error: "Неверный индекс персонажа" }, { status: 400 });
    }

    const isMaster = campaign.viewer_role === "master";
    const isOwner = campaign.viewer_character_index === idx;
    if (!isMaster && !isOwner) {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    }

    registerPdfFonts();

    const character = campaign.characters[idx];
    const doc = CharacterSheetDocument({
      character,
      characterIndex: idx,
      characters: campaign.characters,
      relationships: campaign.relationships,
      hooks: campaign.hooks,
      showSecret: isMaster,
      campaignCode: campaign.share_code,
      themeLabel: THEME_LABEL[campaign.theme] ?? campaign.theme,
    });

    const buffer = await renderToBuffer(doc);

    await unlockAchievement(user.id, "first_export");

    const safeName = encodeURIComponent(
      `partyforge-${campaign.share_code}-${character.name}.pdf`,
    );
    const contentDisposition = `attachment; filename="partyforge-${campaign.share_code}.pdf"; filename*=UTF-8''${safeName}`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": contentDisposition,
      },
    });
  } catch (e) {
    console.error("GET character pdf failed:", e);
    const msg = e instanceof Error ? e.message : "Ошибка генерации PDF";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}