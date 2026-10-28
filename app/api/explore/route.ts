import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = createServerClient();
  const url = new URL(req.url);
  const sort = url.searchParams.get("sort") || "new";

  let query = supabase.from("campaigns").select(`
    id, share_code, title, created_at, fork_count, locale,
    profiles:user_id (username),
    campaign_ratings (rating)
  `).eq("is_public", true);

  if (sort === "popular") {
    query = query.order("fork_count", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "Ошибка" }, { status: 500 });

  const formatted = data.map((c: any) => {
    const ratings = c.campaign_ratings || [];
    const avg = ratings.length > 0 ? ratings.reduce((acc: number, r: any) => acc + r.rating, 0) / ratings.length : 0;
    return {
      id: c.id,
      share_code: c.share_code,
      title: c.title,
      author: c.profiles?.username || "Unknown",
      forks: c.fork_count,
      rating: avg,
      locale: c.locale
    };
  });

  return NextResponse.json({ data: formatted });
}