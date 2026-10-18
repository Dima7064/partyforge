import type { Abilities, Ability, Rng } from "@/types/generator";

const COST: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

const MIN_SCORE = 8;
const MAX_SCORE = 15;
const BUDGET = 27;

export function rollAbilities(priorities: Ability[], rng: Rng): Abilities {
  const scores: Abilities = {
    str: 8,
    dex: 8,
    con: 8,
    int: 8,
    wis: 8,
    cha: 8,
  };

  let budget = BUDGET;

  const targets = buildTargets(priorities, rng);

  for (const ability of priorities) {
    const target = targets[ability];
    while (scores[ability] < target && budget > 0) {
      const next = scores[ability] + 1;
      const stepCost = COST[next] - COST[scores[ability]];
      if (budget < stepCost) break;
      budget -= stepCost;
      scores[ability] = next;
    }
  }

  while (budget > 0) {
    const candidates = priorities.filter((a) => {
      if (scores[a] >= MAX_SCORE) return false;
      const next = scores[a] + 1;
      const stepCost = COST[next] - COST[scores[a]];
      return stepCost <= budget;
    });

    if (candidates.length === 0) break;

    const weights = candidates.map((a, i) => ({
      item: a,
      weight: Math.max(1, priorities.length - i),
    }));

    const chosen = pickWeightedSimple(weights, rng);
    const next = scores[chosen] + 1;
    budget -= COST[next] - COST[scores[chosen]];
    scores[chosen] = next;
  }

  return scores;
}

function buildTargets(priorities: Ability[], rng: Rng): Record<Ability, number> {
  const targets: Partial<Record<Ability, number>> = {};

  const baseByPosition = [15, 14, 13, 12, 10, 10];

  for (let i = 0; i < priorities.length; i++) {
    const ability = priorities[i];
    let target = baseByPosition[i] ?? 10;

    const jitter = rng();
    if (jitter < 0.25 && target < MAX_SCORE) target += 1;
    else if (jitter > 0.75 && target > MIN_SCORE + 1) target -= 1;

    targets[ability] = target;
  }

  return targets as Record<Ability, number>;
}

function pickWeightedSimple<T>(items: { item: T; weight: number }[], rng: Rng): T {
  const total = items.reduce((s, x) => s + x.weight, 0);
  let r = rng() * total;
  for (const x of items) {
    r -= x.weight;
    if (r < 0) return x.item;
  }
  return items[items.length - 1].item;
}

export function isValidPointBuy(scores: Abilities): boolean {
  let total = 0;
  for (const value of Object.values(scores)) {
    if (value < MIN_SCORE || value > MAX_SCORE) return false;
    total += COST[value];
  }
  return total <= BUDGET;
}