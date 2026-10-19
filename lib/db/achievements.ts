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