export const IMAGE_DIMENSIONS = {
  portrait: { width: 768, height: 1152, aspect: "2:3" },
  npc: { width: 512, height: 512, aspect: "1:1" },
  location: { width: 1280, height: 720, aspect: "16:9" },
  // A4 landscape: 842×595 pt → 1754×1240 px (150 DPI)
  map: { width: 1754, height: 1240, aspect: "A4 landscape" },
  // A4 portrait: 595×842 pt → 1240×1754 px (150 DPI)
  terrain: { width: 1240, height: 1754, aspect: "A4 portrait" },
} as const;

export type ImageKind = keyof typeof IMAGE_DIMENSIONS;

export function getDimension(kind: ImageKind) {
  return IMAGE_DIMENSIONS[kind];
}

export function getDimsFromType(type: string): { width: number; height: number } {
  if (type === "portrait" || type === "character") {
    return { width: IMAGE_DIMENSIONS.portrait.width, height: IMAGE_DIMENSIONS.portrait.height };
  }
  if (type === "npc") {
    return { width: IMAGE_DIMENSIONS.npc.width, height: IMAGE_DIMENSIONS.npc.height };
  }
  if (type === "location") {
    return { width: IMAGE_DIMENSIONS.location.width, height: IMAGE_DIMENSIONS.location.height };
  }
  if (type === "map") {
    return { width: IMAGE_DIMENSIONS.map.width, height: IMAGE_DIMENSIONS.map.height };
  }
  if (type === "terrain") {
    return { width: IMAGE_DIMENSIONS.terrain.width, height: IMAGE_DIMENSIONS.terrain.height };
  }
  return { width: 512, height: 512 };
}