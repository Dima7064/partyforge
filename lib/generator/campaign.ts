import type {
  Campaign,
  GeneratorData,
  GeneratorInput,
  Rng,
} from "@/types/generator";
import { generateBalancedParty } from "./balance";
import { generateRelationships } from "./relationships";
import { generateWorld } from "./world";
import { generateHooks } from "./hooks";
import { mulberry32, seedFromString } from "./random";
import { validateCampaign } from "@/lib/validation";

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

  // Кампания на 6 человек = 1 мастер + 5 игроков
  const playerCount = Math.max(1, input.party_size - 1);
  const characters = generateBalancedParty(
    { ...input, party_size: playerCount },
    data,
    rng,
  );

  let relationships = generateRelationships(characters, rng);
  let campaign: Campaign = {
    input,
    characters,
    relationships,
    locations: [],
    character_locations: [],
    factions: [],
    npcs: [],
    situation: "",
    hooks: [],
  };

  const world = generateWorld(input, characters, rng);
  campaign = {
    ...campaign,
    locations: world.locations,
    character_locations: world.character_locations,
    factions: world.factions,
    npcs: world.npcs,
    situation: world.situation,
  };

  campaign = {
    ...campaign,
    hooks: generateHooks(campaign, data.hook_templates, rng),
  };

  let result = validateCampaign(campaign);
  let attempts = 1;
  while (!result.valid && attempts < 3) {
    relationships = generateRelationships(characters, rng);
    campaign = { ...campaign, relationships };
    result = validateCampaign(campaign);
    attempts++;
  }

  return campaign;
}