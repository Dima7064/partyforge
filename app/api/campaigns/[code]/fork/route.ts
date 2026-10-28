import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { createServerClient } from "@/lib/supabase/server";
import { generateShareCode } from "@/lib/campaigns/shareCode";
import { assertCampaignLimit } from "@/lib/db/limits";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  try {
    await assertCampaignLimit(user.id, "create");
  } catch (e) {
    return NextResponse.json({ error: "Достигнут лимит кампаний" }, { status: 400 });
  }

  const { code } = await params;
  const supabase = createServerClient();

  const { data: original } = await supabase.from("campaigns").select("*").eq("share_code", code).eq("is_public", true).single();
  if (!original) return NextResponse.json({ error: "Кампания не найдена или не публична" }, { status: 404 });
  if (original.user_id === user.id) return NextResponse.json({ error: "Нельзя форкнуть свою кампанию" }, { status: 400 });

  const newCode = generateShareCode();
  
  const { data: newCampaign, error } = await supabase.from("campaigns").insert({
    share_code: newCode,
    user_id: user.id,
    title: `Копия: ${original.title}`,
    system: original.system,
    level: original.level,
    tone: original.tone,
    party_size: original.party_size,
    world: original.world,
    constraints: original.constraints,
    duration: original.duration,
    situation: original.situation,
    forked_from: original.id,
  }).select("id").single();

  if (error) return NextResponse.json({ error: "Ошибка" }, { status: 500 });

  await supabase.from("campaign_members").insert({ campaign_id: newCampaign.id, user_id: user.id, role: "master" });
  await supabase.from("campaigns").update({ fork_count: original.fork_count + 1 }).eq("id", original.id);

  const { data: chars } = await supabase.from("characters").select("*").eq("campaign_id", original.id);
  if (chars && chars.length > 0) {
    const newChars = chars.map(c => ({
      campaign_id: newCampaign.id, name: c.name, class_name: c.class_name, race_name: c.race_name,
      background_name: c.background_name, level: c.level, role: c.role, abilities: c.abilities,
      personality: c.personality, backstory: c.backstory, secret_text: c.secret_text
    }));
    await supabase.from("characters").insert(newChars);
  }

  return NextResponse.json({ share_code: newCode });
}