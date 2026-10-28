import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

    const supabase = createServerClient();
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("id, user_id")
      .eq("share_code", code)
      .maybeSingle();

    if (!campaign) return NextResponse.json({ error: "Кампания не найдена" }, { status: 404 });
    if (campaign.user_id !== user.id) return NextResponse.json({ error: "Только мастер" }, { status: 403 });

    const { error } = await supabase
      .from("campaigns")
      .update({ is_public: true })
      .eq("id", campaign.id);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}