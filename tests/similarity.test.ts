import { describe, it, expect } from "vitest";
import { cosineSimilarity } from "@/lib/ml/similarity";

describe("cosineSimilarity", () => {
  it("возвращает 1 для одинаковых векторов", () => {
    expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1);
  });
  it("возвращает 0 для перпендикулярных", () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBe(0);
  });
});