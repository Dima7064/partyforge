import { describe, it, expect } from "vitest";
import { pickClass, pickRace, pickBackground, generateCharacter } from "@/lib/generator/character";
import { mulberry32 } from "@/lib/generator/random";
import { fixtureData } from "./fixtures";
import type { GeneratorInput } from "@/types/generator";

const baseInput: GeneratorInput = {
  system: "dnd5e",
  level: 3,
  tone: "dark_fantasy",
  theme: "classic",
  party_size: 4,
  world: "custom",
  constraints: {},
  duration: "mini_campaign",
};

describe("pickClass", () => {
  it("детерминирован при одном seed", () => {
    const rng1 = mulberry32(42);
    const rng2 = mulberry32(42);
    expect(pickClass(baseInput, fixtureData, rng1).id).toBe(
      pickClass(baseInput, fixtureData, rng2).id,
    );
  });

  it("исключает banned_classes", () => {
    const rng = mulberry32(1);
    const input: GeneratorInput = {
      ...baseInput,
      constraints: { banned_classes: ["Rogue", "Warlock"] },
    };
    for (let i = 0; i < 30; i++) {
      const cls = pickClass(input, fixtureData, rng);
      expect(["Rogue", "Warlock"]).not.toContain(cls.name);
    }
  });

  it("кидает, если все классы забанены", () => {
    const rng = mulberry32(1);
    const input: GeneratorInput = {
      ...baseInput,
      constraints: { banned_classes: fixtureData.classes.map((c) => c.name) },
    };
    expect(() => pickClass(input, fixtureData, rng)).toThrow();
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
      expect(pickRace(input, fixtureData, rng).name).not.toBe("Tiefling");
    }
  });
});

describe("pickBackground", () => {
  it("возвращает предысторию из каталога", () => {
    const rng = mulberry32(1);
    const bg = pickBackground(fixtureData, rng);
    expect(fixtureData.backgrounds.map((b) => b.id)).toContain(bg.id);
  });
});

describe("generateCharacter", () => {
  it("заполняет все обязательные поля", () => {
    const rng = mulberry32(42);
    const ctx = {
      rng,
      existingClassIds: new Set<string>(),
      existingNames: new Set<string>(),
    };
    const char = generateCharacter(baseInput, fixtureData, ctx);
    expect(char.name).toBeTruthy();
    expect(char.class_name).toBeTruthy();
    expect(char.race_name).toBeTruthy();
    expect(char.background_name).toBeTruthy();
    expect(char.level).toBe(3);
    expect(char.role).toBeTruthy();
    expect(Object.keys(char.abilities)).toHaveLength(6);
  });

  it("заполняет personality и backstory", () => {
    const rng = mulberry32(42);
    const ctx = {
      rng,
      existingClassIds: new Set<string>(),
      existingNames: new Set<string>(),
    };
    const char = generateCharacter(baseInput, fixtureData, ctx);
    expect(char.personality.values.length).toBeGreaterThanOrEqual(2);
    expect(char.personality.fears).toHaveLength(2);
    expect(char.personality.habits).toHaveLength(2);
    expect(char.personality.motivation.length).toBeGreaterThan(0);
    expect(char.backstory.length).toBeGreaterThan(50);
    expect(char.backstory).toContain(char.name);
  });

  it("заполняет secret_text", () => {
    const rng = mulberry32(42);
    const ctx = {
      rng,
      existingClassIds: new Set<string>(),
      existingNames: new Set<string>(),
    };
    const char = generateCharacter(baseInput, fixtureData, ctx);
    expect(char.secret_text.length).toBeGreaterThan(0);
  });

  it("не повторяет классы в контексте", () => {
    const rng = mulberry32(1);
    const ctx = {
      rng,
      existingClassIds: new Set<string>(),
      existingNames: new Set<string>(),
    };
    const classes: string[] = [];
    for (let i = 0; i < 6; i++) {
      const char = generateCharacter(baseInput, fixtureData, ctx);
      classes.push(char.class_name);
    }
    expect(new Set(classes).size).toBe(6);
  });

  it("детерминирован при одном seed и чистом контексте", () => {
    const make = (seed: number) => {
      const ctx = {
        rng: mulberry32(seed),
        existingClassIds: new Set<string>(),
        existingNames: new Set<string>(),
      };
      return generateCharacter(baseInput, fixtureData, ctx);
    };
    expect(make(123)).toEqual(make(123));
  });

  it("генерирует 4 персонажа подряд без ошибок", () => {
    const rng = mulberry32(42);
    const ctx = {
      rng,
      existingClassIds: new Set<string>(),
      existingNames: new Set<string>(),
    };
    const party = Array.from({ length: 4 }, () =>
      generateCharacter(baseInput, fixtureData, ctx),
    );
    expect(party).toHaveLength(4);
    for (const c of party) {
      expect(c.name.length).toBeGreaterThan(0);
      expect(c.class_name.length).toBeGreaterThan(0);
      expect(c.secret_text.length).toBeGreaterThan(0);
      expect(c.backstory.length).toBeGreaterThan(50);
    }
    expect(new Set(party.map((c) => c.class_name)).size).toBe(4);
    expect(new Set(party.map((c) => c.name)).size).toBe(4);
  });
});