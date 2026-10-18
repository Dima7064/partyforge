import { describe, it, expect } from "vitest";
import { pickClass, pickRace, rollAbilities } from "@/lib/generator/character";
import { mulberry32 } from "@/lib/generator/random";
import { fixtureData } from "./fixtures";
import type { GeneratorInput } from "@/types/generator";

const baseInput: GeneratorInput = {
  system: "dnd5e",
  level: 3,
  tone: "dark_fantasy",
  party_size: 4,
  world: "custom",
  constraints: {},
  duration: "mini_campaign",
};

describe("pickClass", () => {
  it("детерминирован при одном seed", () => {
    const rng1 = mulberry32(42);
    const rng2 = mulberry32(42);
    const a = pickClass(baseInput, fixtureData, rng1);
    const b = pickClass(baseInput, fixtureData, rng2);
    expect(a.id).toBe(b.id);
  });

  it("исключает banned_classes по имени", () => {
    const rng = mulberry32(1);
    const input: GeneratorInput = {
      ...baseInput,
      constraints: { banned_classes: ["Rogue", "Warlock"] },
    };
    for (let i = 0; i < 30; i++) {
      const cls = pickClass(input, fixtureData, rng);
      expect(cls.name).not.toBe("Rogue");
      expect(cls.name).not.toBe("Warlock");
    }
  });

  it("исключает excludeIds", () => {
    const rng = mulberry32(1);
    const excluded = new Set(["c1", "c2", "c3", "c4", "c5"]);
    for (let i = 0; i < 20; i++) {
      const cls = pickClass(baseInput, fixtureData, rng, excluded);
      expect(cls.id).toBe("c6");
    }
  });

  it("кидает, если все классы забанены", () => {
    const rng = mulberry32(1);
    const input: GeneratorInput = {
      ...baseInput,
      constraints: {
        banned_classes: fixtureData.classes.map((c) => c.name),
      },
    };
    expect(() => pickClass(input, fixtureData, rng)).toThrow();
  });

  it("статистически предпочитает tone-классы", () => {
    const rng = mulberry32(12345);
    const counts: Record<string, number> = {};
    for (let i = 0; i < 1000; i++) {
      const cls = pickClass(baseInput, fixtureData, rng);
      counts[cls.name] = (counts[cls.name] ?? 0) + 1;
    }
    expect(counts["Rogue"]).toBeGreaterThan(counts["Paladin"] ?? 0);
    expect(counts["Warlock"]).toBeGreaterThan(counts["Cleric"] ?? 0);
  });
});

describe("pickRace", () => {
  it("исключает banned_races", () => {
    const rng = mulberry32(1);
    const input: GeneratorInput = {
      ...baseInput,
      constraints: { banned_races: ["Tiefling"] },
    };
    for (let i = 0; i < 30; i++) {
      const race = pickRace(input, fixtureData, rng);
      expect(race.name).not.toBe("Tiefling");
    }
  });
});

describe("rollAbilities", () => {
  it("возвращает все 6 характеристик", () => {
    const rng = mulberry32(1);
    const abilities = rollAbilities(["str", "dex", "con", "int", "wis", "cha"], rng);
    expect(Object.keys(abilities).sort()).toEqual(["cha", "con", "dex", "int", "str", "wis"]);
  });

  it("высокие значения достаются приоритетным", () => {
    const rng = mulberry32(1);
    const abilities = rollAbilities(["dex", "con", "int", "wis", "cha", "str"], rng);
    expect(abilities.dex).toBe(15);
    expect(abilities.con).toBe(14);
    expect(abilities.str).toBe(8);
  });
});