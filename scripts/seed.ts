import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { classes } from "../data/classes";
import { races } from "../data/races";
import { backgrounds } from "../data/backgrounds";
import { traits } from "../data/traits";
import { secrets } from "../data/secrets";
import { hookTemplates } from "../data/hookTemplates";
import { toneWeights } from "../data/toneWeights";
import { achievements } from "../data/achievements";
import {
  CLASS_NAMES_RU,
  RACE_NAMES_RU,
  BACKGROUND_NAMES_RU,
} from "../data/localization";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function seedClasses() {
  const rows = classes.map((c) => ({
    ...c,
    name_ru: CLASS_NAMES_RU[c.name] ?? c.name,
  }));
  // Используем upsert по name, чтобы не ломать ссылки у существующих персонажей
  const { error } = await supabase.from("classes").upsert(rows, { onConflict: "name" });
  if (error) throw error;
  console.log(`✓ classes: ${rows.length}`);
}

async function seedRaces() {
  const rows = races.map((r) => ({
    ...r,
    name_ru: RACE_NAMES_RU[r.name] ?? r.name,
  }));
  const { error } = await supabase.from("races").upsert(rows, { onConflict: "name" });
  if (error) throw error;
  console.log(`✓ races: ${rows.length}`);
}

async function seedBackgrounds() {
  const rows = backgrounds.map((b) => ({
    ...b,
    name_ru: BACKGROUND_NAMES_RU[b.name] ?? b.name,
  }));
  const { error } = await supabase.from("backgrounds").upsert(rows, { onConflict: "name" });
  if (error) throw error;
  console.log(`✓ backgrounds: ${rows.length}`);
}

async function seedTraits() {
  await supabase.from("traits").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { error } = await supabase.from("traits").insert(traits);
  if (error) throw error;
  console.log(`✓ traits: ${traits.length}`);
}

async function seedSecrets() {
  // Внимание: удаление секретов может конфликтовать с персонажами, у которых есть secret_id.
  // В нашей новой схеме мы используем secret_text, поэтому это безопасно.
  await supabase.from("secrets").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { error } = await supabase.from("secrets").insert(secrets);
  if (error) throw error;
  console.log(`✓ secrets: ${secrets.length}`);
}

async function seedHookTemplates() {
  await supabase.from("hook_templates").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { error } = await supabase.from("hook_templates").insert(hookTemplates);
  if (error) throw error;
  console.log(`✓ hook_templates: ${hookTemplates.length}`);
}

async function seedToneWeights() {
  await supabase.from("tone_weights").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  const { data: classRows } = await supabase.from("classes").select("id, name");
  const { data: raceRows } = await supabase.from("races").select("id, name");
  if (!classRows || !raceRows) throw new Error("Не удалось загрузить каталог");

  const classByName = new Map(classRows.map((r) => [r.name, r.id]));
  const raceByName = new Map(raceRows.map((r) => [r.name, r.id]));

  const rows = toneWeights
    .map((tw) => {
      const id =
        tw.entity_type === "class"
          ? classByName.get(tw.entity_name)
          : raceByName.get(tw.entity_name);
      if (!id) return null;
      return {
        tone: tw.tone,
        entity_type: tw.entity_type,
        entity_id: id,
        weight: tw.weight,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const { error } = await supabase.from("tone_weights").insert(rows);
  if (error) throw error;
  console.log(`✓ tone_weights: ${rows.length}`);
}

async function seedAchievements() {
  const rows = achievements.map((a) => ({
    code: a.code,
    name_ru: a.name_ru,
    description_ru: a.description_ru,
    icon: a.icon,
  }));
  const { error } = await supabase
    .from("achievements")
    .upsert(rows, { onConflict: "code" });
  if (error) throw error;
  console.log(`✓ achievements: ${rows.length}`);
}

async function main() {
  console.log("Начинаем seed...");
  await seedClasses();
  await seedRaces();
  await seedBackgrounds();
  await seedTraits();
  await seedSecrets();
  await seedHookTemplates();
  await seedToneWeights();
  await seedAchievements();
  console.log("Seed завершён.");
}

main().catch((e) => {
  console.error("Seed упал:", e);
  process.exit(1);
});