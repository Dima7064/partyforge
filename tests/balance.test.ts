import { describe, it, expect } from "vitest";
import {
  validateRoles,
  scoreSynergy,
  scoreDiversity,
  generateBalancedParty,
} from "@/lib/generator/balance";
import { mulberry32 } from "@/lib/generator/random";
import { fixtureData } from "./fixtures";
import type { Character, CharacterRole, GeneratorInput } from "@/types/generator";

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

const makeChar = (
  role: CharacterRole,
  className: string,
  raceName = "Human",
): Character => ({
  name: "Test",
  class_name: className,
  race_name: raceName,
  background_name: "Soldier",
  level: 3,
  role,
  abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  personality: { values: [], fears: [], habits: [], motivation: "" },
  backstory: "",
  secret_text: "",
});

describe("validateRoles", () => {
  it("valid для полного набора ролей", () => {
    const chars = [
      makeChar("tank", "Paladin"),
      makeChar("healer", "Cleric"),
      makeChar("dps", "Rogue"),
    ];
    const result = validateRoles(chars);
    expect(result.valid).toBe(true);
    expect(result.missing).toEqual([]);
  });

  it("invalid без танка", () => {
    const chars = [makeChar("healer", "Cleric"), makeChar("dps", "Rogue")];
    const result = validateRoles(chars);
    expect(result.valid).toBe(false);
    expect(result.missing).toContain("tank");
  });

  it("invalid без хилера", () => {
    const chars = [makeChar("tank", "Paladin"), makeChar("dps", "Rogue")];
    const result = validateRoles(chars);
    expect(result.valid).toBe(false);
    expect(result.missing).toContain("healer");
  });

  it("invalid без dps", () => {
    const chars = [makeChar("tank", "Paladin"), makeChar("healer", "Cleric")];
    const result = validateRoles(chars);
    expect(result.valid).toBe(false);
    expect(result.missing).toContain("dps");
  });
});

describe("scoreSynergy", () => {
  it("0 для одного персонажа", () => {
    expect(scoreSynergy([makeChar("dps", "Rogue")])).toBe(0);
  });

  it("0 для пустого массива", () => {
    expect(scoreSynergy([])).toBe(0);
  });

  it("положительный для синергичной пары", () => {
    const chars = [makeChar("tank", "Paladin"), makeChar("healer", "Cleric")];
    expect(scoreSynergy(chars)).toBeGreaterThan(0);
  });

  it("растёт при большем числе синергий", () => {
    const one = [makeChar("tank", "Paladin"), makeChar("healer", "Cleric")];
    const two = [
      makeChar("tank", "Paladin"),
      makeChar("healer", "Cleric"),
      makeChar("dps", "Fighter"),
    ];
    expect(scoreSynergy(two)).toBeGreaterThan(scoreSynergy(one));
  });
});

describe("scoreDiversity", () => {
  it("0 для пустого массива", () => {
    expect(scoreDiversity([])).toBe(0);
  });

  it("0 для одинаковых персонажей", () => {
    const chars = [
      makeChar("dps", "Rogue", "Human"),
      makeChar("dps", "Rogue", "Human"),
    ];
    expect(scoreDiversity(chars)).toBe(0);
  });

  it("растёт с разнообразием", () => {
    const uniform = [
      makeChar("dps", "Rogue", "Human"),
      makeChar("dps", "Rogue", "Human"),
    ];
    const diverse = [
      makeChar("dps", "Rogue", "Human"),
      makeChar("healer", "Cleric", "Elf"),
    ];
    expect(scoreDiversity(diverse)).toBeGreaterThan(scoreDiversity(uniform));
  });
});

describe("generateBalancedParty", () => {
  it("возвращает нужное количество персонажей", () => {
    const rng = mulberry32(42);
    const party = generateBalancedParty(baseInput, fixtureData, rng);
    expect(party).toHaveLength(4);
  });

  it("детерминирован при одном seed", () => {
    const p1 = generateBalancedParty(baseInput, fixtureData, mulberry32(42));
    const p2 = generateBalancedParty(baseInput, fixtureData, mulberry32(42));
    expect(p1).toEqual(p2);
  });

  it("содержит роли tank, healer, dps (если возможно)", () => {
    const rng = mulberry32(42);
    const party = generateBalancedParty(baseInput, fixtureData, rng);
    const check = validateRoles(party);
    expect(check.valid).toBe(true);
  });

  it("не падает, если нельзя собрать валидную партию", () => {
    const input = { ...baseInput, party_size: 2 };
    const rng = mulberry32(1);
    expect(() => generateBalancedParty(input, fixtureData, rng)).not.toThrow();
  });

  it("разные seed дают разные партии", () => {
    const p1 = generateBalancedParty(baseInput, fixtureData, mulberry32(1));
    const p2 = generateBalancedParty(baseInput, fixtureData, mulberry32(2));
    expect(JSON.stringify(p1)).not.toBe(JSON.stringify(p2));
  });
});