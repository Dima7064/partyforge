import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const RACES = ["Human", "Elf", "Dwarf", "Halfling", "Dragonborn", "Gnome", "Half-Elf", "Half-Orc", "Tiefling"];
const NAMES = ["Альфред", "Беатрис", "Гарат", "Дориан", "Эвелина", "Кайрен", "Лиан", "Маргарет", "Николас", "Оливия"];
const TITLES = ["Сумрачный лес", "Проклятие Тенебры", "Кровь и пепел", "Тайна старого маяка", "Песнь дракона"];
const LOC_DESCS = ["Древнее место силы.", "Мрачные руины, поросшие мхом.", "Оживленный торговый город."];
const NPC_DESCS = ["Хитрый торговец, знающий больше, чем говорит.", "Старый наемник с тяжелым прошлым.", "Молодой маг, ищущий приключений."];

async function seed() {
  await supabase.from("name_pool").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("title_pool").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("description_pool").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  const namesToInsert: any[] = [];
  for (const race of RACES) {
    for (const name of NAMES) {
      namesToInsert.push({ race_name: race, name: `${name} (${race})`, locale: "ru" });
    }
  }
  await supabase.from("name_pool").insert(namesToInsert);

  const titlesToInsert = TITLES.map(t => ({ title: t, locale: "ru" }));
  await supabase.from("title_pool").insert(titlesToInsert);

  const descsToInsert: any[] = [];
  for (const text of LOC_DESCS) {
    descsToInsert.push({ entity_type: "location", text, locale: "ru" });
  }
  for (const text of NPC_DESCS) {
    descsToInsert.push({ entity_type: "npc", text, locale: "ru" });
  }
  await supabase.from("description_pool").insert(descsToInsert);

  console.log("Пулы успешно заполнены!");
}

seed().catch(console.error);