import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { generateCampaign } from "../lib/generator/campaign";
import { createServerClient } from "../lib/supabase/server";
import fs from "node:fs";
import type { GeneratorInput, GeneratorData } from "../types/generator";

const COUNT = 500;
const TONES: GeneratorInput["tone"][] = ["dark_fantasy", "heroic", "comedic", "political", "wild", "religious"];

async function getDirectData(): Promise<GeneratorData> {
  const supabase = createServerClient();
  const [classes, races, backgrounds, traits, secrets, hookTemplates, toneWeights] = await Promise.all([
    supabase.from("classes").select("*"),
    supabase.from("races").select("*"),
    supabase.from("backgrounds").select("*"),
    supabase.from("traits").select("*"),
    supabase.from("secrets").select("*"),
    supabase.from("hook_templates").select("*"),
    supabase.from("tone_weights").select("*"),
  ]);

  return {
    classes: classes.data ?? [],
    races: races.data ?? [],
    backgrounds: backgrounds.data ?? [],
    traits: traits.data ?? [],
    secrets: secrets.data ?? [],
    hook_templates: hookTemplates.data ?? [],
    tone_weights: toneWeights.data ?? [],
  } as GeneratorData;
}

async function main() {
  const data = await getDirectData();
  const dataset = [];

  console.log(`Генерация ${COUNT} кампаний...`);

  for (let i = 0; i < COUNT; i++) {
    const input: GeneratorInput = {
      system: "dnd5e",
      level: Math.floor(Math.random() * 20) + 1,
      tone: TONES[Math.floor(Math.random() * TONES.length)],
      party_size: Math.floor(Math.random() * 5) + 2,
      world: "custom",
      constraints: {},
      duration: "mini_campaign",
    };

    const campaign = generateCampaign(input, data, i);

    const classCounts = { tank: 0, healer: 0, dps: 0, face: 0, control: 0, support: 0 };
    campaign.characters.forEach((c) => classCounts[c.role]++);

    const locCounts = { city: 0, temple: 0, forest: 0, ruins: 0, port: 0 };
    campaign.locations.forEach((l) => { if (l.type in locCounts) locCounts[l.type as keyof typeof locCounts]++; });

    const relCounts = { trust: 0, debt: 0, love: 0, conflict: 0, secret: 0 };
    campaign.relationships.forEach((r) => relCounts[r.type]++);

    dataset.push({
      id: i,
      level: input.level,
      party_size: input.party_size,
      tone_dark: input.tone === "dark_fantasy" ? 1 : 0,
      tone_heroic: input.tone === "heroic" ? 1 : 0,
      tone_political: input.tone === "political" ? 1 : 0,
      class_tank: classCounts.tank,
      class_healer: classCounts.healer,
      class_dps: classCounts.dps,
      class_face: classCounts.face,
      class_control: classCounts.control,
      class_support: classCounts.support,
      loc_city: locCounts.city,
      loc_temple: locCounts.temple,
      loc_forest: locCounts.forest,
      loc_ruins: locCounts.ruins,
      loc_port: locCounts.port,
      rel_trust: relCounts.trust,
      rel_debt: relCounts.debt,
      rel_love: relCounts.love,
      rel_conflict: relCounts.conflict,
      rel_secret: relCounts.secret,
    });
  }

  if (!fs.existsSync("scripts/ml")) fs.mkdirSync("scripts/ml");
  fs.writeFileSync("scripts/ml/dataset.json", JSON.stringify(dataset, null, 2));
  console.log("Датасет сохранен в scripts/ml/dataset.json");
}

main().catch(console.error);