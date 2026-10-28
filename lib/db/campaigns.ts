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
} from "@/types/generator";
import { generateShareCode } from "@/lib/campaigns/shareCode";
import { unlockAchievement } from "@/lib/db/achievements";
import { getRandomPoolImage } from "@/lib/db/images";
import { assertCampaignLimit } from "@/lib/db/limits";

const MAX_CODE_ATTEMPTS = 5;

export async function saveCampaign(
  input: GeneratorInput,
  campaign: Campaign,
  userId: string,
  title?: string,
): Promise<{ share_code: string; id: string }> {
  await assertCampaignLimit(userId, "create");

  const supabase = createServerClient();

  const [characterImages, npcImages, locationImages, mapImage, terrainImage] =
    await Promise.all([
      Promise.all(
        campaign.characters.map((c) =>
          getRandomPoolImage({
            type: "portrait",
            race_name: c.race_name,
            theme: "classic",
          }).then((img) => img?.id ?? null),
        ),
      ),
      Promise.all(
        campaign.npcs.map(() =>
          getRandomPoolImage({ type: "npc", theme: "classic" }).then(
            (img) => img?.id ?? null,
          ),
        ),
      ),
      Promise.all(
        campaign.locations.map((l) =>
          getRandomPoolImage({
            type: "location",
            location_type: l.type,
            theme: "classic",
          }).then((img) => img?.id ?? null),
        ),
      ),
      getRandomPoolImage({ type: "map", theme: "classic" }),
      getRandomPoolImage({ type: "terrain", theme: "classic" }),
    ]);

  const imageIdsPayload = {
    character_images: characterImages,
    npc_images: npcImages,
    location_images: locationImages,
    map_image: mapImage?.id ?? null,
    terrain_image: terrainImage?.id ?? null,
  };

  let share_code = "";
  let campaignId = "";
  let inserted = false;

  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
    share_code = generateShareCode();
    const { data, error } = await supabase.rpc("save_campaign_atomic", {
      p_user_id: userId,
      p_share_code: share_code,
      p_title: title || `Кампания ${share_code}`,
      p_input: input,
      p_campaign: campaign,
      p_image_ids: imageIdsPayload,
    });

    if (error) {
      if (error.code === "23505") continue;
      throw error;
    }

    campaignId = data.campaign_id;
    inserted = true;
    break;
  }

  if (!inserted) {
    throw new Error("Не удалось создать share_code");
  }

  const { count } = await supabase
    .from("campaign_members")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("role", "master");

  const achievementChecks: Promise<void>[] = [];
  if ((count ?? 0) >= 1)
    achievementChecks.push(unlockAchievement(userId, "first_campaign"));
  if ((count ?? 0) >= 10)
    achievementChecks.push(unlockAchievement(userId, "ten_campaigns"));
  await Promise.all(achievementChecks);

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

  const [
    charsRes,
    relsRes,
    locsRes,
    clRes,
    factsRes,
    npcsRes,
    hooksRes,
    membersRes,
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
    supabase
      .from("character_locations")
      .select("*")
      .eq("campaign_id", campaignId),
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
  const npcRows = npcsRes.data ?? [];

  const charIdToIndex = new Map<string, number>();
  chars.forEach((c, i) => charIdToIndex.set(c.id, i));

  const locIdToIndex = new Map<string, number>();
  locs.forEach((l, i) => locIdToIndex.set(l.id, i));

  const factIdToIndex = new Map<string, number>();
  facts.forEach((f, i) => factIdToIndex.set(f.id, i));

  const allImageIds = new Set<string>();
  for (const c of chars) if (c.image_id) allImageIds.add(c.image_id);
  for (const l of locs) if (l.image_id) allImageIds.add(l.image_id);
  for (const n of npcRows) if (n.image_id) allImageIds.add(n.image_id);
  if (campaign.map_image_id) allImageIds.add(campaign.map_image_id);
  if (campaign.terrain_image_id) allImageIds.add(campaign.terrain_image_id);

  const imageMap = new Map<string, { url: string; width: number; height: number }>();
  if (allImageIds.size > 0) {
    const { data: imgs } = await supabase
      .from("images")
      .select("id, url, width, height")
      .in("id", Array.from(allImageIds));
    for (const img of imgs ?? []) {
      imageMap.set(img.id, {
        url: img.url,
        width: img.width,
        height: img.height,
      });
    }
  }

  const viewerRole: "master" | "player" | "none" = !viewerUserId
    ? "none"
    : (membersRes.data ?? []).some(
          (m) => m.user_id === viewerUserId && m.role === "master",
        )
      ? "master"
      : (membersRes.data ?? []).some(
            (m) => m.user_id === viewerUserId && m.role === "player",
          )
        ? "player"
        : "none";

  const viewerMember = viewerUserId
    ? (membersRes.data ?? []).find((m) => m.user_id === viewerUserId)
    : undefined;

  const viewerCharacterIndex = viewerMember?.character_id
    ? charIdToIndex.get(viewerMember.character_id)
    : undefined;

  const characters: Character[] = chars.map((c) => {
    const img = c.image_id ? imageMap.get(c.image_id) : undefined;
    return {
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
      backstory_options: c.backstory_options,
      secret_text: c.secret_text,
      image_url: img?.url ?? null,
      image_width: img?.width,
      image_height: img?.height,
    };
  });

  const relationships: Relationship[] = (relsRes.data ?? []).map((r) => ({
    source_character_index: charIdToIndex.get(r.source_character_id) ?? 0,
    target_character_index: charIdToIndex.get(r.target_character_id) ?? 0,
    type: r.type,
    description: r.description,
  }));

  const locations: Location[] = locs.map((l) => {
    const img = l.image_id ? imageMap.get(l.image_id) : undefined;
    return {
      name: l.name,
      type: l.type,
      description: l.description,
      image_url: img?.url ?? null,
      image_width: img?.width,
      image_height: img?.height,
    };
  });

  const character_locations: CharacterLocation[] = (clRes.data ?? []).map(
    (cl) => ({
      character_index: charIdToIndex.get(cl.character_id) ?? 0,
      location_index: locIdToIndex.get(cl.location_id) ?? 0,
      connection_type: cl.connection_type,
    }),
  );

  const factions: Faction[] = facts.map((f) => ({
    name: f.name,
    goals: f.goals,
    attitude: f.attitude,
    description: f.description,
  }));

  const npcs: Npc[] = npcRows.map((n) => {
    const img = n.image_id ? imageMap.get(n.image_id) : undefined;
    return {
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
      image_url: img?.url ?? null,
      image_width: img?.width,
      image_height: img?.height,
    };
  });

  const hooks: Hook[] = (hooksRes.data ?? []).map((h) => ({
    id: h.id,
    title: h.title,
    description: h.description,
    type: h.type,
    character_index:
      h.character_id && charIdToIndex.has(h.character_id)
        ? charIdToIndex.get(h.character_id)
        : undefined,
    template_id: h.template_id ?? undefined,
    metadata: h.metadata ?? {},
  }));

  const members: CampaignMember[] = (membersRes.data ?? []).map((m) => {
    const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
    return {
      user_id: m.user_id,
      username: p?.username ?? "",
      role: m.role,
      character_id: m.character_id ?? undefined,
      character_index: m.character_id
        ? charIdToIndex.get(m.character_id)
        : undefined,
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

  const mapImg = campaign.map_image_id
    ? imageMap.get(campaign.map_image_id)
    : undefined;
  const terrainImg = campaign.terrain_image_id
    ? imageMap.get(campaign.terrain_image_id)
    : undefined;

  return {
    id: campaignId,
    share_code: campaign.share_code,
    user_id: campaign.user_id,
    status: campaign.status ?? "active",
    input: {
      system: campaign.system,
      level: campaign.level,
      tone: campaign.tone,
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
    map_image_url: mapImg?.url ?? null,
    terrain_image_url: terrainImg?.url ?? null,
    terrain_image_id: campaign.terrain_image_id ?? null,
    npc_ids: npcRows.map((n) => n.id),
    location_ids: locs.map((l) => l.id),
    faction_ids: facts.map((f) => f.id),
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
  await assertCampaignLimit(userId, "join");

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
    .select("id, party_size")
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
  let characterInfo: { class_name: string; race_name: string; role: string } | null =
    null;

  if (role === "player") {
    const { count: playerCount } = await supabase
      .from("campaign_members")
      .select("*", { count: "exact", head: true })
      .eq("campaign_id", campaign.id)
      .eq("role", "player");

    if ((playerCount ?? 0) >= campaign.party_size - 1) {
      throw new Error("Кампания заполнена. Все места заняты.");
    }

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

  const { data: stats } = await supabase
    .from("user_stats")
    .select("campaigns_joined")
    .eq("user_id", userId)
    .maybeSingle();

  if (!stats) {
    await supabase
      .from("user_stats")
      .insert({ user_id: userId, campaigns_joined: 1 });
  } else {
    await supabase
      .from("user_stats")
      .update({ campaigns_joined: stats.campaigns_joined + 1 })
      .eq("user_id", userId);
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
  if (updates.background_name !== undefined)
    patch.background_name = updates.background_name;
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

  if (member?.role !== "master")
    throw new Error("Только мастер может менять связи");

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
  if (campaign.user_id !== userId)
    throw new Error("Только мастер может приглашать");

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
  if (campaign.user_id !== userId)
    throw new Error("Только мастер видит приглашения");

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
    throw new Error(
      "Мастер не может просто покинуть кампанию. Ты можешь её удалить.",
    );
  }

  const { error } = await supabase
    .from("campaign_members")
    .delete()
    .eq("campaign_id", campaign.id)
    .eq("user_id", userId)
    .eq("role", "player");

  if (error) throw error;
}

export async function changeCharacterImage(
  characterId: string,
  userId: string,
  imageId: string,
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

  const { data: image } = await supabase
    .from("images")
    .select("id")
    .eq("id", imageId)
    .eq("is_pool", true)
    .maybeSingle();

  if (!image) throw new Error("Изображение не найдено в пуле");

  const { error } = await supabase
    .from("characters")
    .update({ image_id: imageId })
    .eq("id", characterId);

  if (error) throw error;
}

export async function updateLocation(
  id: string,
  userId: string,
  updates: { name?: string; type?: string; description?: string },
) {
  const supabase = createServerClient();

  const { data: loc } = await supabase
    .from("locations")
    .select("id, campaign_id")
    .eq("id", id)
    .single();

  if (!loc) throw new Error("Локация не найдена");

  const { data: member } = await supabase
    .from("campaign_members")
    .select("role")
    .eq("campaign_id", loc.campaign_id)
    .eq("user_id", userId)
    .single();

  if (member?.role !== "master") throw new Error("Только мастер");

  const { error } = await supabase.from("locations").update(updates).eq("id", id);
  if (error) throw error;
}

export async function updateFaction(
  id: string,
  userId: string,
  updates: { name?: string; goals?: string; description?: string },
) {
  const supabase = createServerClient();

  const { data: fact } = await supabase
    .from("factions")
    .select("id, campaign_id")
    .eq("id", id)
    .single();

  if (!fact) throw new Error("Фракция не найдена");

  const { data: member } = await supabase
    .from("campaign_members")
    .select("role")
    .eq("campaign_id", fact.campaign_id)
    .eq("user_id", userId)
    .single();

  if (member?.role !== "master") throw new Error("Только мастер");

  const { error } = await supabase.from("factions").update(updates).eq("id", id);
  if (error) throw error;
}

export async function updateNpc(
  id: string,
  userId: string,
  updates: { name?: string; role?: string; description?: string },
) {
  const supabase = createServerClient();

  const { data: npc } = await supabase
    .from("npcs")
    .select("id, campaign_id")
    .eq("id", id)
    .single();

  if (!npc) throw new Error("NPC не найден");

  const { data: member } = await supabase
    .from("campaign_members")
    .select("role")
    .eq("campaign_id", npc.campaign_id)
    .eq("user_id", userId)
    .single();

  if (member?.role !== "master") throw new Error("Только мастер");

  const { error } = await supabase.from("npcs").update(updates).eq("id", id);
  if (error) throw error;
}

export async function updateSituation(
  code: string,
  userId: string,
  situation: string,
): Promise<void> {
  const supabase = createServerClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, user_id")
    .eq("share_code", code)
    .maybeSingle();

  if (!campaign) throw new Error("Кампания не найдена");
  if (campaign.user_id !== userId) throw new Error("Только мастер");

  const { error } = await supabase
    .from("campaigns")
    .update({ situation })
    .eq("id", campaign.id);

  if (error) throw error;
}

export async function updateHook(
  id: string,
  userId: string,
  updates: {
    type?: string;
    description?: string;
    template_id?: string | null;
    metadata?: Record<string, string>;
  },
): Promise<void> {
  const supabase = createServerClient();

  const { data: hook } = await supabase
    .from("hooks")
    .select("id, campaign_id")
    .eq("id", id)
    .maybeSingle();

  if (!hook) throw new Error("Крючок не найден");

  const { data: member } = await supabase
    .from("campaign_members")
    .select("role")
    .eq("campaign_id", hook.campaign_id)
    .eq("user_id", userId)
    .maybeSingle();

  if (member?.role !== "master") throw new Error("Только мастер");

  const { error } = await supabase.from("hooks").update(updates).eq("id", id);
  if (error) throw error;
}