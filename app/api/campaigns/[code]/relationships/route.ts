import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { createServerClient } from "@/lib/supabase/server";
import { updateRelationshipType } from "@/lib/db/campaigns";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

    const url = new URL(req.url);
    const source = url.searchParams.get("source");
    const target = url.searchParams.get("target");
    if (source === null || target === null) {
      return NextResponse.json({ error: "Нужны source и target" }, { status: 400 });
    }

    const body = await req.json();
    const newType = String(body.type ?? "");
    if (!["trust", "debt", "love", "conflict", "secret"].includes(newType)) {
      return NextResponse.json({ error: "Неверный тип" }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data: campaign } = await supabase
      .from("campaigns")
      .select("id, user_id")
      .eq("share_code", code)
      .maybeSingle();
    if (!campaign) return NextResponse.json({ error: "Кампания не найдена" }, { status: 404 });
    if (campaign.user_id !== user.id) {
      return NextResponse.json({ error: "Только мастер" }, { status: 403 });
    }

    const { data: chars } = await supabase
      .from("characters")
      .select("id")
      .eq("campaign_id", campaign.id)
      .order("created_at");

    const sourceIdx = Number(source);
    const targetIdx = Number(target);
    if (!chars || sourceIdx >= chars.length || targetIdx >= chars.length) {
      return NextResponse.json({ error: "Неверные индексы" }, { status: 400 });
    }

    const { data: rel } = await supabase
      .from("relationships")
      .select("id")
      .eq("campaign_id", campaign.id)
      .eq("source_character_id", chars[sourceIdx].id)
      .eq("target_character_id", chars[targetIdx].id)
      .maybeSingle();

    if (!rel) {
      // возможно обратное направление
      const { data: rel2 } = await supabase
        .from("relationships")
        .select("id")
        .eq("campaign_id", campaign.id)
        .eq("source_character_id", chars[targetIdx].id)
        .eq("target_character_id", chars[sourceIdx].id)
        .maybeSingle();
      if (!rel2) return NextResponse.json({ error: "Связь не найдена" }, { status: 404 });
      await updateRelationshipType(rel2.id, user.id, newType);
    } else {
      await updateRelationshipType(rel.id, user.id, newType);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PATCH relationships failed:", e);
    const msg = e instanceof Error ? e.message : "Ошибка";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}