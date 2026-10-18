export interface BackgroundSeed {
  name: string;
  tone_tags: string[];
  description: string;
}

export const backgrounds: BackgroundSeed[] = [
  { name: "Acolyte", tone_tags: ["religious", "heroic", "dark"], description: "Служил в храме." },
  { name: "Criminal", tone_tags: ["dark", "political", "comedic"], description: "Жил вне закона." },
  { name: "Folk Hero", tone_tags: ["heroic", "wild", "comedic"], description: "Восстал из низов." },
  { name: "Noble", tone_tags: ["political", "dark", "heroic"], description: "Родился в знати." },
  { name: "Sage", tone_tags: ["political", "heroic", "dark"], description: "Искал знание." },
  { name: "Soldier", tone_tags: ["heroic", "political", "dark"], description: "Служил в армии." },
  { name: "Charlatan", tone_tags: ["comedic", "political", "dark"], description: "Жил обманом." },
  { name: "Sailor", tone_tags: ["wild", "heroic", "comedic"], description: "Бороздил моря." },
];
