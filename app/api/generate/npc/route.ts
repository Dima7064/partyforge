import { NextRequest, NextResponse } from "next/server";
import { loadGeneratorData } from "@/lib/generator/data";
import { generateCharacter } from "@/lib/generator/character";
import { mulberry32 } from "@/lib/generator/random";

export async function POST(req: NextRequest) {
  try {
    const { race, className, tone } = await req.json();
    const data = await loadGeneratorData();
    
    const seed = Date.now();
    const rng = mulberry32(seed);
    
    const input = {
      system: "dnd5e",
      level: 3,
      tone: tone || "dark_fantasy",
      party_size: 1,
      world: "custom",
      constraints: { banned_races: race ? [] : undefined },
      duration: "mini_campaign" as const,
    };

    const ctx = {
      rng,
      existingClassIds: new Set<string>(),
      existingNames: new Set<string>(),
    };

    const character = generateCharacter(input as any, data, ctx);
    
    return NextResponse.json({ character });
  } catch (e) {
    return NextResponse.json({ error: "Ошибка генерации" }, { status: 500 });
  }
}