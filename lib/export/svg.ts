import type { SavedCampaignData } from "@/types/generator";

const COLORS: Record<string, string> = {
  trust: "#5fa85f",
  debt: "#c9a227",
  love: "#d66f9e",
  conflict: "#b8451a",
  secret: "#8a5fc9",
};

const LABELS: Record<string, string> = {
  trust: "доверие",
  debt: "долг",
  love: "любовь",
  conflict: "конфликт",
  secret: "тайна",
};

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function exportRelationshipsSvg(campaign: SavedCampaignData): string {
  const width = 1000;
  const height = 800;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(cx, cy) - 120;
  const n = campaign.characters.length;

  const nodes = campaign.characters.map((c, i) => {
    const angle = (2 * Math.PI * i) / Math.max(1, n) - Math.PI / 2;
    return {
      i,
      name: c.name,
      className: c.class_name,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });

  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
  );
  parts.push(`<rect width="100%" height="100%" fill="#0f0d0a"/>`);

  // Рёбра
  for (const r of campaign.relationships) {
    const a = nodes[r.source_character_index];
    const b = nodes[r.target_character_index];
    if (!a || !b) continue;
    const color = COLORS[r.type] ?? "#8a7d6d";
    const dash = r.type === "conflict" ? ' stroke-dasharray="8,4"' : "";
    parts.push(
      `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${color}" stroke-width="2"${dash}/>`,
    );
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    parts.push(
      `<text x="${mx}" y="${my}" fill="${color}" font-size="11" font-family="sans-serif" text-anchor="middle" paint-order="stroke" stroke="#0f0d0a" stroke-width="3">${escape(LABELS[r.type] ?? r.type)}</text>`,
    );
  }

  // Узлы
  for (const node of nodes) {
    parts.push(
      `<circle cx="${node.x}" cy="${node.y}" r="46" fill="#1a1613" stroke="#c9a227" stroke-width="2"/>`,
    );
    parts.push(
      `<text x="${node.x}" y="${node.y - 4}" fill="#e8ddc4" font-size="13" font-family="sans-serif" text-anchor="middle" font-weight="bold">${escape(node.name)}</text>`,
    );
    parts.push(
      `<text x="${node.x}" y="${node.y + 14}" fill="#8a7d6d" font-size="10" font-family="sans-serif" text-anchor="middle">${escape(node.className)}</text>`,
    );
  }

  // Легенда
  const legendX = 30;
  const legendY = height - 140;
  parts.push(
    `<text x="${legendX}" y="${legendY - 8}" fill="#e8ddc4" font-size="12" font-family="sans-serif" font-weight="bold">Связи</text>`,
  );
  let li = 0;
  for (const [type, label] of Object.entries(LABELS)) {
    parts.push(
      `<line x1="${legendX}" y1="${legendY + li * 18 + 6}" x2="${legendX + 24}" y2="${legendY + li * 18 + 6}" stroke="${COLORS[type]}" stroke-width="2"/>`,
    );
    parts.push(
      `<text x="${legendX + 32}" y="${legendY + li * 18 + 10}" fill="#e8ddc4" font-size="11" font-family="sans-serif">${escape(label)}</text>`,
    );
    li++;
  }

  // Футер
  parts.push(
    `<text x="${width - 30}" y="${height - 20}" fill="#8a7d6d" font-size="11" font-family="sans-serif" text-anchor="end">PartyForge · ${escape(campaign.share_code)}</text>`,
  );

  parts.push(`</svg>`);
  return parts.join("");
}