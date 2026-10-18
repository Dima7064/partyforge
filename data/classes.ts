export interface ClassSeed {
  name: string;
  role: "tank" | "healer" | "dps" | "face" | "control" | "support";
  ability_priorities: string[];
  tone_tags: string[];
  description: string;
}

export const classes: ClassSeed[] = [
  { name: "Barbarian", role: "tank", ability_priorities: ["str", "con", "dex", "wis", "cha", "int"], tone_tags: ["dark", "heroic", "wild"], description: "Неукротимый воин ярости." },
  { name: "Bard", role: "face", ability_priorities: ["cha", "dex", "con", "wis", "int", "str"], tone_tags: ["heroic", "comedic", "political"], description: "Мастер слов и музыки." },
  { name: "Cleric", role: "healer", ability_priorities: ["wis", "con", "str", "dex", "cha", "int"], tone_tags: ["heroic", "dark", "religious"], description: "Проводник воли богов." },
  { name: "Druid", role: "control", ability_priorities: ["wis", "con", "dex", "int", "cha", "str"], tone_tags: ["wild", "heroic", "dark"], description: "Хранитель природы." },
  { name: "Fighter", role: "tank", ability_priorities: ["str", "con", "dex", "wis", "cha", "int"], tone_tags: ["heroic", "political", "dark"], description: "Мастер оружия и тактики." },
  { name: "Monk", role: "dps", ability_priorities: ["dex", "wis", "con", "str", "cha", "int"], tone_tags: ["heroic", "wild", "political"], description: "Воин дисциплины и тела." },
  { name: "Paladin", role: "tank", ability_priorities: ["str", "cha", "con", "wis", "dex", "int"], tone_tags: ["heroic", "religious", "dark"], description: "Клятва и свет." },
  { name: "Ranger", role: "dps", ability_priorities: ["dex", "wis", "con", "str", "int", "cha"], tone_tags: ["wild", "heroic", "dark"], description: "Охотник на границе." },
  { name: "Rogue", role: "dps", ability_priorities: ["dex", "con", "int", "wis", "cha", "str"], tone_tags: ["dark", "political", "comedic"], description: "Тень и точность." },
  { name: "Sorcerer", role: "dps", ability_priorities: ["cha", "con", "dex", "wis", "int", "str"], tone_tags: ["dark", "wild", "heroic"], description: "Магия в крови." },
  { name: "Warlock", role: "dps", ability_priorities: ["cha", "con", "dex", "wis", "int", "str"], tone_tags: ["dark", "political", "wild"], description: "Сделка с силой." },
  { name: "Wizard", role: "control", ability_priorities: ["int", "con", "dex", "wis", "cha", "str"], tone_tags: ["dark", "heroic", "political"], description: "Знание как оружие." },
];