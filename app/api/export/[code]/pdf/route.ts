import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { getCampaignByCode } from "@/lib/db/campaigns";
import { registerPdfFonts } from "@/lib/pdf/fonts";
import { MasterNotesDocument } from "@/lib/pdf/MasterNotes";
import { unlockAchievement } from "@/lib/db/achievements";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

    const campaign = await getCampaignByCode(code, user.id);
    if (!campaign) {
      return NextResponse.json({ error: "Кампания не найдена" }, { status: 404 });
    }
    if (campaign.viewer_role !== "master") {
      return NextResponse.json({ error: "Только мастер" }, { status: 403 });
    }

    registerPdfFonts();
    const doc = MasterNotesDocument({ campaign });
    const buffer = await renderToBuffer(doc);

    await unlockAchievement(user.id, "first_export");

    const safeName = encodeURIComponent(
      `partyforge-${campaign.share_code}-master-notes.pdf`,
    );
    const contentDisposition = `attachment; filename="partyforge-${campaign.share_code}-master-notes.pdf"; filename*=UTF-8''${safeName}`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": contentDisposition,
      },
    });
  } catch (e) {
    console.error("GET master pdf failed:", e);
    const msg = e instanceof Error ? e.message : "Ошибка генерации PDF";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}