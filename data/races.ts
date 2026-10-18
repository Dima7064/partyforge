export interface RaceSeed {
  name: string;
  tone_tags: string[];
  description: string;
}

export const races: RaceSeed[] = [
  { name: "Human", tone_tags: ["heroic", "political", "dark"], description: "Амбициозные и вездесущие." },
  { name: "Elf", tone_tags: ["heroic", "wild", "dark"], description: "Древние и грациозные." },
  { name: "Dwarf", tone_tags: ["heroic", "political", "religious"], description: "Крепкие и упрямые." },
  { name: "Halfling", tone_tags: ["comedic", "heroic", "wild"], description: "Маленькие и удачливые." },
  { name: "Dragonborn", tone_tags: ["heroic", "political", "dark"], description: "Наследие драконов." },
  { name: "Gnome", tone_tags: ["comedic", "wild", "heroic"], description: "Изобретательные и любопытные." },
  { name: "Half-Elf", tone_tags: ["political", "dark", "heroic"], description: "Между двумя мирами." },
  { name: "Half-Orc", tone_tags: ["dark", "wild", "heroic"], description: "Сила и ярость." },
  { name: "Tiefling", tone_tags: ["dark", "political", "wild"], description: "Договор в крови." },
];