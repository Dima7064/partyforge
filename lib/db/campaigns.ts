import { createServerClient } from "@/lib/supabase/server";
import type {
  Campaign,
  CampaignMember,
  Character,
  CharacterLocation,
  Faction,
  GeneratorInput,
  Hook,
  Invite,
  Location,
  Npc,
  Relationship,
  SavedCampaignData,
  Theme,
} from "@/types/generator";
import { generateShareCode } from "@/lib/campaigns/shareCode";
import { unlockAchievement } from "@/lib/db/achievements";

const MAX_CODE_ATTEMPTS = 5;

export async function saveCampaign(
  input: GeneratorInput,
  campaign: Campaign,
  userId: string,
  title?: string,
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
        user_id: userId,
        title: title || `Кампания ${share_code}`,
        system: input.system,
        level: input.level,
        tone: input.tone,
        theme: input.theme,
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
  if (!inserted) throw new Error("Не удалось создать share_code");

  // 1. Увеличиваем вечную статистику (созданные кампании)
  const { data: stats } = await supabase
    .from("user_stats")
    .select("campaigns_created")
    .eq("user_id", userId)
    .maybeSingle();
  
  if (!stats) {
    await supabase.from("user_stats").insert({ user_id: userId, campaigns_created: 1 });
  } else {
    await supabase.from("user_stats").update({ campaigns_created: stats.campaigns_created + 1 }).eq("user_id", userId);
  }

  // 2. Добавляем мастера в участники
  await supabase.from("campaign_members").insert({
    campaign_id: campaignId,
    user_id: userId,
    role: "master",
  });

  // 3. Сохраняем персонажей
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

  // 4. Сохраняем историю персонажей (для графиков в профиле)
  const historyRows = campaign.characters.map((c) => ({
    user_id: userId,
    class_name: c.class_name,
    race_name: c.race_name,
    role: c.role,
  }));
  await supabase.from("user_character_history").insert(historyRows);

  // 5. Сохраняем связи
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

  // 6. Сохраняем локации
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

  if (campaign.character_locations.length > 0) {
    const clRows = campaign.character_locations.map((cl) => ({
      campaign_id: campaignId,
      character_id: charIds[cl.character_index],
      location_id: locIds[cl.location_index],
      connection_type: cl.connection_type,
    }));
    const { error } = await supabase.from("character_locations").insert(clRows);
    if (error) throw error;
  }

  // 7. Сохраняем фракции
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

  // 8. Сохраняем NPC
  if (campaign.npcs.length > 0) {
    const npcRows = campaign.npcs.map((n) => ({
      campaign_id: campaignId,
      name: n.name,
      role: n.role,
      description: n.description,
      location_id: n.location_index !== undefined ? locIds[n.location_index] : null,
      faction_id: n.faction_index !== undefined ? factIds[n.faction_index] : null,
    }));
    const { error } = await supabase.from("npcs").insert(npcRows);
    if (error) throw error;
  }

  // 9. Сохраняем крючки
  if (campaign.hooks.length > 0) {
    const hookRows = campaign.hooks.map((h) => ({
      campaign_id: campaignId,
      title: h.title,
      description: h.description,
      type: h.type,
      character_id: h.character_index !== undefined ? charIds[h.character_index] : null,
    }));
    const { error } = await supabase.from("hooks").insert(hookRows);
    if (error) throw error;
  }

  // 10. Проверяем достижения
  const { count } = await supabase
    .from("campaign_members")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("role", "master");
  if ((count ?? 0) >= 1) await unlockAchievement(userId, "first_campaign");
  if ((count ?? 0) >= 10) await unlockAchievement(userId, "ten_campaigns");
  if (input.theme === "skyrim") await unlockAchievement(userId, "skyrim_master");

  return { share_code, id: campaignId };
}

