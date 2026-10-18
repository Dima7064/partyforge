import { describe, it, expect } from "vitest";
import { generateHooks, validateHooks } from "@/lib/generator/hooks";
import { generateWorld } from "@/lib/generator/world";
import { generateRelationships } from "@/lib/generator/relationships";
import { mulberry32 } from "@/lib/generator/random";
import { fixtureData } from "./fixtures";
import type { Campaign, Character, GeneratorInput } from "@/types/generator";

const baseInput: GeneratorInput = {
  system: "dnd5e",
  level: 3,
  tone: "dark_fantasy",
  party_size: 4,
  world: "custom",
  constraints: {},
  duration: "mini_campaign",
};

function makeChar(name: string, className = "Rogue"): Character {
  return {
    name,
    class_name: className,
    race_name: "Human",
    background_name: "Soldier",
    level: 3,
    role: "dps",
    abilities: { str: 10, dex: 14, con: 12, int: 10, wis: 10, cha: 10 },
    personality: { values: [], fears: [], habits: [], motivation: "" },
    backstory: "",
    secret_text: "",
  };
}

function makePartial(rng: ReturnType<typeof mulberry32>): Omit<Campaign, "hooks"> {
  const characters = [
    makeChar("A", "Paladin"),
    makeChar("B", "Cleric"),
    makeChar("C", "Rogue"),
    makeChar("D", "Fighter"),
  ];
  const relationships = generateRelationships(characters, rng);
  const world = generateWorld(baseInput, characters, rng);
  return {
    input: baseInput,
    characters,
    relationships,
    locations: world.locations,
    character_locations: world.character_locations,
    factions: world.factions,
    npcs: world.npcs,
    situation: world.situation,
  };
}

describe("generateHooks", () => {
  it("пустые шаблоны — пустые крючки", () => {
    const rng = mulberry32(1);
    const partial = makePartial(rng);
    const hooks = generateHooks(partial, [], rng);
    expect(hooks).toEqual([]);
  });

  it("возвращает минимум по одному крючку на персонажа", () => {
    const rng = mulberry32(1);
    const partial = makePartial(rng);
    const hooks = generateHooks(partial, fixtureData.hook_templates, rng);
    expect(hooks.length).toBeGreaterThanOrEqual(partial.characters.length);
  });

  it("у каждого крючка title и description", () => {
    const rng = mulberry32(1);
    const partial = makePartial(rng);
    const hooks = generateHooks(partial, fixtureData.hook_templates, rng);
    for (const h of hooks) {
      expect(h.title.length).toBeGreaterThan(0);
      expect(h.description.length).toBeGreaterThan(0);
    }
  });

  it("в описании нет незаполненных плейсхолдеров", () => {
    const rng = mulberry32(1);
    const partial = makePartial(rng);
    const hooks = generateHooks(partial, fixtureData.hook_templates, rng);
    for (const h of hooks) {
      expect(h.description).not.toContain("{character}");
      expect(h.description).not.toContain("{npc}");
      expect(h.description).not.toContain("{faction}");
      expect(h.description).not.toContain("{location}");
    }
  });

  it("в описании есть имя персонажа", () => {
    const rng = mulberry32(1);
    const partial = makePartial(rng);
    const hooks = generateHooks(partial, fixtureData.hook_templates, rng);
    for (const h of hooks) {
      const char = partial.characters.find((c) => h.description.includes(c.name));
      expect(char).toBeDefined();
    }
  });

  it("детерминирован при одном seed", () => {
    const r1 = generateHooks(makePartial(mulberry32(42)), fixtureData.hook_templates, mulberry32(42));
    const r2 = generateHooks(makePartial(mulberry32(42)), fixtureData.hook_templates, mulberry32(42));
    expect(r1).toEqual(r2);
  });
});

describe("validateHooks", () => {
  it("true, если каждый персонаж покрыт", () => {
    const rng = mulberry32(1);
    const partial = makePartial(rng);
    const hooks = generateHooks(partial, fixtureData.hook_templates, rng);
    expect(validateHooks(hooks, partial.characters.length)).toBe(true);
  });

  it("false при пустых крючках", () => {
    expect(validateHooks([], 4)).toBe(false);
  });

  it("false, если не все покрыты", () => {
    const hooks = [
      { title: "A", description: "test", type: "personal" as const, character_index: 0 },
      { title: "B", description: "test", type: "social" as const, character_index: 0 },
    ];
    expect(validateHooks(hooks, 4)).toBe(false);
  });
});