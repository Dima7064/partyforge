import { createServerClient } from "@/lib/supabase/server";
import type {
  Profile,
  ProfileStats,
  UserAchievement,
  Character,
} from "@/types/generator";
import { classNameRu, raceNameRu } from "@/data/localization";

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  return data ?? null;
}

export async function getProfileStats(userId: string): Promise<ProfileStats> {
  const supabase = createServerClient();

  const { data: memberships } = await supabase
    .from("campaign_members")
    .select("campaign_id, role, joined_at")
    .eq("user_id", userId);

  const created = (memberships ?? []).filter((m) => m.role === "master").length;
  const joined = (memberships ?? []).filter((m) => m.role === "player").length;

  const campaignIds = (memberships ?? []).map((m) => m.campaign_id);
  const { data: characters } =
    campaignIds.length > 0
      ? await supabase
          .from("characters")
          .select("class_name, race_name")
          .in("campaign_id", campaignIds)
      : { data: [] as Pick<Character, "class_name" | "race_name">[] };

  const chars = characters ?? [];

  const classCounts = new Map<string, number>();
  const raceCounts = new Map<string, number>();
  for (const c of chars) {
    if (c.class_name) classCounts.set(c.class_name, (classCounts.get(c.class_name) ?? 0) + 1);
    if (c.race_name) raceCounts.set(c.race_name, (raceCounts.get(c.race_name) ?? 0) + 1);
  }

  const class_distribution = [...classCounts.entries()]
    .map(([name, count]) => ({ name: classNameRu(name), count }))
    .sort((a, b) => b.count - a.count);

  const race_distribution = [...raceCounts.entries()]
    .map(([name, count]) => ({ name: raceNameRu(name), count }))
    .sort((a, b) => b.count - a.count);

  const monthCounts = new Map<string, number>();
  for (const m of memberships ?? []) {
    if (!m.joined_at) continue;
    const d = new Date(m.joined_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1);
  }
  const campaigns_by_month = [...monthCounts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, count]) => ({ month, count }));

  return {
    campaigns_created: created,
    campaigns_joined: joined,
    total_characters: chars.length,
    favorite_class: class_distribution[0]?.name ?? null,
    favorite_class_ru: class_distribution[0]?.name ?? null,
    favorite_race: race_distribution[0]?.name ?? null,
    favorite_race_ru: race_distribution[0]?.name ?? null,
    class_distribution,
    race_distribution,
    campaigns_by_month,
  };
}

export async function getProfileAchievements(
  userId: string,
): Promise<UserAchievement[]> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("user_achievements")
    .select("unlocked_at, achievements(code, name_ru, description_ru, icon)")
    .eq("user_id", userId)
    .order("unlocked_at", { ascending: false });

  return (data ?? []).map((row) => {
    const a = Array.isArray(row.achievements) ? row.achievements[0] : row.achievements;
    return {
      code: a?.code ?? "",
      name_ru: a?.name_ru ?? "",
      description_ru: a?.description_ru ?? "",
      icon: a?.icon ?? "🏆",
      unlocked_at: row.unlocked_at,
    };
  });
}