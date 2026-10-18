import { createServerClient } from "@/lib/supabase/server";
import type {
  Campaign,
  Character,
  CharacterLocation,
  Faction,
  GeneratorInput,
  Hook,
  Location,
  Npc,
  Relationship,
  SavedCampaignData,
} from "@/types/generator";
import { generateShareCode } from "@/lib/campaigns/shareCode";

const MAX_CODE_ATTEMPTS = 5;

export async function saveCampaign(
  input: GeneratorInput,
  campaign: Campaign,
): Promise<{ share_code: string; id: string }> {
  const supabase = createServerClient();

  let share_code = "";
  let campaignId = "";
  let inserted = false;

  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
    share_code = generateShareCode();

    const { data, error } = await supabase
      .from("campaigns")
      .insert({
        share_code,
        user_id: null,
        title: `Кампания ${share_code}`,
        system: input.system,
        level: input.level,
        tone: input.tone,
        party_size: input.party_size,
        world: input.world,
        constraints: input.constraints,
        duration: input.duration,
        situation: campaign.situation,
      })
      .select("id, share_code")
      .single();

    if (error) {
      if (error.code === "23505") continue;
      throw error;
    }
    campaignId = data.id;
    inserted = true;
    break;
  }

  if (!inserted) {
    throw new Error("Не удалось создать share_code — попробуй ещё раз");
  }

  // characters
  const characterRows = campaign.characters.map((c) => ({
    campaign_id: campaignId,
    name: c.name,
    class_name: c.class_name,
    race_name: c.race_name,
    background_name: c.background_name,
    level: c.level,
    role: c.role,
    abilities: c.abilities,
    personality: c.personality,
    backstory: c.backstory,
    secret_text: c.secret_text,
  }));

  const { data: insertedChars, error: charsErr } = await supabase
    .from("characters")
    .insert(characterRows)
    .select("id");

  if (charsErr) throw charsErr;
  const charIds = (insertedChars ?? []).map((r) => r.id);

  // relationships
  if (campaign.relationships.length > 0) {
    const relRows = campaign.relationships.map((r) => ({
      campaign_id: campaignId,
      source_character_id: charIds[r.source_character_index],
      target_character_id: charIds[r.target_character_index],
      type: r.type,
      description: r.description,
    }));
    const { error } = await supabase.from("relationships").insert(relRows);
    if (error) throw error;
  }

  // locations
  const locationRows = campaign.locations.map((l) => ({
    campaign_id: campaignId,
    name: l.name,
    type: l.type,
    description: l.description,
  }));
  const { data: insertedLocs, error: locErr } = await supabase
    .from("locations")
    .insert(locationRows)
    .select("id");
  if (locErr) throw locErr;
  const locIds = (insertedLocs ?? []).map((r) => r.id);

  // character_locations
  if (campaign.character_locations.length > 0) {
    const clRows = campaign.character_locations.map((cl) => ({
      character_id: charIds[cl.character_index],
      location_id: locIds[cl.location_index],
      connection_type: cl.connection_type,
    }));
    const { error } = await supabase
      .from("character_locations")
      .insert(clRows);
    if (error) throw error;
  }

  // factions
  const factionRows = campaign.factions.map((f) => ({
    campaign_id: campaignId,
    name: f.name,
    goals: f.goals,
    attitude: f.attitude,
    description: f.description,
  }));
  const { data: insertedFacts, error: factErr } = await supabase
    .from("factions")
    .insert(factionRows)
    .select("id");
  if (factErr) throw factErr;
  const factIds = (insertedFacts ?? []).map((r) => r.id);

  // npcs
  if (campaign.npcs.length > 0) {
    const npcRows = campaign.npcs.map((n) => ({
      campaign_id: campaignId,
      name: n.name,
      role: n.role,
      description: n.description,
      location_id:
        n.location_index !== undefined ? locIds[n.location_index] : null,
      faction_id:
        n.faction_index !== undefined ? factIds[n.faction_index] : null,
    }));
    const { error } = await supabase.from("npcs").insert(npcRows);
    if (error) throw error;
  }

  // hooks
  if (campaign.hooks.length > 0) {
    const hookRows = campaign.hooks.map((h) => ({
      campaign_id: campaignId,
      title: h.title,
      description: h.description,
      type: h.type,
      character_id:
        h.character_index !== undefined
          ? charIds[h.character_index]
          : null,
    }));
    const { error } = await supabase.from("hooks").insert(hookRows);
    if (error) throw error;
  }

  return { share_code, id: campaignId };
}