export async function getCampaignByCode(
  code: string,
  viewerUserId?: string,
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

  const [charsRes, relsRes, locsRes, clRes, factsRes, npcsRes, hooksRes, membersRes] =
    await Promise.all([
      supabase.from("characters").select("*").eq("campaign_id", campaignId).order("created_at"),
      supabase.from("relationships").select("*").eq("campaign_id", campaignId),
      supabase.from("locations").select("*").eq("campaign_id", campaignId).order("created_at"),
      supabase.from("character_locations").select("*").eq("campaign_id", campaignId),
      supabase.from("factions").select("*").eq("campaign_id", campaignId).order("created_at"),
      supabase.from("npcs").select("*").eq("campaign_id", campaignId).order("created_at"),
      supabase.from("hooks").select("*").eq("campaign_id", campaignId).order("created_at"),
      supabase
        .from("campaign_members")
        .select("user_id, role, character_id, profiles(username)")
        .eq("campaign_id", campaignId),
    ]);

  if (charsRes.error) throw charsRes.error;
  if (relsRes.error) throw relsRes.error;
  if (locsRes.error) throw locsRes.error;
  if (clRes.error) throw clRes.error;
  if (factsRes.error) throw factsRes.error;
  if (npcsRes.error) throw npcsRes.error;
  if (hooksRes.error) throw hooksRes.error;
  if (membersRes.error) throw membersRes.error;

  const chars = charsRes.data ?? [];
  const locs = locsRes.data ?? [];
  const facts = factsRes.data ?? [];

  const charIdToIndex = new Map<string, number>();
  chars.forEach((c, i) => charIdToIndex.set(c.id, i));
  const locIdToIndex = new Map<string, number>();
  locs.forEach((l, i) => locIdToIndex.set(l.id, i));
  const factIdToIndex = new Map<string, number>();
  facts.forEach((f, i) => factIdToIndex.set(f.id, i));

  const viewerRole: "master" | "player" | "none" = !viewerUserId
    ? "none"
    : (membersRes.data ?? []).some((m) => m.user_id === viewerUserId && m.role === "master")
    ? "master"
    : (membersRes.data ?? []).some((m) => m.user_id === viewerUserId && m.role === "player")
    ? "player"
    : "none";

  const viewerMember = viewerUserId
    ? (membersRes.data ?? []).find((m) => m.user_id === viewerUserId)
    : undefined;
  const viewerCharacterIndex =
    viewerMember?.character_id ? charIdToIndex.get(viewerMember.character_id) : undefined;

  const characters: Character[] = chars.map((c) => ({
    id: c.id,
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

  const character_locations: CharacterLocation[] = (clRes.data ?? []).map((cl) => ({
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

  const members: CampaignMember[] = (membersRes.data ?? []).map((m) => {
    const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
    return {
      user_id: m.user_id,
      username: p?.username ?? "",
      role: m.role,
      character_id: m.character_id ?? undefined,
      character_index: m.character_id ? charIdToIndex.get(m.character_id) : undefined,
    };
  });

  const filteredCharacters =
    viewerRole === "player" && viewerCharacterIndex !== undefined
      ? characters.map((c, i) =>
          i === viewerCharacterIndex ? c : { ...c, secret_text: "" },
        )
      : characters;

  let invites: Invite[] = [];
  if (viewerRole === "master") {
    const { data: inv } = await supabase
      .from("invites")
      .select("*")
      .eq("campaign_id", campaignId)
      .order("created_at", { ascending: false });
    invites = (inv ?? []) as Invite[];
  }

  const my_notes: Record<string, string> = {};
  if (viewerUserId) {
    const { data: notes } = await supabase
      .from("character_notes")
      .select("character_id, content")
      .eq("user_id", viewerUserId);
    for (const n of notes ?? []) {
      my_notes[n.character_id] = n.content;
    }
  }

  return {
    id: campaignId,
    share_code: campaign.share_code,
    user_id: campaign.user_id,
    theme: (campaign.theme as Theme) ?? "classic",
    status: campaign.status ?? "active",
    input: {
      system: campaign.system,
      level: campaign.level,
      tone: campaign.tone,
      theme: (campaign.theme as Theme) ?? "classic",
      party_size: campaign.party_size,
      world: campaign.world,
      constraints: campaign.constraints ?? {},
      duration: campaign.duration,
    },
    characters: filteredCharacters,
    relationships,
    locations,
    character_locations,
    factions,
    npcs,
    situation: campaign.situation ?? "",
    hooks,
    members,
    viewer_role: viewerRole,
    viewer_character_index: viewerCharacterIndex,
    invites,
    my_notes,
  };
}

export async function deleteCampaignByCode(
  code: string,
  userId: string,
): Promise<boolean> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("campaigns")
    .select("id, user_id")
    .eq("share_code", code)
    .maybeSingle();
  if (!data) return false;
  if (data.user_id !== userId) throw new Error("Нет доступа");
  const { error } = await supabase.from("campaigns").delete().eq("id", data.id);
  if (error) throw error;
  return true;
}

export async function updateCampaignSettings(
  code: string,
  userId: string,
  updates: { title?: string; status?: "draft" | "active" | "finished" },
): Promise<void> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("campaigns")
    .select("id, user_id")
    .eq("share_code", code)
    .maybeSingle();
  if (!data) throw new Error("Кампания не найдена");
  if (data.user_id !== userId) throw new Error("Нет доступа");
  const { error } = await supabase
    .from("campaigns")
    .update(updates)
    .eq("id", data.id);
  if (error) throw error;
}

export async function joinCampaign(
  code: string,
  userId: string,
  characterIndex: number,
): Promise<{ ok: true }> {
  const supabase = createServerClient();

  const inviteCheck = await findInviteByCode(code);

  let campaignShareCode = code;
  let role: "master" | "player" = "player";
  let invite: Invite | null = null;

  if (inviteCheck) {
    const { data: c } = await supabase
      .from("campaigns")
      .select("share_code")
      .eq("id", inviteCheck.campaign_id)
      .maybeSingle();
    if (!c) throw new Error("Кампания не найдена");
    campaignShareCode = c.share_code;
    role = inviteCheck.invite.role;
    invite = inviteCheck.invite;

    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      throw new Error("Приглашение истекло");
    }
    if (invite.max_uses !== null && invite.uses_count >= invite.max_uses) {
      throw new Error("Лимит приглашений исчерпан");
    }
  }

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id")
    .eq("share_code", campaignShareCode)
    .maybeSingle();
  if (!campaign) throw new Error("Кампания не найдена");

  const { data: existing } = await supabase
    .from("campaign_members")
    .select("id")
    .eq("campaign_id", campaign.id)
    .eq("user_id", userId)
    .maybeSingle();
  if (existing) throw new Error("Уже участник");

  let characterId: string | null = null;
  let characterInfo: { class_name: string; race_name: string; role: string } | null = null;

  if (role === "player") {
    const { data: chars } = await supabase
      .from("characters")
      .select("id, class_name, race_name, role")
      .eq("campaign_id", campaign.id)
      .order("created_at");
    if (!chars || characterIndex < 0 || characterIndex >= chars.length) {
      throw new Error("Неверный персонаж");
    }
    characterId = chars[characterIndex].id;
    characterInfo = chars[characterIndex];
  }

  const { error } = await supabase.from("campaign_members").insert({
    campaign_id: campaign.id,
    user_id: userId,
    role,
    character_id: characterId,
  });
  if (error) throw error;

  if (invite) {
    await supabase
      .from("invites")
      .update({ uses_count: invite.uses_count + 1 })
      .eq("id", invite.id);
  }

  // ВЕЧНАЯ СТАТИСТИКА (присоединился)
  const { data: stats } = await supabase
    .from("user_stats")
    .select("campaigns_joined")
    .eq("user_id", userId)
    .maybeSingle();
  
  if (!stats) {
    await supabase.from("user_stats").insert({ user_id: userId, campaigns_joined: 1 });
  } else {
    await supabase.from("user_stats").update({ campaigns_joined: stats.campaigns_joined + 1 }).eq("user_id", userId);
  }

  if (characterInfo) {
    await supabase.from("user_character_history").insert({
      user_id: userId,
      class_name: characterInfo.class_name,
      race_name: characterInfo.race_name,
      role: characterInfo.role,
    });
  }

  const { count } = await supabase
    .from("campaign_members")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("role", "player");
  if ((count ?? 0) >= 1) await unlockAchievement(userId, "first_join");
  if ((count ?? 0) >= 5) await unlockAchievement(userId, "five_joins");

  return { ok: true };
}

export async function updateCharacter(
  characterId: string,
  userId: string,
  updates: {
    name?: string;
    class_name?: string;
    race_name?: string;
    background_name?: string;
    abilities?: Record<string, number>;
    personality?: {
      values?: string[];
      fears?: string[];
      habits?: string[];
      motivation?: string;
    };
    backstory?: string;
  },
): Promise<void> {
  const supabase = createServerClient();

  const { data: char } = await supabase
    .from("characters")
    .select("id, campaign_id")
    .eq("id", characterId)
    .maybeSingle();
  if (!char) throw new Error("Персонаж не найден");

  const { data: member } = await supabase
    .from("campaign_members")
    .select("role, character_id")
    .eq("campaign_id", char.campaign_id)
    .eq("user_id", userId)
    .maybeSingle();

  const isMaster = member?.role === "master";
  const isOwner = member?.character_id === characterId;
  if (!isMaster && !isOwner) throw new Error("Нет доступа");

  if (updates.class_name) {
    const { data: cls } = await supabase
      .from("classes")
      .select("id")
      .eq("name", updates.class_name)
      .maybeSingle();
    if (!cls) throw new Error("Такого класса нет");
  }
  if (updates.race_name) {
    const { data: race } = await supabase
      .from("races")
      .select("id")
      .eq("name", updates.race_name)
      .maybeSingle();
    if (!race) throw new Error("Такой расы нет");
  }
  if (updates.background_name) {
    const { data: bg } = await supabase
      .from("backgrounds")
      .select("id")
      .eq("name", updates.background_name)
      .maybeSingle();
    if (!bg) throw new Error("Такой предыстории нет");
  }

  const patch: Record<string, unknown> = {};
  if (updates.name !== undefined) patch.name = updates.name;
  if (updates.class_name !== undefined) patch.class_name = updates.class_name;
  if (updates.race_name !== undefined) patch.race_name = updates.race_name;
  if (updates.background_name !== undefined) patch.background_name = updates.background_name;
  if (updates.abilities !== undefined) patch.abilities = updates.abilities;
  if (updates.personality !== undefined) patch.personality = updates.personality;
  if (updates.backstory !== undefined) patch.backstory = updates.backstory;

  if (Object.keys(patch).length === 0) return;

  const { error } = await supabase
    .from("characters")
    .update(patch)
    .eq("id", characterId);
  if (error) throw error;

  await unlockAchievement(userId, "character_editor");
}

export async function updateRelationshipType(
  relationshipId: string,
  userId: string,
  newType: string,
): Promise<void> {
  const supabase = createServerClient();

  const { data: rel } = await supabase
    .from("relationships")
    .select("id, campaign_id")
    .eq("id", relationshipId)
    .maybeSingle();
  if (!rel) throw new Error("Связь не найдена");

  const { data: member } = await supabase
    .from("campaign_members")
    .select("role")
    .eq("campaign_id", rel.campaign_id)
    .eq("user_id", userId)
    .maybeSingle();
  if (member?.role !== "master") throw new Error("Только мастер может менять связи");

  const { error } = await supabase
    .from("relationships")
    .update({ type: newType })
    .eq("id", relationshipId);
  if (error) throw error;
}

export async function createInvite(
  campaignCode: string,
  userId: string,
  options: { role: "player" | "master"; expiresInHours?: number; maxUses?: number },
): Promise<Invite> {
  const supabase = createServerClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, user_id")
    .eq("share_code", campaignCode)
    .maybeSingle();
  if (!campaign) throw new Error("Кампания не найдена");
  if (campaign.user_id !== userId) throw new Error("Только мастер может приглашать");

  const code = generateShareCode();
  const expires_at = options.expiresInHours
    ? new Date(Date.now() + options.expiresInHours * 3600 * 1000).toISOString()
    : null;

  const { data, error } = await supabase
    .from("invites")
    .insert({
      campaign_id: campaign.id,
      code,
      role: options.role,
      created_by: userId,
      expires_at,
      max_uses: options.maxUses ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function getInvites(
  campaignCode: string,
  userId: string,
): Promise<Invite[]> {
  const supabase = createServerClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, user_id")
    .eq("share_code", campaignCode)
    .maybeSingle();
  if (!campaign) throw new Error("Кампания не найдена");
  if (campaign.user_id !== userId) throw new Error("Только мастер видит приглашения");

  const { data } = await supabase
    .from("invites")
    .select("*")
    .eq("campaign_id", campaign.id)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function deleteInvite(
  inviteId: string,
  userId: string,
): Promise<void> {
  const supabase = createServerClient();

  const { data: inv } = await supabase
    .from("invites")
    .select("id, created_by")
    .eq("id", inviteId)
    .maybeSingle();
  if (!inv) throw new Error("Приглашение не найдено");
  if (inv.created_by !== userId) throw new Error("Нет доступа");

  const { error } = await supabase.from("invites").delete().eq("id", inviteId);
  if (error) throw error;
}

export async function findInviteByCode(
  code: string,
): Promise<{ invite: Invite; campaign_id: string } | null> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("invites")
    .select("*")
    .eq("code", code)
    .maybeSingle();
  if (!data) return null;
  return { invite: data, campaign_id: data.campaign_id };
}

export async function getNote(
  characterId: string,
  userId: string,
): Promise<string> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("character_notes")
    .select("content")
    .eq("character_id", characterId)
    .eq("user_id", userId)
    .maybeSingle();
  return data?.content ?? "";
}

export async function saveNote(
  characterId: string,
  userId: string,
  content: string,
): Promise<void> {
  const supabase = createServerClient();
  const { error } = await supabase.from("character_notes").upsert(
    {
      character_id: characterId,
      user_id: userId,
      content,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,character_id" },
  );
  if (error) throw error;
}

export async function leaveCampaign(
  campaignCode: string,
  userId: string,
): Promise<void> {
  const supabase = createServerClient();
  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, user_id")
    .eq("share_code", campaignCode)
    .maybeSingle();
  if (!campaign) throw new Error("Кампания не найдена");

  const { data: member } = await supabase
    .from("campaign_members")
    .select("role")
    .eq("campaign_id", campaign.id)
    .eq("user_id", userId)
    .maybeSingle();

  if (!member) throw new Error("Ты не участник этой кампании");
  if (member.role === "master") {
    throw new Error("Мастер не может просто покинуть кампанию. Ты можешь её удалить.");
  }

  const { error } = await supabase
    .from("campaign_members")
    .delete()
    .eq("campaign_id", campaign.id)
    .eq("user_id", userId)
    .eq("role", "player");

  if (error) throw error;
  // Статистика в user_stats и user_character_history НЕ удаляется.
}