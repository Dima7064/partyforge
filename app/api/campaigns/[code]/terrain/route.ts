import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { createServerClient } from "@/lib/supabase/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

    const { image_id } = await req.json();
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

    const { data: image } = await supabase
      .from("images")
      .select("id, type")
      .eq("id", image_id)
      .eq("is_pool", true)
      .maybeSingle();
    if (!image || image.type !== "terrain") {
      return NextResponse.json({ error: "Нужен террейн из пула" }, { status: 400 });
    }

    const { error } = await supabase
      .from("campaigns")
      .update({ terrain_image_id: image_id })
      .eq("id", campaign.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PATCH /api/campaigns/[code]/terrain failed:", e);
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}