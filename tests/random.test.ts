import { describe, it, expect } from "vitest";
import { mulberry32, pickWeighted, seedFromString } from "@/lib/generator/random";

describe("mulberry32", () => {
  it("детерминирован: один seed — одна последовательность", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect(a()).toBe(b());
    expect(a()).toBe(b());
    expect(a()).toBe(b());
  });

  it("разные seed — разные последовательности", () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    expect(a()).not.toBe(b());
  });

  it("числа в диапазоне [0, 1)", () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 100; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("pickWeighted", () => {
  it("выбирает элемент с ненулевым весом", () => {
    const items = [
      { item: "a", weight: 0 },
      { item: "b", weight: 1 },
      { item: "c", weight: 0 },
    ];
    const rng = mulberry32(1);
    for (let i = 0; i < 50; i++) {
      expect(pickWeighted(items, rng)).toBe("b");
    }
  });

  it("кидает, если все веса нулевые", () => {
    const items = [{ item: "a", weight: 0 }];
    const rng = mulberry32(1);
    expect(() => pickWeighted(items, rng)).toThrow();
  });

  it("детерминирован при одном seed", () => {
    const items = [
      { item: "a", weight: 1 },
      { item: "b", weight: 1 },
      { item: "c", weight: 1 },
    ];
    const rng1 = mulberry32(99);
    const rng2 = mulberry32(99);
    const result1 = Array.from({ length: 20 }, () => pickWeighted(items, rng1));
    const result2 = Array.from({ length: 20 }, () => pickWeighted(items, rng2));
    expect(result1).toEqual(result2);
  });
});

describe("seedFromString", () => {
  it("детерминирован", () => {
    expect(seedFromString("hello")).toBe(seedFromString("hello"));
  });

  it("разные строки — разные seed", () => {
    expect(seedFromString("abc")).not.toBe(seedFromString("abd"));
  });
});