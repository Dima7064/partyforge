import { describe, it, expect } from "vitest";
import { pickSecret } from "@/lib/generator/secret";
import { mulberry32 } from "@/lib/generator/random";
import { fixtureData } from "./fixtures";

describe("pickSecret", () => {
  it("возвращает непустую строку", () => {
    const rng = mulberry32(1);
    const secret = pickSecret(fixtureData, "dark_fantasy", "Rogue", rng);
    expect(secret.length).toBeGreaterThan(0);
  });

  it("детерминирован при одном seed", () => {
    const s1 = pickSecret(fixtureData, "dark_fantasy", "Rogue", mulberry32(42));
    const s2 = pickSecret(fixtureData, "dark_fantasy", "Rogue", mulberry32(42));
    expect(s1).toBe(s2);
  });

  it("предпочитает tone-тайны", () => {
    let darkCount = 0;
    let otherCount = 0;
    for (let seed = 0; seed < 200; seed++) {
      const secret = pickSecret(fixtureData, "dark_fantasy", "Wizard", mulberry32(seed));
      const row = fixtureData.secrets.find((s) => s.text === secret);
      if (row?.tags.includes("dark_fantasy")) darkCount++;
      else otherCount++;
    }
    expect(darkCount).toBeGreaterThan(otherCount);
  });

  it("фильтрует тайны, не подходящие по классу и тону", () => {
    // tone = heroic, класс = Rogue
    // Подходят: s1, s2, s5 (тег rogue) ИЛИ s4 (тег heroic)
    const rng = mulberry32(1);
    for (let i = 0; i < 30; i++) {
      const secret = pickSecret(fixtureData, "heroic", "Rogue", rng);
      const row = fixtureData.secrets.find((s) => s.text === secret);
      if (row) {
        const matchesClass = row.tags.includes("rogue");
        const matchesTone = row.tags.includes("heroic");
        expect(matchesClass || matchesTone).toBe(true);
      }
    }
  });

  it("не падает при пустом пуле", () => {
    const empty = { ...fixtureData, secrets: [] };
    const rng = mulberry32(1);
    const result = pickSecret(empty, "dark_fantasy", "Rogue", rng);
    expect(result.length).toBeGreaterThan(0);
  });

  it("не падает, если ни одна тайна не подошла", () => {
    const rng = mulberry32(1);
    const result = pickSecret(fixtureData, "heroic", "UnknownClass", rng);
    expect(result.length).toBeGreaterThan(0);
  });
});