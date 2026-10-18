import type {
  Character,
  GeneratorData,
  GeneratorInput,
  Rng,
} from "@/types/generator";
import { generateCharacter } from "./character";

const CORE_ROLES = ["tank", "healer", "dps"] as const;
const MAX_ATTEMPTS = 10;

const SYNERGIES: [string, string][] = [
  ["Bard", "Paladin"],
  ["Bard", "Fighter"],
  ["Bard", "Cleric"],
  ["Cleric", "Fighter"],
  ["Cleric", "Barbarian"],
  ["Paladin", "Fighter"],
  ["Paladin", "Cleric"],
  ["Rogue", "Fighter"],
  ["Rogue", "Barbarian"],
  ["Wizard", "Fighter"],
  ["Wizard", "Cleric"],
  ["Warlock", "Rogue"],
  ["Druid", "Ranger"],
  ["Druid", "Barbarian"],
];

export function validateRoles(characters: Character[]): {
  valid: boolean;
  missing: string[];
} {
  const present = new Set(characters.map((c) => c.role));
  const missing = CORE_ROLES.filter((r) => !present.has(r));
  return { valid: missing.length === 0, missing: [...missing] };
}

export function scoreSynergy(characters: Character[]): number {
  let score = 0;
  for (let i = 0; i < characters.length; i++) {
    for (let j = i + 1; j < characters.length; j++) {
      const a = characters[i].class_name;
      const b = characters[j].class_name;
      const has = SYNERGIES.some(
        ([x, y]) => (x === a && y === b) || (x === b && y === a),
      );
      if (has) score += 1;
    }
  }
  return score;
}

function entropy(values: string[]): number {
  if (values.length === 0) return 0;
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  let h = 0;
  for (const count of counts.values()) {
    const p = count / values.length;
    h -= p * Math.log2(p);
  }
  return h;
}

export function scoreDiversity(characters: Character[]): number {
  const classEntropy = entropy(characters.map((c) => c.class_name));
  const raceEntropy = entropy(characters.map((c) => c.race_name));
  return classEntropy + raceEntropy;
}

function tryGenerateParty(
  input: GeneratorInput,
  data: GeneratorData,
  rng: Rng,
): Character[] {
  const characters: Character[] = [];
  const existingClassIds = new Set<string>();
  const existingNames = new Set<string>();

  for (let i = 0; i < input.party_size; i++) {
    const char = generateCharacter(input, data, {
      rng,
      existingClassIds,
      existingNames,
    });
    characters.push(char);
  }

  return characters;
}

export function generateBalancedParty(
  input: GeneratorInput,
  data: GeneratorData,
  rng: Rng,
): Character[] {
  let best: Character[] = [];
  let bestScore = -Infinity;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const characters = tryGenerateParty(input, data, rng);
    const roleCheck = validateRoles(characters);
    if (!roleCheck.valid) continue;

    const score = scoreSynergy(characters) + scoreDiversity(characters);
    if (score > bestScore) {
      bestScore = score;
      best = characters;
    }
  }

  if (best.length === 0) {
    return tryGenerateParty(input, data, rng);
  }

  return best;
}