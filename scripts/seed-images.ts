import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { IMAGE_DIMENSIONS } from "../lib/images/dimensions";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const ROOT = path.join(process.cwd(), "public", "images");

interface PoolEntry {
  url: string;
  type: string;
  race_name: string | null;
  location_type: string | null;
  theme: string;
  width: number;
  height: number;
  filename: string;
}

function scanDir(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f));
}

function scanSubdirs(dir: string): { name: string; files: string[] }[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => ({ name: d.name, files: scanDir(path.join(dir, d.name)) }));
}

function collect(): PoolEntry[] {
  const entries: PoolEntry[] = [];

  function collectFor(base: string, theme: string) {
    const p = IMAGE_DIMENSIONS.portrait;
    for (const race of scanSubdirs(path.join(base, "portraits"))) {
      for (const file of race.files) {
        entries.push({
          url: `/images/${theme === "skyrim" ? "skyrim/" : ""}portraits/${race.name}/${file}`,
          type: "portrait",
          race_name: race.name,
          location_type: null,
          theme,
          width: p.width,
          height: p.height,
          filename: file,
        });
      }
    }

    const npc = IMAGE_DIMENSIONS.npc;
    for (const file of scanDir(path.join(base, "npcs"))) {
      entries.push({
        url: `/images/${theme === "skyrim" ? "skyrim/" : ""}npcs/${file}`,
        type: "npc",
        race_name: null,
        location_type: null,
        theme,
        width: npc.width,
        height: npc.height,
        filename: file,
      });
    }

    const loc = IMAGE_DIMENSIONS.location;
    for (const type of scanSubdirs(path.join(base, "locations"))) {
      for (const file of type.files) {
        entries.push({
          url: `/images/${theme === "skyrim" ? "skyrim/" : ""}locations/${type.name}/${file}`,
          type: "location",
          race_name: null,
          location_type: type.name,
          theme,
          width: loc.width,
          height: loc.height,
          filename: file,
        });
      }
    }

    const map = IMAGE_DIMENSIONS.map;
    for (const file of scanDir(path.join(base, "maps"))) {
      entries.push({
        url: `/images/${theme === "skyrim" ? "skyrim/" : ""}maps/${file}`,
        type: "map",
        race_name: null,
        location_type: null,
        theme,
        width: map.width,
        height: map.height,
        filename: file,
      });
    }

    const terr = IMAGE_DIMENSIONS.terrain;
    for (const file of scanDir(path.join(base, "terrain"))) {
      entries.push({
        url: `/images/${theme === "skyrim" ? "skyrim/" : ""}terrain/${file}`,
        type: "terrain",
        race_name: null,
        location_type: null,
        theme,
        width: terr.width,
        height: terr.height,
        filename: file,
      });
    }
  }

  collectFor(ROOT, "classic");
  collectFor(path.join(ROOT, "skyrim"), "skyrim");
  return entries;
}

async function main() {
  const entries = collect();
  if (entries.length === 0) {
    console.log("В public/images/ пока нет файлов. Заглушки останутся.");
    return;
  }

  // Очистить старый пул
  const { error: delErr } = await supabase
    .from("images")
    .delete()
    .eq("is_pool", true);
  if (delErr) throw delErr;

  const rows = entries.map((e) => ({
    url: e.url,
    type: e.type,
    race_name: e.race_name,
    location_type: e.location_type,
    theme: e.theme,
    width: e.width,
    height: e.height,
    filename: e.filename,
    is_pool: true,
  }));

  const { error } = await supabase.from("images").insert(rows);
  if (error) throw error;
  console.log(`✓ images (pool): ${rows.length}`);

  // Сводка по типам
  const byType: Record<string, number> = {};
  for (const e of entries) byType[e.type] = (byType[e.type] ?? 0) + 1;
  for (const [type, count] of Object.entries(byType)) {
    console.log(`  · ${type}: ${count}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});