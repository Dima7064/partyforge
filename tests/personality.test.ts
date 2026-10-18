import { describe, it, expect } from "vitest";
import { generatePersonality } from "@/lib/generator/personality";
import { mulberry32 } from "@/lib/generator/random";
import { fixtureData } from "./fixtures";

const rogue = fixtureData.classes.find((c) => c.name === "Rogue")!;

describe("generatePersonality", () => {
  it("возвращает 2-3 ценности", () => {
    const rng = mulberry32(1);
    for (let i = 0; i < 20; i++) {
      const p = generatePersonality(fixtureData, "dark_fantasy", rogue, rng);
      expect(p.values.length).toBeGreaterThanOrEqual(2);
      expect(p.values.length).toBeLessThanOrEqual(3);
    }
  });

  it("возвращает ровно 2 страха и 2 привычки", () => {
    const rng = mulberry32(1);
    const p = generatePersonality(fixtureData, "dark_fantasy", rogue, rng);
    expect(p.fears).toHaveLength(2);
    expect(p.habits).toHaveLength(2);
  });

  it("мотивация не пустая", () => {
    const rng = mulberry32(1);
    const p = generatePersonality(fixtureData, "dark_fantasy", rogue, rng);
    expect(p.motivation.length).toBeGreaterThan(0);
  });

  it("не дублирует черты", () => {
    const rng = mulberry32(42);
    for (let i = 0; i < 20; i++) {
      const p = generatePersonality(fixtureData, "dark_fantasy", rogue, rng);
      expect(new Set(p.values).size).toBe(p.values.length);
      expect(new Set(p.fears).size).toBe(2);
      expect(new Set(p.habits).size).toBe(2);
    }
  });

  it("не создаёт противоречий", () => {
    const rng = mulberry32(7);
    const contradictions: [string, string][] = [
      ["Свобода", "Порядок"],
      ["Правда", "Тайна"],
      ["Одиночество", "Дружба"],
    ];
    for (let i = 0; i < 100; i++) {
      const p = generatePersonality(fixtureData, "dark_fantasy", rogue, rng);
      for (const [a, b] of contradictions) {
        const hasA = p.values.includes(a);
        const hasB = p.values.includes(b);
        expect(hasA && hasB).toBe(false);
      }
    }
  });

  it("детерминирован при одном seed", () => {
    const make = (seed: number) =>
      generatePersonality(fixtureData, "dark_fantasy", rogue, mulberry32(seed));
    expect(make(123)).toEqual(make(123));
  });

  it("статистически предпочитает tone-черты", () => {
    let darkCount = 0;
    let neutralCount = 0;
    for (let seed = 0; seed < 200; seed++) {
      const p = generatePersonality(
        fixtureData,
        "dark_fantasy",
        rogue,
        mulberry32(seed),
      );
      for (const fear of p.fears) {
        const trait = fixtureData.traits.find(
          (t) => t.type === "fear" && t.name === fear,
        );
        if (trait?.tags.includes("dark_fantasy")) darkCount++;
        else neutralCount++;
      }
    }
    expect(darkCount).toBeGreaterThan(neutralCount);
  });
});