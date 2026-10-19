import { describe, it, expect } from "vitest";
import { pickName, pickUniqueName } from "@/lib/generator/names";
import { mulberry32 } from "@/lib/generator/random";
import type { RaceRow } from "@/types/generator";

const elf: RaceRow = { id: "r1", name: "Elf", name_ru: "Эльф", tone_tags: [], theme: ["classic"], description: "" };
const dwarf: RaceRow = { id: "r2", name: "Dwarf", name_ru: "Дварф", tone_tags: [], theme: ["classic"], description: "" };
const unknown: RaceRow = { id: "r3", name: "UnknownRace", name_ru: "Неизвестная раса", tone_tags: [], theme: ["classic"], description: "" };

describe("pickName", () => {
  it("возвращает имя из списка расы", () => {
    const rng = mulberry32(1);
    const name = pickName(elf, rng);
    expect(typeof name).toBe("string");
    expect(name.length).toBeGreaterThan(0);
  });

  it("детерминирован при одном seed", () => {
    const rng1 = mulberry32(42);
    const rng2 = mulberry32(42);
    expect(pickName(elf, rng1)).toBe(pickName(elf, rng2));
  });

  it("эльфийское имя отличается от дварфийского", () => {
    const elfNames = new Set<string>();
    const dwarfNames = new Set<string>();
    for (let seed = 0; seed < 30; seed++) {
      elfNames.add(pickName(elf, mulberry32(seed)));
      dwarfNames.add(pickName(dwarf, mulberry32(seed)));
    }
    const overlap = [...elfNames].filter((n) => dwarfNames.has(n));
    expect(overlap.length).toBe(0);
  });

  it("fallback для неизвестной расы", () => {
    const rng = mulberry32(1);
    const name = pickName(unknown, rng);
    expect(typeof name).toBe("string");
    expect(name.length).toBeGreaterThan(0);
  });
});

describe("pickUniqueName", () => {
  it("возвращает уникальные имена", () => {
    const rng = mulberry32(1);
    const used = new Set<string>();
    const names: string[] = [];
    for (let i = 0; i < 10; i++) {
      names.push(pickUniqueName(elf, rng, used));
    }
    expect(new Set(names).size).toBe(10);
  });

  it("добавляет суффикс, если все имена использованы", () => {
    const rng = mulberry32(1);
    const used = new Set<string>();
    const names: string[] = [];
    for (let i = 0; i < 30; i++) {
      names.push(pickUniqueName(elf, rng, used));
    }
    expect(new Set(names).size).toBe(30);
  });

  it("добавляет имя в used", () => {
    const rng = mulberry32(1);
    const used = new Set<string>();
    const name = pickUniqueName(elf, rng, used);
    expect(used.has(name)).toBe(true);
  });
});