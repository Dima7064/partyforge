import type { Campaign, GeneratorInput } from "@/types/generator";
import { generateBalancedParty } from "./balance";
import { generateRelationships } from "./relationships";
import { generateWorld } from "./world";
import { generateHooks } from "./hooks";

export function generateCampaign(input: GeneratorInput): Campaign {
  // 1. Сгенерировать сбалансированную партию
  const characters = generateBalancedParty(input);

  // 2. Связи между персонажами
  const relationships = generateRelationships(characters);

  // 3. Мир: локации, фракции, NPC, ситуация
  const world = generateWorld(input, characters);

  // 4. Промежуточная кампания без крючков
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

  // 5. Крючки
  const hooks = generateHooks(partial);

  return { ...partial, hooks };
}