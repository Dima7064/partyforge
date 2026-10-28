import fs from "node:fs";
import path from "node:path";
import type { SavedCampaignData } from "@/types/generator";

interface MLData {
  centroids: number[][];
  cluster_names: Record<string, string>;
  scaler_mean: number[];
  scaler_scale: number[];
}

let mlData: MLData | null = null;

function loadMLData(): MLData {
  if (mlData) return mlData;
  const filePath = path.join(process.cwd(), "public", "ml-clusters.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  mlData = JSON.parse(raw);
  return mlData!;
}

export function computeFeatures(campaign: SavedCampaignData): number[] {
  const classCounts = { tank: 0, healer: 0, dps: 0, face: 0, control: 0, support: 0 };
  campaign.characters.forEach(c => classCounts[c.role]++);

  const locCounts = { city: 0, temple: 0, forest: 0, ruins: 0, port: 0 };
  campaign.locations.forEach(l => { if (l.type in locCounts) locCounts[l.type as keyof typeof locCounts]++; });

  const relCounts = { trust: 0, debt: 0, love: 0, conflict: 0, secret: 0 };
  campaign.relationships.forEach(r => relCounts[r.type]++);

  return [
    campaign.input.level, campaign.input.party_size,
    campaign.input.tone === "dark_fantasy" ? 1 : 0,
    campaign.input.tone === "heroic" ? 1 : 0,
    campaign.input.tone === "political" ? 1 : 0,
    classCounts.tank, classCounts.healer, classCounts.dps, classCounts.face, classCounts.control, classCounts.support,
    locCounts.city, locCounts.temple, locCounts.forest, locCounts.ruins, locCounts.port,
    relCounts.trust, relCounts.debt, relCounts.love, relCounts.conflict, relCounts.secret
  ];
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export function findClosestCluster(features: number[]): { id: number, name: string } {
  const data = loadMLData();
  let bestId = 0;
  let bestSim = -1;

  data.centroids.forEach((centroid, idx) => {
    const sim = cosineSimilarity(features, centroid);
    if (sim > bestSim) {
      bestSim = sim;
      bestId = idx;
    }
  });

  return { id: bestId, name: data.cluster_names[bestId.toString()] || "Неизвестный тип" };
}