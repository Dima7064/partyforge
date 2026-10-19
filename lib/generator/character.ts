import type {
  BackgroundRow,
  Character,
  ClassRow,
  GeneratorData,
  GeneratorInput,
  RaceRow,
  Rng,
} from "@/types/generator";
import { pickWeighted, type Weighted } from "./random";
import { rollAbilities } from "./abilities";
import { pickUniqueName } from "./names";
import { generatePersonality } from "./personality";
import { generateBackstory } from "./backstory";
import { pickSecret } from "./secret";
import { portraitForCharacter } from "./images";

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
    .map((c) => ({ item: c, weight: toneMap.get(c.id) ?? 1.0 }));

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
    .map((r) => ({ item: r, weight: toneMap.get(r.id) ?? 1.0 }));

  if (candidates.length === 0) {
    throw new Error("pickRace: нет доступных рас после фильтров");
  }

  return pickWeighted(candidates, rng);
}

export function pickBackground(
  data: GeneratorData,
  rng: Rng,
): BackgroundRow {
  return data.backgrounds[Math.floor(rng() * data.backgrounds.length)];
}

export interface CharacterContext {
  rng: Rng;
  existingClassIds: Set<string>;
  existingNames: Set<string>;
}

export function generateCharacter(
  input: GeneratorInput,
  data: GeneratorData,
  ctx: CharacterContext,
): Character {
  const cls = pickClass(input, data, ctx.rng, ctx.existingClassIds);
  ctx.existingClassIds.add(cls.id);

  const race = pickRace(input, data, ctx.rng);
  const background = pickBackground(data, ctx.rng);
  const name = pickUniqueName(race, ctx.rng, ctx.existingNames);
  const abilities = rollAbilities(cls.ability_priorities, ctx.rng);
  const personality = generatePersonality(data, input.tone, cls, ctx.rng);
  const secret_text = pickSecret(data, input.tone, cls.name, ctx.rng);

  const partial: Omit<Character, "backstory"> = {
    name,
    class_name: cls.name,
    race_name: race.name,
    background_name: background.name,
    level: input.level,
    role: cls.role,
    abilities,
    personality,
    secret_text,
  };

  const backstory = generateBackstory(partial, input.tone, ctx.rng);

  const finalChar: Character = { ...partial, backstory };
  finalChar.image_url = portraitForCharacter(finalChar);

  return finalChar;
}