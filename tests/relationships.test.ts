import { describe, it, expect } from "vitest";
import {
  generateRelationships,
  validateRelationships,
} from "@/lib/generator/relationships";
import { mulberry32 } from "@/lib/generator/random";
import type { Character } from "@/types/generator";

function makeChar(name: string, className = "Rogue"): Character {
  return {
    name,
    class_name: className,
    race_name: "Human",
    background_name: "Soldier",
    level: 3,
    role: "dps",
    abilities: { str: 10, dex: 14, con: 12, int: 10, wis: 10, cha: 10 },
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

const party4: Character[] = [
  makeChar("A", "Paladin"),
  makeChar("B", "Cleric"),
  makeChar("C", "Rogue"),
  makeChar("D", "Fighter"),
];

const party3: Character[] = [
  makeChar("A", "Paladin"),
  makeChar("B", "Cleric"),
  makeChar("C", "Rogue"),
];

describe("generateRelationships", () => {
  it("пустая партия", () => {
    expect(generateRelationships([], mulberry32(1))).toEqual([]);
  });

  it("один персонаж — нет связей", () => {
    const result = generateRelationships([makeChar("A")], mulberry32(1));
    expect(result).toEqual([]);
  });

  it("детерминирован при одном seed", () => {
    const r1 = generateRelationships(party4, mulberry32(42));
    const r2 = generateRelationships(party4, mulberry32(42));
    expect(r1).toEqual(r2);
  });

  it("разные seed — разные связи", () => {
    const r1 = generateRelationships(party4, mulberry32(1));
    const r2 = generateRelationships(party4, mulberry32(2));
    expect(JSON.stringify(r1)).not.toBe(JSON.stringify(r2));
  });

  it("нет self-loop", () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 20; i++) {
      const result = generateRelationships(party4, rng);
      for (const r of result) {
        expect(r.source_character_index).not.toBe(r.target_character_index);
      }
    }
  });

  it("нет дублирующихся рёбер", () => {
    const rng = mulberry32(7);
    const result = generateRelationships(party4, rng);
    const keys = result.map((r) => {
      const [a, b] = [r.source_character_index, r.target_character_index].sort(
        (x, y) => x - y,
      );
      return `${a}-${b}`;
    });
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("нет изолированных в партии из 4", () => {
    const rng = mulberry32(7);
    const result = generateRelationships(party4, rng);
    const degree = new Array(party4.length).fill(0);
    for (const r of result) {
      degree[r.source_character_index]++;
      degree[r.target_character_index]++;
    }
    expect(degree.every((d) => d > 0)).toBe(true);
  });

  it("содержит trust, conflict, secret в партии из 4", () => {
    const rng = mulberry32(7);
    const result = generateRelationships(party4, rng);
    const types = new Set(result.map((r) => r.type));
    expect(types.has("trust")).toBe(true);
    expect(types.has("conflict")).toBe(true);
    expect(types.has("secret")).toBe(true);
  });

  it("все описания непустые", () => {
    const rng = mulberry32(1);
    const result = generateRelationships(party4, rng);
    for (const r of result) {
      expect(r.description.length).toBeGreaterThan(0);
    }
  });
});

describe("validateRelationships", () => {
  it("партия из 4 валидна", () => {
    const rng = mulberry32(7);
    const result = generateRelationships(party4, rng);
    const check = validateRelationships(party4, result);
    expect(check.valid).toBe(true);
  });

  it("партия из 3 валидна", () => {
    const rng = mulberry32(7);
    const result = generateRelationships(party3, rng);
    const check = validateRelationships(party3, result);
    expect(check.valid).toBe(true);
  });

  it("ловит изолированного персонажа", () => {
    const rel = [
      {
        source_character_index: 0,
        target_character_index: 1,
        type: "trust" as const,
        description: "test",
      },
      {
        source_character_index: 0,
        target_character_index: 1,
        type: "conflict" as const,
        description: "test",
      },
      {
        source_character_index: 0,
        target_character_index: 1,
        type: "secret" as const,
        description: "test",
      },
    ];
    const check = validateRelationships(party4, rel);
    expect(check.valid).toBe(false);
    expect(check.issues.some((i) => i.includes("изолированных"))).toBe(true);
  });

  it("ловит self-loop", () => {
    const rel = [
      {
        source_character_index: 0,
        target_character_index: 0,
        type: "trust" as const,
        description: "test",
      },
    ];
    const check = validateRelationships(party4, rel);
    expect(check.valid).toBe(false);
    expect(check.issues.some((i) => i.includes("самим собой"))).toBe(true);
  });

  it("ловит отсутствие конфликта", () => {
    const rel = [
      { source_character_index: 0, target_character_index: 1, type: "trust" as const, description: "" },
      { source_character_index: 1, target_character_index: 2, type: "secret" as const, description: "" },
      { source_character_index: 2, target_character_index: 3, type: "trust" as const, description: "" },
    ];
    const check = validateRelationships(party4, rel);
    expect(check.issues.some((i) => i.includes("конфликт"))).toBe(true);
  });

  it("ловит отсутствие позитива", () => {
    const rel = [
      { source_character_index: 0, target_character_index: 1, type: "conflict" as const, description: "" },
      { source_character_index: 1, target_character_index: 2, type: "secret" as const, description: "" },
      { source_character_index: 2, target_character_index: 3, type: "conflict" as const, description: "" },
    ];
    const check = validateRelationships(party4, rel);
    expect(check.issues.some((i) => i.includes("позитивной"))).toBe(true);
  });

  it("ловит отсутствие тайны", () => {
    const rel = [
      { source_character_index: 0, target_character_index: 1, type: "trust" as const, description: "" },
      { source_character_index: 1, target_character_index: 2, type: "conflict" as const, description: "" },
      { source_character_index: 2, target_character_index: 3, type: "trust" as const, description: "" },
    ];
    const check = validateRelationships(party4, rel);
    expect(check.issues.some((i) => i.includes("тайной"))).toBe(true);
  });
});