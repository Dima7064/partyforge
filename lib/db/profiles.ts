import { createServerClient } from "@/lib/supabase/server";
import type {
  Profile,
  ProfileStats,
  UserAchievement,
} from "@/types/generator";
import { classNameRu, raceNameRu } from "@/data/localization";
import { unlockAchievement, checkAchievements } from "@/lib/db/achievements";

const ROLE_LABEL: Record<string, string> = {
  tank: "Танк",
  healer: "Хилер",
  dps: "DPS",
  face: "Лицо партии",
  control: "Контроль",
  support: "Поддержка",
};

const REL_LABEL: Record<string, string> = {
  trust: "Доверие",
  debt: "Долг",
  love: "Любовь",
  conflict: "Конфликт",
  secret: "Тайна",
};

const THEME_LABEL: Record<string, string> = {
  classic: "Классика D&D",
  skyrim: "Скайрим",
};

export async function getProfile(userId: string): Promise<Profile | null> {
  await checkAchievements(userId);
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

  // 1. Берем вечные счетчики
  const { data: statsRow } = await supabase.from("user_stats").select("*").eq("user_id", userId).maybeSingle();
  const campaigns_created = statsRow?.campaigns_created ?? 0;
  const campaigns_joined = statsRow?.campaigns_joined ?? 0;

  // 2. Берем историю персонажей
  const { data: history } = await supabase.from("user_character_history").select("class_name, race_name, role").eq("user_id", userId);
  const chars = history ?? [];

  // 3. Считаем графики
  const classCounts = new Map<string, number>();
  const raceCounts = new Map<string, number>();
  const roleCounts = new Map<string, number>();

  for (const c of chars) {
    if (c.class_name) classCounts.set(c.class_name, (classCounts.get(c.class_name) ?? 0) + 1);
    if (c.race_name) raceCounts.set(c.race_name, (raceCounts.get(c.race_name) ?? 0) + 1);
    if (c.role) roleCounts.set(c.role, (roleCounts.get(c.role) ?? 0) + 1);
  }

  const class_distribution = [...classCounts.entries()].map(([name, count]) => ({ name: classNameRu(name), count })).sort((a, b) => b.count - a.count);
  const race_distribution = [...raceCounts.entries()].map(([name, count]) => ({ name: raceNameRu(name), count })).sort((a, b) => b.count - a.count);
  
  const sortedRoles = [...roleCounts.entries()].sort((a, b) => b[1] - a[1]);
  const favorite_role = sortedRoles[0]?.[0] ?? null;
  const favorite_role_ru = favorite_role ? ROLE_LABEL[favorite_role] ?? favorite_role : null;

  // Остальные данные (месяцы, темы) оставляем как было, они берутся из активных кампаний
  const { data: memberships } = await supabase.from("campaign_members").select("campaign_id, joined_at").eq("user_id", userId);
  const campaignIds = (memberships ?? []).map((m) => m.campaign_id);

  let campaignsMeta: { theme: string; party_size: number }[] = [];
  if (campaignIds.length > 0) {
    const { data } = await supabase.from("campaigns").select("theme, party_size").in("id", campaignIds);
    campaignsMeta = data ?? [];
  }

  const themeCounts = new Map<string, number>();
  for (const c of campaignsMeta) {
    if (c.theme) themeCounts.set(c.theme, (themeCounts.get(c.theme) ?? 0) + 1);
  }
  const theme_distribution = [...themeCounts.entries()].map(([name, count]) => ({ name: THEME_LABEL[name] ?? name, count }));

  const monthCounts = new Map<string, number>();
  for (const m of memberships ?? []) {
    if (!m.joined_at) continue;
    const d = new Date(m.joined_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1);
  }
  const campaigns_by_month = [...monthCounts.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-6).map(([month, count]) => ({ month, count }));

  const average_party_size = campaignsMeta.length > 0 ? Number((campaignsMeta.reduce((sum, c) => sum + c.party_size, 0) / campaignsMeta.length).toFixed(1)) : 0;

  const { count: achTotal } = await supabase.from("achievements").select("*", { count: "exact", head: true });
  const { count: achUnlocked } = await supabase.from("user_achievements").select("*", { count: "exact", head: true }).eq("user_id", userId);

  return {
    campaigns_created,
    campaigns_joined,
    total_characters: chars.length,
    average_party_size,
    favorite_class: class_distribution[0]?.name ?? null,
    favorite_class_ru: class_distribution[0]?.name ?? null,
    favorite_race: race_distribution[0]?.name ?? null,
    favorite_race_ru: race_distribution[0]?.name ?? null,
    favorite_role,
    favorite_role_ru,
    class_distribution,
    race_distribution,
    campaigns_by_month,
    theme_distribution,
    relationship_distribution: [], // Можно оставить пустым или добавить историю связей
    achievements_total: achTotal ?? 0,
    achievements_unlocked: achUnlocked ?? 0,
  };
}

export async function getProfileAchievements(
  userId: string,
): Promise<UserAchievement[]> {
  const supabase = createServerClient();
  const { data: all } = await supabase
    .from("achievements")
    .select("id, code, name_ru, description_ru, icon")
    .order("name_ru");

  const { data: userAch } = await supabase
    .from("user_achievements")
    .select("achievement_id, unlocked_at")
    .eq("user_id", userId);

  const unlockedMap = new Map(
    (userAch ?? []).map((ua) => [ua.achievement_id, ua.unlocked_at]),
  );

  return (all ?? []).map((a) => ({
    code: a.code,
    name_ru: a.name_ru,
    description_ru: a.description_ru,
    icon: a.icon,
    unlocked_at: unlockedMap.get(a.id) ?? null,
  }));
}