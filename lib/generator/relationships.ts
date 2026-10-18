import type {
  Character,
  Relationship,
  RelationshipType,
  Rng,
} from "@/types/generator";
import { pickWeighted } from "./random";

const RELATIONSHIP_TYPES: RelationshipType[] = [
  "trust",
  "debt",
  "love",
  "conflict",
  "secret",
];

const BASE_WEIGHTS: Record<RelationshipType, number> = {
  trust: 2.0,
  debt: 1.5,
  love: 1.0,
  conflict: 2.0,
  secret: 1.5,
};

const DESCRIPTIONS: Record<RelationshipType, string[]> = {
  trust: [
    "Они доверяют друг другу с детства.",
    "Они спасли друг друга в бою.",
    "Они знают секреты друг друга, но молчат.",
    "Они поклялись защищать друг друга.",
  ],
  debt: [
    "Один должен другому крупную сумму.",
    "Один спас жизнь другому, и тот не знает, как отплатить.",
    "Один прикрыл другого перед командиром.",
    "Один вытащил другого из тюрьмы.",
  ],
  love: [
    "Они тайно влюблены друг в друга.",
    "Они были любовниками, но расстались.",
    "Один любит, другой — нет.",
    "Они женаты втайне от всех.",
  ],
  conflict: [
    "Они ненавидят друг друга за прошлое.",
    "Один винит другого в смерти близкого.",
    "Они соперничают за место лидера.",
    "Один предал другого, но они вынуждены работать вместе.",
  ],
  secret: [
    "Один знает тайну другого, но не говорит.",
    "Один видел, что другой сделал ночью.",
    "Один знает, что другой — не тот, кем притворяется.",
    "Один хранит письмо, которое может разрушить жизнь другого.",
  ],
};

function pickType(
  charA: Character,
  charB: Character,
  rng: Rng,
): RelationshipType {
  const overrides: Partial<Record<RelationshipType, number>> = {};
  const pair = [charA.class_name, charB.class_name].sort().join("|");
  if (pair === "Paladin|Rogue" || pair === "Cleric|Warlock") {
    overrides.conflict = 4.0;
  }
  if (pair === "Bard|Paladin" || pair === "Cleric|Fighter") {
    overrides.trust = 4.0;
  }

  const candidates = RELATIONSHIP_TYPES.map((t) => ({
    item: t,
    weight: overrides[t] ?? BASE_WEIGHTS[t],
  }));

  return pickWeighted(candidates, rng);
}

function pickDescription(type: RelationshipType, rng: Rng): string {
  const pool = DESCRIPTIONS[type];
  return pool[Math.floor(rng() * pool.length)];
}

export function generateRelationships(
  characters: Character[],
  rng: Rng,
): Relationship[] {
  if (characters.length < 2) return [];

  const relationships: Relationship[] = [];
  const seen = new Set<string>();

  function edgeKey(a: number, b: number): string {
    const [x, y] = a < b ? [a, b] : [b, a];
    return `${x}-${y}`;
  }

  // 1. Spanning tree: первые 3 ребра покрывают trust/conflict/secret
  const spanningTypes: RelationshipType[] = ["trust", "conflict", "secret"];
  for (let i = 1; i < characters.length; i++) {
    const key = edgeKey(i - 1, i);
    if (seen.has(key)) continue;
    seen.add(key);
    const type = i - 1 < spanningTypes.length
      ? spanningTypes[i - 1]
      : pickType(characters[i - 1], characters[i], rng);
    relationships.push({
      source_character_index: i - 1,
      target_character_index: i,
      type,
      description: pickDescription(type, rng),
    });
  }

  // 2. Дополнительные рёбра до target density
  const targetEdges = Math.ceil(1.5 * characters.length);
  const presentTypes = new Set(relationships.map((r) => r.type));
  const missing = spanningTypes.filter((t) => !presentTypes.has(t));
  let forceIdx = 0;
  let attempts = 0;
  const maxAttempts = 100;

  while (relationships.length < targetEdges && attempts < maxAttempts) {
    attempts++;
    const i = Math.floor(rng() * characters.length);
    const j = Math.floor(rng() * characters.length);
    if (i === j) continue;
    const key = edgeKey(i, j);
    if (seen.has(key)) continue;
    seen.add(key);
    const type = forceIdx < missing.length
      ? missing[forceIdx]
      : pickType(characters[i], characters[j], rng);
    if (forceIdx < missing.length) forceIdx++;
    relationships.push({
      source_character_index: i,
      target_character_index: j,
      type,
      description: pickDescription(type, rng),
    });
  }

  return relationships;
}

export interface RelationshipsValidationResult {
  valid: boolean;
  issues: string[];
}

export function validateRelationships(
  characters: Character[],
  relationships: Relationship[],
): RelationshipsValidationResult {
  const issues: string[] = [];

  if (characters.length < 2) {
    return { valid: true, issues: [] };
  }

  const degree = new Array(characters.length).fill(0);
  for (const r of relationships) {
    if (
      r.source_character_index >= 0 &&
      r.source_character_index < characters.length
    ) {
      degree[r.source_character_index]++;
    }
    if (
      r.target_character_index >= 0 &&
      r.target_character_index < characters.length
    ) {
      degree[r.target_character_index]++;
    }
  }
  const isolated = degree.filter((d) => d === 0).length;
  if (isolated > 0) {
    issues.push(`${isolated} изолированных персонажей`);
  }

  const selfLoop = relationships.some(
    (r) => r.source_character_index === r.target_character_index,
  );
  if (selfLoop) issues.push("есть связь персонажа с самим собой");

  const types = new Set(relationships.map((r) => r.type));
  if (!types.has("conflict")) issues.push("нет ни одного конфликта");
  if (!types.has("trust") && !types.has("love") && !types.has("debt")) {
    issues.push("нет ни одной позитивной связи");
  }
  if (!types.has("secret")) issues.push("нет ни одной тайной связи");

  return { valid: issues.length === 0, issues };
}