import { describe, it, expect } from "vitest";
import { generateBackstory } from "@/lib/generator/backstory";
import { mulberry32 } from "@/lib/generator/random";
import type { Character } from "@/types/generator";

const baseCharacter: Omit<Character, "backstory"> = {
  name: "Кайрен",
  class_name: "Rogue",
  race_name: "Human",
  background_name: "Criminal",
  level: 3,
  role: "dps",
  abilities: { str: 10, dex: 15, con: 13, int: 12, wis: 10, cha: 8 },
  personality: {
    values: ["Свобода"],
    fears: ["Стать чудовищем"],
    habits: ["Играет с монетой"],
    motivation: "Найти убийцу семьи",
  },
  secret_text: "",
};

describe("generateBackstory", () => {
  it("возвращает непустой текст", () => {
    const rng = mulberry32(1);
    const text = generateBackstory(baseCharacter, "dark_fantasy", rng);
    expect(text.length).toBeGreaterThan(100);
  });

  it("содержит имя персонажа", () => {
    const rng = mulberry32(1);
    const text = generateBackstory(baseCharacter, "dark_fantasy", rng);
    expect(text).toContain("Кайрен");
  });

  it("содержит мотивацию", () => {
    const rng = mulberry32(1);
    const text = generateBackstory(baseCharacter, "dark_fantasy", rng);
    expect(text.toLowerCase()).toContain("найти убийцу семьи");
  });

  it("содержит страх", () => {
    const rng = mulberry32(1);
    const text = generateBackstory(baseCharacter, "dark_fantasy", rng);
    expect(text.toLowerCase()).toContain("стать чудовищем");
  });

  it("детерминирован при одном seed", () => {
    const make = (seed: number) =>
      generateBackstory(baseCharacter, "dark_fantasy", mulberry32(seed));
    expect(make(123)).toBe(make(123));
  });

  it("разные seed — разные тексты (статистически)", () => {
    const texts = new Set<string>();
    for (let seed = 0; seed < 20; seed++) {
      texts.add(generateBackstory(baseCharacter, "dark_fantasy", mulberry32(seed)));
    }
    expect(texts.size).toBeGreaterThan(15);
  });

  it("не падает при пустом страхе", () => {
    const rng = mulberry32(1);
    const charNoFear = {
      ...baseCharacter,
      personality: { ...baseCharacter.personality, fears: [] },
    };
    expect(() =>
      generateBackstory(charNoFear, "dark_fantasy", rng),
    ).not.toThrow();
  });

  it("эльф рождается в эльфийском месте", () => {
    const elf = { ...baseCharacter, race_name: "Elf" };
    const rng = mulberry32(1);
    const text = generateBackstory(elf, "dark_fantasy", rng);
    // В пуле ORIGINS эльфы могут попасть в лес или общие места
    expect(text).toContain("Кайрен");
    expect(text).not.toContain("дварфов");
  });

  it("дварф рождается в дварфийском месте", () => {
    const dwarf = { ...baseCharacter, race_name: "Dwarf" };
    const rng = mulberry32(1);
    const text = generateBackstory(dwarf, "dark_fantasy", rng);
    // Дварф может попасть в подземный город или общие места
    expect(text).toContain("Кайрен");
    expect(text).not.toContain("в лесу, вдали от людей");
  });
});