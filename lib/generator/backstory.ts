import type { Character, Rng } from "@/types/generator";

interface Origin {
  text: string;
  races?: string[];
}

const ORIGINS: Origin[] = [
  { text: "в небольшой деревне на границе королевства" },
  { text: "в портовом городе, где всё продаётся" },
  { text: "в горной крепости, окружённой туманом" },
  { text: "в столице, среди интриг и богатства" },
  { text: "в лесу, вдали от людей", races: ["Elf", "Half-Elf", "Druid"] },
  { text: "в подземном городе дварфов", races: ["Dwarf"] },
  { text: "в трущобах, где каждый выживает как может" },
  { text: "в монастыре на вершине холма" },
  { text: "в караван-сарае на перекрёстке торговых путей" },
  { text: "на ферме, вдали от больших дорог" },
];

const RELATIVES = ["отец", "мать", "старший брат", "младшая сестра", "наставник", "дядя", "дед"];

const PROFESSIONS = [
  "кузнецом",
  "жрецом",
  "солдатом",
  "торговцем",
  "писцом",
  "охотником",
  "травником",
  "лекарем",
  "капитаном стражи",
  "вором",
  "бардом",
  "наёмником",
];

interface EventPhrase {
  text: string;
  tones?: string[];
}

const EVENTS: EventPhrase[] = [
  { text: "его семья погибла в пожаре" },
  { text: "его отец был убит на войне" },
  { text: "его мать умерла от болезни" },
  { text: "его предали те, кому он доверял", tones: ["dark_fantasy", "political"] },
  { text: "его изгнали из родного дома" },
  { text: "его наставник погиб у него на глазах" },
  { text: "его обвинили в преступлении, которого он не совершал" },
  { text: "его деревня была уничтожена" },
  { text: "его брат пропал без вести" },
  { text: "он потерял всё из-за нелепой случайности", tones: ["comedic"] },
  { text: "он выжил там, где не должен был", tones: ["heroic", "wild"] },
  { text: "его прокляли, и он до сих пор не знает, за что", tones: ["dark_fantasy", "religious"] },
];

const DECISIONS = [
  "сбежал",
  "поклялся отомстить",
  "ушёл в изгнание",
  "примкнул к гильдии",
  "стал наёмником",
  "отправился в путь",
  "заперся в себе",
  "поклялся защищать других",
  "решил всё забыть",
  "начал охоту за правдой",
];

function pickFrom<T>(arr: T[], rng: Rng): T {
  return arr[Math.floor(rng() * arr.length)];
}

function pickOrigin(character: Omit<Character, "backstory">, rng: Rng): string {
  const suitable = ORIGINS.filter(
    (o) => !o.races || o.races.includes(character.race_name),
  );
  const pool = suitable.length > 0 ? suitable : ORIGINS;
  return pickFrom(pool, rng).text;
}

function pickEvent(tone: string, rng: Rng): string {
  const preferred = EVENTS.filter((e) => e.tones?.includes(tone));
  const rest = EVENTS.filter((e) => !e.tones);
  const pool = preferred.length > 0 && rng() < 0.6 ? preferred : rest;
  return pickFrom(pool, rng).text;
}

function capitalize(s: string): string {
  return s.length === 0 ? s : s[0].toUpperCase() + s.slice(1);
}

function lowerFirst(s: string): string {
  return s.length === 0 ? s : s[0].toLowerCase() + s.slice(1);
}

export function generateBackstory(
  character: Omit<Character, "backstory">,
  tone: string,
  rng: Rng,
): string {
  const origin = pickOrigin(character, rng);
  const relative = pickFrom(RELATIVES, rng);
  const profession = pickFrom(PROFESSIONS, rng);
  const age = 15 + Math.floor(rng() * 11);
  const event = pickEvent(tone, rng);
  const decision = pickFrom(DECISIONS, rng);

  const motivation = lowerFirst(character.personality.motivation);
  const fear = lowerFirst(character.personality.fears[0] ?? "неизвестность");

  return `${character.name} родился ${origin}. ${capitalize(relative)} был ${profession}. В ${age} лет ${event}, после чего ${character.name.split(" ")[0]} ${decision}. Теперь он хочет ${motivation}, но его страх — ${fear} — не отпускает.`;
}