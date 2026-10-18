export interface ToneWeightSeed {
  tone: string;
  entity_type: "class" | "race" | "trait";
  entity_name: string;
  weight: number;
}

export const toneWeights: ToneWeightSeed[] = [
  // dark_fantasy
  { tone: "dark_fantasy", entity_type: "class", entity_name: "Rogue", weight: 1.5 },
  { tone: "dark_fantasy", entity_type: "class", entity_name: "Warlock", weight: 1.5 },
  { tone: "dark_fantasy", entity_type: "class", entity_name: "Barbarian", weight: 1.3 },
  { tone: "dark_fantasy", entity_type: "class", entity_name: "Paladin", weight: 0.7 },
  { tone: "dark_fantasy", entity_type: "race", entity_name: "Tiefling", weight: 1.5 },
  { tone: "dark_fantasy", entity_type: "race", entity_name: "Half-Orc", weight: 1.3 },
  { tone: "dark_fantasy", entity_type: "race", entity_name: "Human", weight: 0.8 },

  // heroic
  { tone: "heroic", entity_type: "class", entity_name: "Paladin", weight: 1.5 },
  { tone: "heroic", entity_type: "class", entity_name: "Bard", weight: 1.3 },
  { tone: "heroic", entity_type: "class", entity_name: "Fighter", weight: 1.3 },
  { tone: "heroic", entity_type: "class", entity_name: "Warlock", weight: 0.6 },
  { tone: "heroic", entity_type: "race", entity_name: "Human", weight: 1.3 },
  { tone: "heroic", entity_type: "race", entity_name: "Dwarf", weight: 1.2 },
  { tone: "heroic", entity_type: "race", entity_name: "Tiefling", weight: 0.7 },

  // comedic
  { tone: "comedic", entity_type: "class", entity_name: "Bard", weight: 1.5 },
  { tone: "comedic", entity_type: "class", entity_name: "Rogue", weight: 1.3 },
  { tone: "comedic", entity_type: "class", entity_name: "Barbarian", weight: 1.2 },
  { tone: "comedic", entity_type: "class", entity_name: "Paladin", weight: 0.7 },
  { tone: "comedic", entity_type: "race", entity_name: "Halfling", weight: 1.5 },
  { tone: "comedic", entity_type: "race", entity_name: "Gnome", weight: 1.5 },
  { tone: "comedic", entity_type: "race", entity_name: "Half-Orc", weight: 0.8 },

  // political
  { tone: "political", entity_type: "class", entity_name: "Bard", weight: 1.4 },
  { tone: "political", entity_type: "class", entity_name: "Rogue", weight: 1.3 },
  { tone: "political", entity_type: "class", entity_name: "Wizard", weight: 1.3 },
  { tone: "political", entity_type: "race", entity_name: "Human", weight: 1.3 },
  { tone: "political", entity_type: "race", entity_name: "Half-Elf", weight: 1.3 },
  { tone: "political", entity_type: "race", entity_name: "Dwarf", weight: 1.1 },

  // wild
  { tone: "wild", entity_type: "class", entity_name: "Druid", weight: 1.5 },
  { tone: "wild", entity_type: "class", entity_name: "Ranger", weight: 1.4 },
  { tone: "wild", entity_type: "class", entity_name: "Barbarian", weight: 1.3 },
  { tone: "wild", entity_type: "race", entity_name: "Elf", weight: 1.3 },
  { tone: "wild", entity_type: "race", entity_name: "Half-Orc", weight: 1.3 },
  { tone: "wild", entity_type: "race", entity_name: "Human", weight: 0.8 },

  // religious
  { tone: "religious", entity_type: "class", entity_name: "Cleric", weight: 1.6 },
  { tone: "religious", entity_type: "class", entity_name: "Paladin", weight: 1.5 },
  { tone: "religious", entity_type: "class", entity_name: "Warlock", weight: 0.7 },
  { tone: "religious", entity_type: "race", entity_name: "Dwarf", weight: 1.2 },
  { tone: "religious", entity_type: "race", entity_name: "Human", weight: 1.1 },
];