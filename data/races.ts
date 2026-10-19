export interface RaceSeed {
  name: string;
  theme: string[];
  tone_tags: string[];
  description: string;
}

export const races: RaceSeed[] = [
  // Классика
  { name: "Human", theme: ["classic"], tone_tags: ["heroic", "political", "dark"], description: "Амбициозные и вездесущие." },
  { name: "Elf", theme: ["classic"], tone_tags: ["heroic", "wild", "dark"], description: "Древние и грациозные." },
  { name: "Dwarf", theme: ["classic"], tone_tags: ["heroic", "political", "religious"], description: "Крепкие и упрямые." },
  { name: "Halfling", theme: ["classic"], tone_tags: ["comedic", "heroic", "wild"], description: "Маленькие и удачливые." },
  { name: "Dragonborn", theme: ["classic"], tone_tags: ["heroic", "political", "dark"], description: "Наследие драконов." },
  { name: "Gnome", theme: ["classic"], tone_tags: ["comedic", "wild", "heroic"], description: "Изобретательные и любопытные." },
  { name: "Half-Elf", theme: ["classic"], tone_tags: ["political", "dark", "heroic"], description: "Между двумя мирами." },
  { name: "Half-Orc", theme: ["classic"], tone_tags: ["dark", "wild", "heroic"], description: "Сила и ярость." },
  { name: "Tiefling", theme: ["classic"], tone_tags: ["dark", "political", "wild"], description: "Договор в крови." },
  
  // Skyrim
  { name: "Nord", theme: ["skyrim"], tone_tags: ["heroic", "wild", "dark"], description: "Суровые дети снегов." },
  { name: "Dunmer", theme: ["skyrim"], tone_tags: ["dark", "political", "wild"], description: "Тёмные эльфы Морровинда." },
  { name: "Altmer", theme: ["skyrim"], tone_tags: ["political", "heroic", "religious"], description: "Высокие эльфы с древней магией." },
  { name: "Bosmer", theme: ["skyrim"], tone_tags: ["wild", "comedic", "heroic"], description: "Лесные эльфы-охотники." },
  { name: "Khajiit", theme: ["skyrim"], tone_tags: ["comedic", "political", "dark"], description: "Кошачьи торговцы и воры." },
  { name: "Argonian", theme: ["skyrim"], tone_tags: ["wild", "dark", "religious"], description: "Ящероподобные жители болот." },
  { name: "Breton", theme: ["skyrim"], tone_tags: ["political", "heroic", "religious"], description: "Потомки людей и эльфов." },
  { name: "Redguard", theme: ["skyrim"], tone_tags: ["heroic", "wild", "political"], description: "Воины пустынь." },
  { name: "Orsimer", theme: ["skyrim"], tone_tags: ["wild", "heroic", "dark"], description: "Орки-кузнецы." },
  { name: "Imperial", theme: ["skyrim"], tone_tags: ["political", "heroic", "religious"], description: "Жители имперских земель." },
];