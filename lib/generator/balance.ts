import type {
  Character,
  GeneratorData,
  GeneratorInput,
  Rng,
} from "@/types/generator";
import { generateCharacter } from "./character";

export function generateBalancedParty(
  input: GeneratorInput,
  data: GeneratorData,
  rng: Rng,
): Character[] {
  const characters: Character[] = [];
  const existingIds = new Set<string>();
  const existingNames = new Set<string>();

  for (let i = 0; i < input.party_size; i++) {
    const char = generateCharacter(input, data, {
      rng,
      existingIds,
      existingNames,
    });
    characters.push(char);
  }

  return characters;
}