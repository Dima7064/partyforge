import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createServerClient();
    const [classes, races, backgrounds] = await Promise.all([
      supabase.from("classes").select("name, name_ru").order("name"),
      supabase.from("races").select("name, name_ru").order("name"),
      supabase.from("backgrounds").select("name, name_ru").order("name"),
    ]);

    return NextResponse.json({
      data: {
        classes: classes.data ?? [],
        races: races.data ?? [],
        backgrounds: backgrounds.data ?? [],
      },
    });
  } catch (e) {
    console.error("GET /api/catalog/options failed:", e);
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}