import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createServerClient();
    
    const { data, error } = await supabase
      .from("campaigns")
      .select("id, share_code, title, created_at, party_size")
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data: data || [] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Ошибка загрузки каталога" }, { status: 500 });
  }
}