import type {
  Campaign,
  GeneratorData,
  GeneratorInput,
  Rng,
} from "@/types/generator";
import { generateBalancedParty } from "./balance";
import {
  generateRelationships,
  validateRelationships,
} from "./relationships";
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

  let relationships = generateRelationships(characters, rng);
  let relCheck = validateRelationships(characters, relationships);
  let relAttempts = 1;
  while (!relCheck.valid && relAttempts < 3) {
    relationships = generateRelationships(characters, rng);
    relCheck = validateRelationships(characters, relationships);
    relAttempts++;
  }

  const world = generateWorld(input, characters, rng);

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

  const hooks = generateHooks(partial, data.hook_templates, rng);

  return { ...partial, hooks };
}