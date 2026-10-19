import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

    const admin = createServerClient();
    const { data: memberships } = await admin
      .from("campaign_members")
      .select("campaign_id, role")
      .eq("user_id", user.id);

    const campaignIds = (memberships ?? []).map((m) => m.campaign_id);
    if (campaignIds.length === 0) return NextResponse.json({ data: [] });

    const { data: campaigns } = await admin
      .from("campaigns")
      .select("id, share_code, title, theme, status, party_size, created_at")
      .in("id", campaignIds)
      .order("created_at", { ascending: false });

    const roleMap = new Map((memberships ?? []).map((m) => [m.campaign_id, m.role]));
    const rows = (campaigns ?? []).map((c) => ({
      ...c,
      role: roleMap.get(c.id),
    }));

    return NextResponse.json({ data: rows });
  } catch (e) {
    console.error("GET /api/campaigns failed:", e);
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}