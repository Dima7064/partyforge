import type { Campaign, GeneratorData, GeneratorInput, Rng } from "@/types/generator";
import { generateBalancedParty } from "./balance";
import { generateRelationships } from "./relationships";
import { generateWorld } from "./world";
import { generateHooks } from "./hooks";
import { mulberry32, seedFromString } from "./random";

export function generateCampaign(
  input: GeneratorInput,
  data: GeneratorData,
  seed?: number | string,
): Campaign {
  const numericSeed =
    typeof seed === "string"
      ? seedFromString(seed)
      : seed ?? Math.floor(Math.random() * 2 ** 32);
  const rng = mulberry32(numericSeed);

  const characters = generateBalancedParty(input, data, rng);
  const relationships = generateRelationships(characters);
  const world = generateWorld(input, characters);
  const partial: Omit<Campaign, "hooks"> = {
    input,
    characters,
    relationships,
    locations: world.locations,
    character_locations: world.character_locations,
    factions: world.factions,
    npcs: world.npcs,
    situation: world.situation,
  };
  const hooks = generateHooks(partial);

  return { ...partial, hooks };
}