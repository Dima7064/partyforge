import { NextRequest, NextResponse } from "next/server";
import { loadGeneratorData } from "@/lib/generator/data";
import { generateCampaign } from "@/lib/generator/campaign";
import { saveCampaign } from "@/lib/db/campaigns";
import { getCurrentUser } from "@/lib/auth/currentUser";
import type { GeneratorInput, Theme, Tone } from "@/types/generator";

const VALID_TONES: Tone[] = [
  "dark_fantasy",
  "heroic",
  "comedic",
  "political",
  "wild",
  "religious",
];
const VALID_THEMES: Theme[] = ["classic", "skyrim"];

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const body = await req.json();
    const theme: Theme = VALID_THEMES.includes(body.theme) ? body.theme : "classic";

    const input: GeneratorInput = {
      system: body.system ?? "dnd5e",
      level: Number(body.level) || 1,
      tone: VALID_TONES.includes(body.tone) ? body.tone : "dark_fantasy",
      theme,
      party_size: Math.max(2, Math.min(6, Number(body.party_size) || 4)),
      world: body.world ?? "custom",
      constraints: body.constraints ?? {},
      duration: body.duration ?? "mini_campaign",
    };

    const data = await loadGeneratorData();
    const campaign = generateCampaign(input, data);
    const { share_code } = await saveCampaign(
      input,
      campaign,
      user.id,
      body.title,
    );

    return NextResponse.json({ share_code });
  } catch (e) {
    console.error("POST /api/generate failed:", e);
    return NextResponse.json(
      { error: "Не удалось сгенерировать кампанию" },
      { status: 500 },
    );
  }
}