import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { createServerClient } from "@/lib/supabase/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

    const { image_id } = await req.json();
    const supabase = createServerClient();

    const { data: npc } = await supabase
      .from("npcs")
      .select("id, campaign_id")
      .eq("id", id)
      .maybeSingle();
    if (!npc) return NextResponse.json({ error: "NPC не найден" }, { status: 404 });

    const { data: member } = await supabase
      .from("campaign_members")
      .select("role")
      .eq("campaign_id", npc.campaign_id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (member?.role !== "master") {
      return NextResponse.json({ error: "Только мастер" }, { status: 403 });
    }

    const { data: image } = await supabase
      .from("images")
      .select("id")
      .eq("id", image_id)
      .eq("is_pool", true)
      .maybeSingle();
    if (!image) return NextResponse.json({ error: "Не из пула" }, { status: 400 });

    const { error } = await supabase
      .from("npcs")
      .update({ image_id })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PATCH /api/npcs/[id]/image failed:", e);
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}