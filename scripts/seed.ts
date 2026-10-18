import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";
import { classes } from "../data/classes";
import { races } from "../data/races";
import { backgrounds } from "../data/backgrounds";
import { traits } from "../data/traits";
import { secrets } from "../data/secrets";
import { hookTemplates } from "../data/hookTemplates";
import { toneWeights } from "../data/toneWeights";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Для таблиц с уникальным именем используем upsert (вставить или обновить)
async function seedClasses() {
  const { error } = await supabase.from("classes").upsert(classes, {
    onConflict: "name",
  });
  if (error) throw error;
  console.log(`✓ classes: ${classes.length}`);
}

async function seedRaces() {
  const { error } = await supabase.from("races").upsert(races, {
    onConflict: "name",
  });
  if (error) throw error;
  console.log(`✓ races: ${races.length}`);
}

async function seedBackgrounds() {
  const { error } = await supabase.from("backgrounds").upsert(backgrounds, {
    onConflict: "name",
  });
  if (error) throw error;
  console.log(`✓ backgrounds: ${backgrounds.length}`);
}

// Для таблиц без уникальных ключей (кроме id) используем очистку и вставку
async function seedTraits() {
  await supabase.from("traits").delete().neq("type", "none");
  const { error } = await supabase.from("traits").insert(traits);
  if (error) throw error;
  console.log(`✓ traits: ${traits.length}`);
}

async function seedSecrets() {
  await supabase.from("secrets").delete().neq("text", "none");
  const { error } = await supabase.from("secrets").insert(secrets);
  if (error) throw error;
  console.log(`✓ secrets: ${secrets.length}`);
}

async function seedHookTemplates() {
  await supabase.from("hook_templates").delete().neq("type", "none");
  const { error } = await supabase.from("hook_templates").insert(hookTemplates);
  if (error) throw error;
  console.log(`✓ hook_templates: ${hookTemplates.length}`);
}

async function seedToneWeights() {
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

  const { error } = await supabase.from("tone_weights").upsert(rows, {
    onConflict: "tone,entity_type,entity_id",
  });
  if (error) throw error;
  console.log(`✓ tone_weights: ${rows.length}`);
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
  console.log("Seed успешно завершён!");
}

main().catch((e) => {
  console.error("Seed упал:", e);
  process.exit(1);
});
