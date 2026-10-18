import type { GeneratorData } from "@/types/generator";

export const fixtureData: GeneratorData = {
  classes: [
    { id: "c1", name: "Rogue", role: "dps", ability_priorities: ["dex", "con", "int", "wis", "cha", "str"], tone_tags: ["dark"], description: "" },
    { id: "c2", name: "Warlock", role: "dps", ability_priorities: ["cha", "con", "dex", "wis", "int", "str"], tone_tags: ["dark"], description: "" },
    { id: "c3", name: "Paladin", role: "tank", ability_priorities: ["str", "cha", "con", "wis", "dex", "int"], tone_tags: ["heroic"], description: "" },
    { id: "c4", name: "Fighter", role: "tank", ability_priorities: ["str", "con", "dex", "wis", "cha", "int"], tone_tags: ["heroic"], description: "" },
    { id: "c5", name: "Cleric", role: "healer", ability_priorities: ["wis", "con", "str", "dex", "cha", "int"], tone_tags: ["heroic"], description: "" },
    { id: "c6", name: "Wizard", role: "control", ability_priorities: ["int", "con", "dex", "wis", "cha", "str"], tone_tags: ["dark"], description: "" },
  ],
  races: [
    { id: "r1", name: "Human", tone_tags: ["heroic"], description: "" },
    { id: "r2", name: "Elf", tone_tags: ["wild"], description: "" },
    { id: "r3", name: "Tiefling", tone_tags: ["dark"], description: "" },
    { id: "r4", name: "Dwarf", tone_tags: ["heroic"], description: "" },
  ],
  backgrounds: [
    { id: "b1", name: "Acolyte", tone_tags: [], description: "" },
    { id: "b2", name: "Criminal", tone_tags: [], description: "" },
    { id: "b3", name: "Soldier", tone_tags: [], description: "" },
  ],
  traits: [],
  secrets: [],
  hook_templates: [],
  tone_weights: [
    { id: "tw1", tone: "dark_fantasy", entity_type: "class", entity_id: "c1", weight: 3 },
    { id: "tw2", tone: "dark_fantasy", entity_type: "class", entity_id: "c2", weight: 3 },
    { id: "tw3", tone: "dark_fantasy", entity_type: "class", entity_id: "c3", weight: 0.5 },
    { id: "tw4", tone: "dark_fantasy", entity_type: "class", entity_id: "c5", weight: 0.5 },
    { id: "tw5", tone: "dark_fantasy", entity_type: "race", entity_id: "r3", weight: 3 },
    { id: "tw6", tone: "dark_fantasy", entity_type: "race", entity_id: "r1", weight: 0.5 },
  ],
};