export async function getCampaignByCode(
  code: string,
): Promise<SavedCampaignData | null> {
  const supabase = createServerClient();

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("share_code", code)
    .maybeSingle();

  if (error) throw error;
  if (!campaign) return null;

  const campaignId = campaign.id;

  const [
    charsRes,
    relsRes,
    locsRes,
    clRes,
    factsRes,
    npcsRes,
    hooksRes,
  ] = await Promise.all([
    supabase
      .from("characters")
      .select("*")
      .eq("campaign_id", campaignId)
      .order("created_at"),
    supabase
      .from("relationships")
      .select("*")
      .eq("campaign_id", campaignId),
    supabase
      .from("locations")
      .select("*")
      .eq("campaign_id", campaignId)
      .order("created_at"),
    supabase.from("character_locations").select("*"),
    supabase
      .from("factions")
      .select("*")
      .eq("campaign_id", campaignId)
      .order("created_at"),
    supabase
      .from("npcs")
      .select("*")
      .eq("campaign_id", campaignId)
      .order("created_at"),
    supabase
      .from("hooks")
      .select("*")
      .eq("campaign_id", campaignId)
      .order("created_at"),
  ]);

  if (charsRes.error) throw charsRes.error;
  if (relsRes.error) throw relsRes.error;
  if (locsRes.error) throw locsRes.error;
  if (clRes.error) throw clRes.error;
  if (factsRes.error) throw factsRes.error;
  if (npcsRes.error) throw npcsRes.error;
  if (hooksRes.error) throw hooksRes.error;

  const chars = charsRes.data ?? [];
  const locs = locsRes.data ?? [];
  const facts = factsRes.data ?? [];

  const charIdToIndex = new Map<string, number>();
  chars.forEach((c, i) => charIdToIndex.set(c.id, i));

  const locIdToIndex = new Map<string, number>();
  locs.forEach((l, i) => locIdToIndex.set(l.id, i));

  const factIdToIndex = new Map<string, number>();
  facts.forEach((f, i) => factIdToIndex.set(f.id, i));

  const characters: Character[] = chars.map((c) => ({
    id: c.id,
    name: c.name,
    class_name: c.class_name ?? "",
    race_name: c.race_name ?? "",
    background_name: c.background_name ?? "",
    level: c.level,
    role: c.role,
    abilities: c.abilities,
    personality: c.personality,
    backstory: c.backstory,
    secret_text: c.secret_text ?? "",
  }));

  const relationships: Relationship[] = (relsRes.data ?? []).map((r) => ({
    source_character_index: charIdToIndex.get(r.source_character_id) ?? 0,
    target_character_index: charIdToIndex.get(r.target_character_id) ?? 0,
    type: r.type,
    description: r.description,
  }));

  const locations: Location[] = locs.map((l) => ({
    name: l.name,
    type: l.type,
    description: l.description,
  }));

  const relevantCharIds = new Set(chars.map((c) => c.id));
  const relevantLocIds = new Set(locs.map((l) => l.id));

  const character_locations: CharacterLocation[] = (clRes.data ?? [])
    .filter((cl) => relevantCharIds.has(cl.character_id) && relevantLocIds.has(cl.location_id))
    .map((cl) => ({
      character_index: charIdToIndex.get(cl.character_id) ?? 0,
      location_index: locIdToIndex.get(cl.location_id) ?? 0,
      connection_type: cl.connection_type,
    }));

  const factions: Faction[] = facts.map((f) => ({
    name: f.name,
    goals: f.goals,
    attitude: f.attitude,
    description: f.description,
  }));

  const npcs: Npc[] = (npcsRes.data ?? []).map((n) => ({
    name: n.name,
    role: n.role,
    description: n.description,
    location_index:
      n.location_id && locIdToIndex.has(n.location_id)
        ? locIdToIndex.get(n.location_id)
        : undefined,
    faction_index:
      n.faction_id && factIdToIndex.has(n.faction_id)
        ? factIdToIndex.get(n.faction_id)
        : undefined,
  }));

  const hooks: Hook[] = (hooksRes.data ?? []).map((h) => ({
    title: h.title,
    description: h.description,
    type: h.type,
    character_index:
      h.character_id && charIdToIndex.has(h.character_id)
        ? charIdToIndex.get(h.character_id)
        : undefined,
  }));

  return {
    id: campaignId,
    share_code: campaign.share_code,
    input: {
      system: campaign.system,
      level: campaign.level,
      tone: campaign.tone,
      party_size: campaign.party_size,
      world: campaign.world,
      constraints: campaign.constraints ?? {},
      duration: campaign.duration,
    },
    characters,
    relationships,
    locations,
    character_locations,
    factions,
    npcs,
    situation: campaign.situation ?? "",
    hooks,
  };
}

export async function deleteCampaignByCode(code: string): Promise<boolean> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select("id")
    .eq("share_code", code)
    .maybeSingle();
  if (error) throw error;
  if (!data) return false;

  const { error: delErr } = await supabase
    .from("campaigns")
    .delete()
    .eq("id", data.id);
  if (delErr) throw delErr;
  return true;
}

export async function regenerateCharacter(
  code: string,
  characterIndex: number,
  data: import("@/types/generator").GeneratorData,
  input: import("@/types/generator").GeneratorInput,
): Promise<import("@/types/generator").Character> {
  const { generateCharacter } = await import("@/lib/generator/character");
  const { mulberry32 } = await import("@/lib/generator/random");

  const current = await getCampaignByCode(code);
  if (!current) throw new Error("Кампания не найдена");
  if (characterIndex < 0 || characterIndex >= current.characters.length) {
    throw new Error("Неверный индекс персонажа");
  }

  const rng = mulberry32(Math.floor(Math.random() * 2 ** 32));
  const existingClassIds = new Set<string>();
  const existingNames = new Set<string>(
    current.characters
      .filter((_, i) => i !== characterIndex)
      .map((c) => c.name),
  );

  const newChar = generateCharacter(input, data, {
    rng,
    existingClassIds,
    existingNames,
  });

  const supabase = createServerClient();

  const { data: existing } = await supabase
    .from("characters")
    .select("id")
    .eq("campaign_id", current.id)
    .order("created_at")
    .range(characterIndex, characterIndex)
    .single();

  if (!existing) throw new Error("Персонаж не найден в БД");

  const { error: updErr } = await supabase
    .from("characters")
    .update({
      name: newChar.name,
      class_name: newChar.class_name,
      race_name: newChar.race_name,
      background_name: newChar.background_name,
      role: newChar.role,
      abilities: newChar.abilities,
      personality: newChar.personality,
      backstory: newChar.backstory,
      secret_text: newChar.secret_text,
    })
    .eq("id", existing.id);

  if (updErr) throw updErr;

  return { ...newChar, id: existing.id };
}