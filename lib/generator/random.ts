import type { Rng } from "@/types/generator";

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seedFromString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function pickOne<T>(arr: T[], rng: Rng): T {
  if (arr.length === 0) throw new Error("pickOne: empty array");
  return arr[Math.floor(rng() * arr.length)];
}

export interface Weighted<T> {
  item: T;
  weight: number;
}

export function pickWeighted<T>(items: Weighted<T>[], rng: Rng): T {
  const positive = items.filter((x) => x.weight > 0);
  if (positive.length === 0) throw new Error("pickWeighted: no positive weights");
  const total = positive.reduce((s, x) => s + x.weight, 0);
  let r = rng() * total;
  for (const x of positive) {
    r -= x.weight;
    if (r < 0) return x.item;
  }
  return positive[positive.length - 1].item;
}