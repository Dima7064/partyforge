import type { Character, Npc, Rng } from "@/types/generator";

const PORTRAIT_BY_CLASS: Record<string, string> = {
  Barbarian: "/images/portraits/barbarian.jpg",
  Bard: "/images/portraits/bard.jpg",
  Cleric: "/images/portraits/cleric.jpg",
  Druid: "/images/portraits/druid.jpg",
  Fighter: "/images/portraits/fighter.jpg",
  Monk: "/images/portraits/monk.jpg",
  Paladin: "/images/portraits/paladin.jpg",
  Ranger: "/images/portraits/ranger.jpg",
  Rogue: "/images/portraits/rogue.jpg",
  Sorcerer: "/images/portraits/sorcerer.jpg",
  Warlock: "/images/portraits/warlock.jpg",
  Wizard: "/images/portraits/wizard.jpg",
};

const NPC_BY_ROLE: Record<string, string> = {
  ally: "/images/portraits/npc-ally.jpg",
  enemy: "/images/portraits/npc-enemy.jpg",
  neutral: "/images/portraits/npc-neutral.jpg",
};

const LOCATION_BY_TYPE: Record<string, string> = {
  city: "/images/locations/city.jpg",
  temple: "/images/locations/temple.jpg",
  forest: "/images/locations/forest.jpg",
  ruins: "/images/locations/ruins.jpg",
  port: "/images/locations/port.jpg",
};

export function portraitForCharacter(character: Character): string | undefined {
  return PORTRAIT_BY_CLASS[character.class_name];
}

export function portraitForNpc(npc: Npc): string | undefined {
  return NPC_BY_ROLE[npc.role];
}

export function imageForLocation(type: string): string | undefined {
  return LOCATION_BY_TYPE[type];
}

export function mapImage(): string {
  return "/images/maps/region.jpg";
}