import { createServerClient } from "@/lib/supabase/server";

export async function getLibraryItems(userId: string, type?: string) {
  const supabase = createServerClient();
  let query = supabase.from("library_items").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  
  if (type && type !== "all") {
    query = query.eq("type", type);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createLibraryItem(userId: string, payload: { type: string; name: string; data: any; tags?: string[] }) {
  const supabase = createServerClient();
  const { data, error } = await supabase.from("library_items").insert({
    user_id: userId,
    type: payload.type,
    name: payload.name,
    data: payload.data,
    tags: payload.tags || [],
  }).select().single();

  if (error) throw error;
  return data;
}

export async function deleteLibraryItem(id: string, userId: string) {
  const supabase = createServerClient();
  const { error } = await supabase.from("library_items").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

export async function useLibraryItemInCampaign(itemId: string, userId: string, campaignId: string) {
  const supabase = createServerClient();
  
  const { data: item, error: itemErr } = await supabase.from("library_items").select("*").eq("id", itemId).eq("user_id", userId).single();
  if (itemErr || !item) throw new Error("Объект не найден");

  const { data: member } = await supabase.from("campaign_members").select("role").eq("campaign_id", campaignId).eq("user_id", userId).single();
  if (member?.role !== "master") throw new Error("Только мастер может добавлять объекты");

  if (item.type === "npc") {
    const npcData = item.data;
    const { error } = await supabase.from("npcs").insert({
      campaign_id: campaignId,
      name: item.name,
      role: npcData.role || "neutral",
      description: npcData.description || item.name,
    });
    if (error) throw error;
  } else if (item.type === "location") {
    const locData = item.data;
    const { error } = await supabase.from("locations").insert({
      campaign_id: campaignId,
      name: item.name,
      type: locData.type || "city",
      description: locData.description || item.name,
    });
    if (error) throw error;
  } else {
    throw new Error("Этот тип пока нельзя добавить в кампанию");
  }
}