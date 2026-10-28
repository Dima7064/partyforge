import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { campaignId, rating } = await req.json();
  if (rating < 1 || rating > 5) return NextResponse.json({ error: "Оценка от 1 до 5" }, { status: 400 });

  const supabase = createServerClient();
  const { data: campaign } = await supabase.from("campaigns").select("user_id").eq("id", campaignId).single();
  
  if (campaign?.user_id === user.id) {
    return NextResponse.json({ error: "Нельзя оценивать свою кампанию" }, { status: 400 });
  }

  const { error } = await supabase.from("campaign_ratings").upsert(
    { user_id: user.id, campaign_id: campaignId, rating },
    { onConflict: "user_id,campaign_id" }
  );

  if (error) return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  return NextResponse.json({ ok: true });
}