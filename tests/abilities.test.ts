import { describe, it, expect } from "vitest";
import { rollAbilities, isValidPointBuy } from "@/lib/generator/abilities";
import { mulberry32 } from "@/lib/generator/random";
import type { Ability } from "@/types/generator";

const ALL_ABILITIES: Ability[] = ["str", "dex", "con", "int", "wis", "cha"];

describe("rollAbilities", () => {
  it("возвращает все 6 характеристик", () => {
    const rng = mulberry32(1);
    const result = rollAbilities(ALL_ABILITIES, rng);
    expect(Object.keys(result).sort()).toEqual([
      "cha", "con", "dex", "int", "str", "wis",
    ]);
  });

  it("все значения в диапазоне [8, 15]", () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 50; i++) {
      const result = rollAbilities(ALL_ABILITIES, rng);
      for (const value of Object.values(result)) {
        expect(value).toBeGreaterThanOrEqual(8);
        expect(value).toBeLessThanOrEqual(15);
      }
    }
  });

  it("укладывается в бюджет 27 очков", () => {
    const rng = mulberry32(42);
    for (let i = 0; i < 100; i++) {
      const result = rollAbilities(ALL_ABILITIES, rng);
      expect(isValidPointBuy(result)).toBe(true);
    }
  });

  it("высокие значения достаются приоритетным характеристикам", () => {
    const rng = mulberry32(123);
    const priorities: Ability[] = ["dex", "con", "int", "wis", "cha", "str"];
    let dexHigher = 0;
    for (let i = 0; i < 100; i++) {
      const r = rollAbilities(priorities, rng);
      if (r.dex > r.str) dexHigher++;
    }
    expect(dexHigher).toBeGreaterThan(80);
  });

  it("детерминирован при одном seed", () => {
    const rng1 = mulberry32(99);
    const rng2 = mulberry32(99);
    expect(rollAbilities(ALL_ABILITIES, rng1)).toEqual(
      rollAbilities(ALL_ABILITIES, rng2),
    );
  });

  it("разные seed — разные наборы (статистически)", () => {
    const results = new Set<string>();
    for (let seed = 0; seed < 20; seed++) {
      const rng = mulberry32(seed);
      const result = rollAbilities(ALL_ABILITIES, rng);
      results.add(JSON.stringify(result));
    }
    expect(results.size).toBeGreaterThan(10);
  });

  it("кидает, если приоритеты пустые", () => {
    const rng = mulberry32(1);
    expect(() => rollAbilities([], rng)).not.toThrow();
    const result = rollAbilities([], rng);
    for (const value of Object.values(result)) {
      expect(value).toBe(8);
    }
  });
});