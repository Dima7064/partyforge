import type { Character, GeneratorInput } from "@/types/generator";

export interface CharacterContext {
  tone: string;
  level: number;
  existing_characters: Character[];
}

export function generateCharacter(
  input: GeneratorInput,
  context: CharacterContext,
): Character {
  throw new Error("generateCharacter: not implemented yet");
}