import { describe, it, expect } from "vitest";
import { generateWorld } from "@/lib/generator/world";
import { mulberry32 } from "@/lib/generator/random";
import type { Character, GeneratorInput } from "@/types/generator";

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

const party4: Character[] = [
  makeChar("A", "Paladin"),
  makeChar("B", "Cleric"),
  makeChar("C", "Rogue"),
  makeChar("D", "Fighter"),
];

describe("generateWorld — локации", () => {
  it("возвращает 4 локации", () => {
    const rng = mulberry32(1);
    const world = generateWorld(baseInput, party4, rng);
    expect(world.locations).toHaveLength(4);
  });

  it("все локации разных типов", () => {
    const rng = mulberry32(1);
    const world = generateWorld(baseInput, party4, rng);
    const types = new Set(world.locations.map((l) => l.type));
    expect(types.size).toBe(4);
  });

  it("у каждой локации имя и описание", () => {
    const rng = mulberry32(1);
    const world = generateWorld(baseInput, party4, rng);
    for (const l of world.locations) {
      expect(l.name.length).toBeGreaterThan(0);
      expect(l.description.length).toBeGreaterThan(0);
    }
  });
});

describe("generateWorld — character_locations", () => {
  it("каждый персонаж связан с 1-2 локациями", () => {
    const rng = mulberry32(1);
    const world = generateWorld(baseInput, party4, rng);
    const counts = new Map<number, number>();
    for (const cl of world.character_locations) {
      counts.set(cl.character_index, (counts.get(cl.character_index) ?? 0) + 1);
    }
    for (let i = 0; i < party4.length; i++) {
      expect(counts.get(i)).toBeGreaterThanOrEqual(1);
      expect(counts.get(i)).toBeLessThanOrEqual(2);
    }
  });

  it("connection_type — из разрешённых значений", () => {
    const rng = mulberry32(1);
    const world = generateWorld(baseInput, party4, rng);
    const allowed = ["born", "lost", "served", "dreams"];
    for (const cl of world.character_locations) {
      expect(allowed).toContain(cl.connection_type);
    }
  });
});

describe("generateWorld — фракции", () => {
  it("3-4 фракции", () => {
    const rng = mulberry32(1);
    const world = generateWorld(baseInput, party4, rng);
    expect(world.factions.length).toBeGreaterThanOrEqual(3);
    expect(world.factions.length).toBeLessThanOrEqual(4);
  });

  it("есть ally, enemy и neutral", () => {
    const rng = mulberry32(1);
    const world = generateWorld(baseInput, party4, rng);
    const attitudes = new Set(world.factions.map((f) => f.attitude));
    expect(attitudes.has("ally")).toBe(true);
    expect(attitudes.has("enemy")).toBe(true);
    expect(attitudes.has("neutral")).toBe(true);
  });

  it("у фракции есть имя, цель, описание", () => {
    const rng = mulberry32(1);
    const world = generateWorld(baseInput, party4, rng);
    for (const f of world.factions) {
      expect(f.name.length).toBeGreaterThan(0);
      expect(f.goals.length).toBeGreaterThan(0);
      expect(f.description.length).toBeGreaterThan(0);
    }
  });
});

describe("generateWorld — NPC", () => {
  it("по 3 NPC на каждого персонажа", () => {
    const rng = mulberry32(1);
    const world = generateWorld(baseInput, party4, rng);
    expect(world.npcs).toHaveLength(party4.length * 3);
  });

  it("для каждого персонажа есть ally, enemy, neutral", () => {
    const rng = mulberry32(1);
    const world = generateWorld(baseInput, party4, rng);
    const roles = new Set(world.npcs.map((n) => n.role));
    expect(roles.has("ally")).toBe(true);
    expect(roles.has("enemy")).toBe(true);
    expect(roles.has("neutral")).toBe(true);
  });

  it("все имена уникальны", () => {
    const rng = mulberry32(1);
    const world = generateWorld(baseInput, party4, rng);
    const names = world.npcs.map((n) => n.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("generateWorld — ситуация", () => {
  it("ситуация непустая", () => {
    const rng = mulberry32(1);
    const world = generateWorld(baseInput, party4, rng);
    expect(world.situation.length).toBeGreaterThan(0);
  });
});

describe("generateWorld — детерминизм", () => {
  it("детерминирован при одном seed", () => {
    const w1 = generateWorld(baseInput, party4, mulberry32(42));
    const w2 = generateWorld(baseInput, party4, mulberry32(42));
    expect(w1).toEqual(w2);
  });

  it("разные seed — разные миры", () => {
    const w1 = generateWorld(baseInput, party4, mulberry32(1));
    const w2 = generateWorld(baseInput, party4, mulberry32(2));
    expect(JSON.stringify(w1)).not.toBe(JSON.stringify(w2));
  });
});