// ============================================
// Вход генератора
// ============================================

export type Tone =
  | "dark_fantasy"
  | "heroic"
  | "comedic"
  | "political"
  | "wild"
  | "religious";

export type CharacterRole = "tank" | "healer" | "dps" | "face" | "control" | "support";

export type RelationshipType = "trust" | "debt" | "love" | "conflict" | "secret";

export type HookType = "personal" | "social" | "exploration" | "combat";

export type ConnectionType = "born" | "lost" | "served" | "dreams";

export type FactionAttitude = "ally" | "enemy" | "neutral";

export type NpcRole = "ally" | "enemy" | "neutral";

export interface Constraints {
  no_evil?: boolean;
  no_pvp?: boolean;
  banned_races?: string[];
  banned_classes?: string[];
}

export interface GeneratorInput {
  system: string; // "dnd5e"
  level: number;
  tone: Tone;
  party_size: number;
  world: string; // "custom" | название готового мира
  constraints: Constraints;
  duration: "one_shot" | "mini_campaign" | "long_campaign";
}

// ============================================
// Характеристики D&D
// ============================================

export type Ability =
  | "str"
  | "dex"
  | "con"
  | "int"
  | "wis"
  | "cha";

export type Abilities = Record<Ability, number>;

// ============================================
// Персонаж
// ============================================

export interface Personality {
  values: string[];
  fears: string[];
  habits: string[];
  motivation: string;
}

export interface Character {
  id?: string;
  name: string;
  class_name: string;
  race_name: string;
  background_name: string;
  level: number;
  role: CharacterRole;
  abilities: Abilities;
  personality: Personality;
  backstory: string;
  secret_text: string;
  image_url?: string;
}

// ============================================
// Связи между персонажами
// ============================================

export interface Relationship {
  source_character_index: number; // индекс в массиве characters
  target_character_index: number;
  type: RelationshipType;
  description: string;
}

// ============================================
// Мир
// ============================================

export interface Location {
  name: string;
  type: string;
  description: string;
  image_url?: string;
}

export interface CharacterLocation {
  character_index: number;
  location_index: number;
  connection_type: ConnectionType;
}

export interface Faction {
  name: string;
  goals: string;
  attitude: FactionAttitude;
  description: string;
}

export interface Npc {
  name: string;
  role: NpcRole;
  description: string;
  location_index?: number;
  faction_index?: number;
  image_url?: string;
}

// ============================================
// Крючки
// ============================================

export interface Hook {
  title: string;
  description: string;
  type: HookType;
  character_index?: number; // центр крючка
}

// ============================================
// Кампания (результат генерации)
// ============================================

export interface Campaign {
  input: GeneratorInput;
  characters: Character[];
  relationships: Relationship[];
  locations: Location[];
  character_locations: CharacterLocation[];
  factions: Faction[];
  npcs: Npc[];
  situation: string;
  hooks: Hook[];
}

// ============================================
// Результат с share-кодом (после сохранения в БД)
// ============================================

export interface SavedCampaign {
  share_code: string;
  campaign: Campaign;
}

// ============================================
// Каталог (данные из БД для генератора)
// ============================================

export interface ClassRow {
  id: string;
  name: string;
  role: CharacterRole;
  ability_priorities: Ability[];
  tone_tags: string[];
  description: string;
}

export interface RaceRow {
  id: string;
  name: string;
  tone_tags: string[];
  description: string;
}

export interface BackgroundRow {
  id: string;
  name: string;
  tone_tags: string[];
  description: string;
}

export interface TraitRow {
  id: string;
  type: "value" | "fear" | "habit" | "motivation";
  name: string;
  tags: string[];
  description: string | null;
}

export interface SecretRow {
  id: string;
  text: string;
  tags: string[];
}

export interface HookTemplateRow {
  id: string;
  template: string;
  type: HookType;
  tags: string[];
}

export interface ToneWeightRow {
  id: string;
  tone: Tone;
  entity_type: "class" | "race" | "trait";
  entity_id: string;
  weight: number;
}

export interface GeneratorData {
  classes: ClassRow[];
  races: RaceRow[];
  backgrounds: BackgroundRow[];
  traits: TraitRow[];
  secrets: SecretRow[];
  hook_templates: HookTemplateRow[];
  tone_weights: ToneWeightRow[];
}

// ============================================
// RNG
// ============================================

export type Rng = () => number;

// ============================================
// Сохранённая кампания (из БД)
// ============================================

export interface SavedCampaignData {
  id: string;
  share_code: string;
  input: GeneratorInput;
  characters: Character[];
  relationships: Relationship[];
  locations: Location[];
  character_locations: CharacterLocation[];
  factions: Faction[];
  npcs: Npc[];
  situation: string;
  hooks: Hook[];
}