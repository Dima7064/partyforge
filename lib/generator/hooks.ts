import type { Campaign, Hook } from "@/types/generator";

export function generateHooks(campaign: Omit<Campaign, "hooks">): Hook[] {
  throw new Error("generateHooks: not implemented yet");
}

export function validateHooks(hooks: Hook[], characterCount: number): boolean {
  throw new Error("validateHooks: not implemented yet");
}