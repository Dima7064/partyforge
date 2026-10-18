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

const VALID_DURATIONS = ["one_shot", "mini_campaign", "long_campaign"];

export async function POST(req: NextRequest) {
  try {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Невалидный JSON в запросе" },
        { status: 400 },
      );
    }

    const level = Number(body.level);
    if (body.level !== undefined && (isNaN(level) || level < 1 || level > 20)) {
      return NextResponse.json(
        { error: "Уровень должен быть от 1 до 20" },
        { status: 400 },
      );
    }

    const partySize = Number(body.party_size);
    if (
      body.party_size !== undefined &&
      (isNaN(partySize) || partySize < 2 || partySize > 6)
    ) {
      return NextResponse.json(
        { error: "Размер партии должен быть от 2 до 6" },
        { status: 400 },
      );
    }

    if (body.tone !== undefined && !VALID_TONES.includes(body.tone as Tone)) {
      return NextResponse.json(
        { error: "Неизвестный тон" },
        { status: 400 },
      );
    }

    if (
      body.duration !== undefined &&
      !VALID_DURATIONS.includes(body.duration as string)
    ) {
      return NextResponse.json(
        { error: "Неизвестная длительность" },
        { status: 400 },
      );
    }

    const input: GeneratorInput = {
      system: "dnd5e",
      level: level || 1,
      tone: VALID_TONES.includes(body.tone as Tone)
        ? (body.tone as Tone)
        : "heroic",
      party_size: Math.max(2, Math.min(6, partySize || 4)),
      world: "custom",
      constraints: (body.constraints as GeneratorInput["constraints"]) ?? {},
      duration:
        (body.duration as GeneratorInput["duration"]) ?? "mini_campaign",
    };

    const data = await loadGeneratorData();
    const campaign = generateCampaign(input, data);
    const { share_code } = await saveCampaign(input, campaign);

    return NextResponse.json({ share_code });
  } catch (e) {
    console.error("POST /api/generate failed:", e);
    return NextResponse.json(
      { error: "Не удалось сгенерировать кампанию. Попробуй ещё раз." },
      { status: 500 },
    );
  }
}