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

    const { data: loc } = await supabase
      .from("locations")
      .select("id, campaign_id, type")
      .eq("id", id)
      .maybeSingle();
    if (!loc) return NextResponse.json({ error: "Локация не найдена" }, { status: 404 });

    const { data: member } = await supabase
      .from("campaign_members")
      .select("role")
      .eq("campaign_id", loc.campaign_id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (member?.role !== "master") {
      return NextResponse.json({ error: "Только мастер" }, { status: 403 });
    }

    const { data: image } = await supabase
      .from("images")
      .select("id, type, location_type")
      .eq("id", image_id)
      .eq("is_pool", true)
      .maybeSingle();
    if (!image) return NextResponse.json({ error: "Не из пула" }, { status: 400 });
    if (image.type !== "location") {
      return NextResponse.json({ error: "Это не локация" }, { status: 400 });
    }
    if (image.location_type !== loc.type) {
      return NextResponse.json(
        { error: "Тип локации не совпадает" },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("locations")
      .update({ image_id })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PATCH /api/locations/[id]/image failed:", e);
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}