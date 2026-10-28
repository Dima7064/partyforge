import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServerClient();
  const [names, titles, descs, traits] = await Promise.all([
    supabase.from("name_pool").select("*"),
    supabase.from("title_pool").select("*"),
    supabase.from("description_pool").select("*"),
    supabase.from("traits").select("*"),
  ]);

  return NextResponse.json({
    names: names.data ?? [],
    titles: titles.data ?? [],
    descriptions: descs.data ?? [],
    traits: traits.data ?? [],
  });
}