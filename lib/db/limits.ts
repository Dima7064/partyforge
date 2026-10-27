import { createServerClient } from "@/lib/supabase/server";

export const MAX_CAMPAIGNS_PER_USER = 10;

/**
 * Считает, в скольких кампаниях пользователь участвует (мастер или игрок).
 * Лимит общий: и создание, и присоединение считаются.
 */
export async function getUserCampaignCount(userId: string): Promise<number> {
  const supabase = createServerClient();
  const { count } = await supabase
    .from("campaign_members")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);
  return count ?? 0;
}

/**
 * Проверка: не превышен ли лимит. Бросает Error с понятным сообщением.
 * action — "create" или "join", чтобы текст ошибки был разный.
 */
export async function assertCampaignLimit(
  userId: string,
  action: "create" | "join",
): Promise<void> {
  const count = await getUserCampaignCount(userId);
  if (count < MAX_CAMPAIGNS_PER_USER) return;

  if (action === "create") {
    throw new Error(
      "Вы достигли лимита в 10 кампаний. Удалите старую, чтобы создать новую.",
    );
  }
  throw new Error(
    "Вы достигли лимита в 10 кампаний. Покиньте или удалите старую, чтобы присоединиться.",
  );
}