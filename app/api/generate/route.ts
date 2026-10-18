import { NextRequest, NextResponse } from "next/server";
import { loadGeneratorData } from "@/lib/generator/data";
import { generateCampaign } from "@/lib/generator/campaign";
import { saveCampaign } from "@/lib/db/campaigns";
import type { GeneratorInput, Tone } from "@/types/generator";

const VALID_TONES: Tone[] = [
  "dark_fantasy",
  "heroic",
  "comedic",
  "political",
  "wild",
  "religious",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const input: GeneratorInput = {
      system: body.system ?? "dnd5e",
      level: Number(body.level) || 1,
      tone: VALID_TONES.includes(body.tone) ? body.tone : "heroic",
      party_size: Math.max(2, Math.min(6, Number(body.party_size) || 4)),
      world: body.world ?? "custom",
      constraints: body.constraints ?? {},
      duration: body.duration ?? "mini_campaign",
    };

    const data = await loadGeneratorData();
    const campaign = generateCampaign(input, data);
    const { share_code } = await saveCampaign(input, campaign);

    return NextResponse.json({ share_code });
  } catch (e) {
    console.error("POST /api/generate failed:", e);
    return NextResponse.json(
      { error: "Не удалось сгенерировать кампанию" },
      { status: 500 },
    );
  }
}