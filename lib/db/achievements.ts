import { createServerClient } from "@/lib/supabase/server";

export async function unlockAchievement(
  userId: string,
  code: string,
): Promise<void> {
  const supabase = createServerClient();
  const { data: ach } = await supabase
    .from("achievements")
    .select("id")
    .eq("code", code)
    .maybeSingle();
  if (!ach) return;
  await supabase
    .from("user_achievements")
    .upsert(
      { user_id: userId, achievement_id: ach.id },
      { onConflict: "user_id,achievement_id" },
    );
}

export async function checkAchievements(userId: string): Promise<void> {
  const supabase = createServerClient();
  
  // first_note
  const { count: notesCount } = await supabase.from("character_notes").select("*", { count: "exact", head: true }).eq("user_id", userId);
  if (notesCount && notesCount >= 1) await unlockAchievement(userId, "first_note");

  // Играл за персонажей
  const { data: memberships } = await supabase.from("campaign_members").select("character_id").eq("user_id", userId).not("character_id", "is", null);
  const charIds = (memberships ?? []).map(m => m.character_id).filter(Boolean) as string[];
  
  if (charIds.length > 0) {
    const { data: chars } = await supabase.from("characters").select("race_name, role").in("id", charIds);
    if (chars) {
      const uniqueRaces = new Set(chars.map(c => c.race_name).filter(Boolean));
      const uniqueRoles = new Set(chars.map(c => c.role).filter(Boolean));
      if (uniqueRaces.size >= 5) await unlockAchievement(userId, "five_races");
      if (uniqueRoles.size >= 6) await unlockAchievement(userId, "all_roles");
      if (chars.length >= 10) await unlockAchievement(userId, "ten_characters");
    }
  }
}