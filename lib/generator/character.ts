import type {
  Abilities,
  Ability,
  BackgroundRow,
  Character,
  ClassRow,
  GeneratorData,
  GeneratorInput,
  RaceRow,
  Rng,
} from "@/types/generator";
import { pickWeighted, type Weighted } from "./random";

function buildToneWeightMap(data: GeneratorData, tone: string) {
  const map = new Map<string, number>();
  for (const tw of data.tone_weights) {
    if (tw.tone === tone) map.set(tw.entity_id, tw.weight);
  }
  return map;
}

export function pickClass(
  input: GeneratorInput,
  data: GeneratorData,
  rng: Rng,
  excludeIds: Set<string> = new Set(),
): ClassRow {
  const banned = new Set(input.constraints.banned_classes ?? []);
  const toneMap = buildToneWeightMap(data, input.tone);

  const candidates: Weighted<ClassRow>[] = data.classes
    .filter((c) => !banned.has(c.name) && !excludeIds.has(c.id))
    .map((c) => ({
      item: c,
      weight: toneMap.get(c.id) ?? 1.0,
    }));

  if (candidates.length === 0) {
    throw new Error("pickClass: нет доступных классов после фильтров");
  }

  return pickWeighted(candidates, rng);
}

export function pickRace(
  input: GeneratorInput,
  data: GeneratorData,
  rng: Rng,
): RaceRow {
  const banned = new Set(input.constraints.banned_races ?? []);
  const toneMap = buildToneWeightMap(data, input.tone);

  const candidates: Weighted<RaceRow>[] = data.races
    .filter((r) => !banned.has(r.name))
    .map((r) => ({
      item: r,
      weight: toneMap.get(r.id) ?? 1.0,
    }));

  if (candidates.length === 0) {
    throw new Error("pickRace: нет доступных рас после фильтров");
  }

  return pickWeighted(candidates, rng);
}

const FIRST_NAMES = [
  "Кайрен", "Мира", "Торн", "Элара", "Гарат", "Лиан", "Сора", "Дариус",
  "Нэрис", "Бран", "Вела", "Ксав", "Инара", "Рэй", "Тавия", "Освальд",
];

export function pickName(rng: Rng): string {
  return FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
}

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

export function rollAbilities(priorities: Ability[], rng: Rng): Abilities {
  const arr = [...STANDARD_ARRAY];
  const result: Partial<Abilities> = {};
  for (const ability of priorities) {
    result[ability] = arr.shift()!;
  }
  return result as Abilities;
}

export interface CharacterContext {
  rng: Rng;
  existingIds: Set<string>;
  existingNames: Set<string>;
}

export function generateCharacter(
  input: GeneratorInput,
  data: GeneratorData,
  ctx: CharacterContext,
): Character {
  const cls = pickClass(input, data, ctx.rng, ctx.existingIds);
  ctx.existingIds.add(cls.id);

  const race = pickRace(input, data, ctx.rng);

  const backgroundPool = data.backgrounds;
  const background = backgroundPool.length > 0
    ? backgroundPool[Math.floor(ctx.rng() * backgroundPool.length)]
    : data.backgrounds[0];

  let name = pickName(ctx.rng);
  let attempts = 0;
  while (ctx.existingNames.has(name) && attempts < 20) {
    name = pickName(ctx.rng);
    attempts++;
  }
  if (ctx.existingNames.has(name)) name = `${name}-${ctx.existingNames.size}`;
  ctx.existingNames.add(name);

  const abilities = rollAbilities(cls.ability_priorities, ctx.rng);

  return {
    name,
    class_name: cls.name,
    race_name: race.name,
    background_name: background.name,
    level: input.level,
    role: cls.role,
    abilities,
    personality: {
      values: [],
      fears: [],
      habits: [],
      motivation: "",
    },
    backstory: "",
    secret_text: "",
  };
}