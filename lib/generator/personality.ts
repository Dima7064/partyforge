import type {
  ClassRow,
  GeneratorData,
  Personality,
  Rng,
  Tone,
  TraitRow,
} from "@/types/generator";
import { pickWeighted, type Weighted } from "./random";

const CONTRADICTION_PAIRS: [string, string][] = [
  ["Свобода", "Порядок"],
  ["Свобода", "Традиции"],
  ["Свобода", "Власть"],
  ["Хаос", "Порядок"],
  ["Правда", "Тайна"],
  ["Одиночество", "Дружба"],
  ["Месть", "Милосердие"],
  ["Искупление", "Месть"],
];

function contradicts(candidate: string, existing: string[]): boolean {
  for (const [a, b] of CONTRADICTION_PAIRS) {
    if (candidate === a && existing.includes(b)) return true;
    if (candidate === b && existing.includes(a)) return true;
  }
  return false;
}

function traitWeight(trait: TraitRow, tone: Tone): number {
  return trait.tags.includes(tone) ? 2.0 : 1.0;
}

function pickTraits(
  data: GeneratorData,
  type: TraitRow["type"],
  tone: Tone,
  rng: Rng,
  count: number,
  options: { avoid?: string[]; classBoost?: ClassRow | null } = {},
): TraitRow[] {
  const pool = data.traits.filter((t) => t.type === type);
  if (pool.length === 0) {
    throw new Error(`pickTraits: пул для типа "${type}" пуст`);
  }

  const picked: TraitRow[] = [];
  const usedNames = new Set<string>(options.avoid ?? []);

  let guard = 0;
  while (picked.length < count && guard < 50) {
    guard++;
    const candidates: Weighted<TraitRow>[] = pool
      .filter((t) => !usedNames.has(t.name))
      .filter((t) => !contradicts(t.name, [...usedNames]))
      .map((t) => {
        let weight = traitWeight(t, tone);
        if (options.classBoost) {
          const className = options.classBoost.name.toLowerCase();
          if (t.tags.includes(className)) weight *= 2;
        }
        return { item: t, weight };
      });

    if (candidates.length === 0) break;

    const chosen = pickWeighted(candidates, rng);
    picked.push(chosen);
    usedNames.add(chosen.name);
  }

  return picked;
}

export function generatePersonality(
  data: GeneratorData,
  tone: Tone,
  cls: ClassRow,
  rng: Rng,
): Personality {
  const valuesCount = 2 + (rng() < 0.4 ? 1 : 0);
  const values = pickTraits(data, "value", tone, rng, valuesCount);
  const fears = pickTraits(data, "fear", tone, rng, 2);
  const habits = pickTraits(data, "habit", tone, rng, 2);
  const motivation = pickTraits(data, "motivation", tone, rng, 1, {
    classBoost: cls,
  });

  return {
    values: values.map((v) => v.name),
    fears: fears.map((f) => f.name),
    habits: habits.map((h) => h.name),
    motivation: motivation[0]?.name ?? "Найти своё место в мире",
  };
}