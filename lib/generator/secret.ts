import type { GeneratorData, Rng, SecretRow, Tone } from "@/types/generator";
import { pickWeighted, type Weighted } from "./random";

const FALLBACK_SECRET = "Он хранит тайну, которую боится раскрыть.";

export function pickSecret(
  data: GeneratorData,
  tone: Tone,
  className: string,
  rng: Rng,
): string {
  if (data.secrets.length === 0) return FALLBACK_SECRET;

  const classNameLower = className.toLowerCase();

  const candidates: Weighted<SecretRow>[] = data.secrets
    .filter((s) => {
      if (s.tags.length === 0) return true;
      if (s.tags.includes("any")) return true;
      if (s.tags.includes(tone)) return true;
      if (s.tags.includes(classNameLower)) return true;
      return false;
    })
    .map((s) => {
      let weight = 1.0;
      if (s.tags.includes(tone)) weight *= 2;
      if (s.tags.includes(classNameLower)) weight *= 2;
      if (s.tags.length === 0 || s.tags.includes("any")) weight *= 0.5;
      return { item: s, weight };
    });

  if (candidates.length === 0) {
    return data.secrets[Math.floor(rng() * data.secrets.length)].text;
  }

  return pickWeighted(candidates, rng).text;
}