export interface HookTemplateSeed {
  template: string;
  type: "personal" | "social" | "exploration" | "combat";
  tags: string[];
}

export const hookTemplates: HookTemplateSeed[] = [
  {
    template: "{character} получает письмо от {npc} с просьбой о помощи.",
    type: "personal",
    tags: ["dark", "heroic"],
  },
  {
    template: "{character} узнаёт, что {faction} ищет его для важного задания.",
    type: "social",
    tags: ["political", "heroic"],
  },
  {
    template: "{character} находит старую карту к {location}.",
    type: "exploration",
    tags: ["wild", "heroic"],
  },
  {
    template: "{character} встречает старого знакомого — {npc}, у которого есть слухи.",
    type: "social",
    tags: ["political", "comedic"],
  },
  {
    template: "{character} получает предложение от {faction}: вступить в их ряды.",
    type: "social",
    tags: ["political", "heroic"],
  },
  {
    template: "{character} видит вещий сон о {location}.",
    type: "exploration",
    tags: ["religious", "dark"],
  },
  {
    template: "{character} находит {item}, который связан с его прошлым.",
    type: "personal",
    tags: ["dark", "heroic"],
  },
  {
    template: "{npc} просит {character} доставить послание в {location}.",
    type: "personal",
    tags: ["heroic", "religious"],
  },
  {
    template: "{character} случайно узнаёт тайну {npc}.",
    type: "social",
    tags: ["political", "comedic"],
  },
  {
    template: "{character} должен выбрать между {faction} и партией.",
    type: "social",
    tags: ["political", "dark"],
  },
  {
    template: "{character} замечает, что за ним следит {npc}.",
    type: "personal",
    tags: ["political", "rogue"],
  },
  {
    template: "В {location} начинается странное явление, и {character} должен выяснить причину.",
    type: "exploration",
    tags: ["wild", "wizard"],
  },
  {
    template: "{character} получает в наследство старый дом в {location}.",
    type: "personal",
    tags: ["comedic", "heroic"],
  },
  {
    template: "{npc} предлагает {character} сделку, от которой трудно отказаться.",
    type: "social",
    tags: ["political", "warlock"],
  },
  {
    template: "{character} находит странный символ на стене в {location}.",
    type: "exploration",
    tags: ["dark", "wizard"],
  },
];
