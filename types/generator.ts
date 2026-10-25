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

export type Theme = "classic" | "skyrim";

export type CharacterRole =
  | "tank"
  | "healer"
  | "dps"
  | "face"
  | "control"
  | "support";

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
  system: string;
  level: number;
  tone: Tone;
  theme: Theme;
  party_size: number;
  world: string;
  constraints: Constraints;
  duration: "one_shot" | "mini_campaign" | "long_campaign";
}

// ============================================
// Характеристики
// ============================================

export type Ability = "str" | "dex" | "con" | "int" | "wis" | "cha";
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
  image_url?: string | null;
  image_width?: number;
  image_height?: number;
}

// ============================================
// Связи
// ============================================

export interface Relationship {
  source_character_index: number;
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
  image_url?: string | null;
  image_width?: number;
  image_height?: number;
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
  image_url?: string | null;
  image_width?: number;
  image_height?: number;
}

// ============================================
// Крючки
// ============================================

export interface Hook {
  id?: string;
  title: string;
  description: string;
  type: HookType;
  character_index?: number;
  template_id?: string;
  metadata?: Record<string, string>;
}

// ============================================
// Кампания
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
// Каталог
// ============================================

export interface ClassRow {
  id: string;
  name: string;
  name_ru: string;
  role: CharacterRole;
  ability_priorities: Ability[];
  tone_tags: string[];
  theme: string[];
  description: string;
}

export interface RaceRow {
  id: string;
  name: string;
  name_ru: string;
  tone_tags: string[];
  theme: string[];
  description: string;
}

export interface BackgroundRow {
  id: string;
  name: string;
  name_ru: string;
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
// Сохранённая кампания
// ============================================

export interface CampaignMember {
  user_id: string;
  username: string;
  role: "master" | "player";
  character_index?: number;
  character_id?: string;
}

export interface SavedCampaignData {
  id: string;
  share_code: string;
  user_id: string | null;
  theme: Theme;
  status: "draft" | "active" | "finished";
  input: GeneratorInput;
  characters: Character[];
  relationships: Relationship[];
  locations: Location[];
  character_locations: CharacterLocation[];
  factions: Faction[];
  npcs: Npc[];
  situation: string;
  hooks: Hook[];
  members: CampaignMember[];
  viewer_role: "master" | "player" | "none";
  viewer_character_index?: number;
  invites?: Invite[];
  my_notes?: Record<string, string>;
  map_image_url?: string | null;
  terrain_image_url?: string | null;
  terrain_image_id?: string | null;
  npc_ids?: string[];
  location_ids?: string[];
  faction_ids?: string[];
}

// ============================================
// Профиль и достижения
// ============================================

export interface Profile {
  id: string;
  username: string;
  created_at: string;
  last_login_at: string | null;
}

export interface UserAchievement {
  code: string;
  name_ru: string;
  description_ru: string;
  icon: string;
  unlocked_at: string | null; // null = не выполнено
}

export interface ProfileStats {
  campaigns_created: number;
  campaigns_joined: number;
  total_characters: number;
  average_party_size: number;
  favorite_class: string | null;
  favorite_class_ru: string | null;
  favorite_race: string | null;
  favorite_race_ru: string | null;
  favorite_role: string | null;
  favorite_role_ru: string | null;
  class_distribution: { name: string; count: number }[];
  race_distribution: { name: string; count: number }[];
  campaigns_by_month: { month: string; count: number }[];
  theme_distribution: { name: string; count: number }[];
  relationship_distribution: { name: string; count: number }[];
  achievements_total: number;
  achievements_unlocked: number;
}

// ============================================
// Приглашения и заметки
// ============================================

export interface Invite {
  id: string;
  campaign_id: string;
  code: string;
  role: "player" | "master";
  created_by: string;
  created_at: string;
  expires_at: string | null;
  max_uses: number | null;
  uses_count: number;
}

export interface CharacterNote {
  character_id: string;
  content: string;
  updated_at: string;
}

// ============================================
// Изображения (шаги 50–55)
// ============================================

export type ImageKind = "portrait" | "npc" | "location" | "map" | "terrain";

export interface PoolImage {
  id: string;
  url: string;
  type: string;
  race_name: string | null;
  location_type: string | null;
  theme: string;
  width: number;
  height: number;
}

export interface ResolvedImage {
  url: string | null;
  width: number;
  height: number;
}