import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { getCampaignByCode } from "@/lib/db/campaigns";
import { exportRelationshipsSvg } from "@/lib/export/svg";
import { unlockAchievement } from "@/lib/db/achievements";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

    const campaign = await getCampaignByCode(code, user.id);
    if (!campaign) return NextResponse.json({ error: "Кампания не найдена" }, { status: 404 });
    if (campaign.viewer_role === "none") {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    }

    const svg = exportRelationshipsSvg(campaign);
    await unlockAchievement(user.id, "first_export");

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Content-Disposition": `attachment; filename="partyforge-${campaign.share_code}-relationships.svg"`,
      },
    });
  } catch (e) {
    console.error("GET svg export failed:", e);
    const msg = e instanceof Error ? e.message : "Ошибка";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}