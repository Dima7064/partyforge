import type {
  Campaign,
  Character,
  CharacterLocation,
  Faction,
  GeneratorInput,
  Location,
  Npc,
} from "@/types/generator";

export interface WorldResult {
  locations: Location[];
  character_locations: CharacterLocation[];
  factions: Faction[];
  npcs: Npc[];
  situation: string;
}

export function generateWorld(
  input: GeneratorInput,
  characters: Character[],
): WorldResult {
  throw new Error("generateWorld: not implemented yet");
}