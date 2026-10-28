import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getCampaignByCode } from "@/lib/db/campaigns";
import { computeFeatures, cosineSimilarity } from "@/lib/ml/similarity";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const targetCampaign = await getCampaignByCode(code);
    if (!targetCampaign) return NextResponse.json({ error: "Не найдено" }, { status: 404 });

    const targetFeatures = computeFeatures(targetCampaign);

    const supabase = createServerClient();
    const { data: publicCampaigns } = await supabase
      .from("campaigns")
      .select("share_code")
      .eq("is_public", true)
      .neq("share_code", code)
      .limit(50);

    if (!publicCampaigns || publicCampaigns.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const scored = await Promise.all(
      publicCampaigns.map(async (pc) => {
        const fullCampaign = await getCampaignByCode(pc.share_code);
        if (!fullCampaign) return null;
        const features = computeFeatures(fullCampaign);
        return {
          share_code: pc.share_code,
          title: fullCampaign.input.tone,
          score: cosineSimilarity(targetFeatures, features)
        };
      })
    );

    const results = scored
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return NextResponse.json({ data: results });
  } catch (e) {
    return NextResponse.json({ error: "Ошибка рекомендаций" }, { status: 500 });
  }
}