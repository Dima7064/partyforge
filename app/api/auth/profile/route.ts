import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { createServerClient } from "@/lib/supabase/server";
import { validateUsername } from "@/lib/utils/username";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { username } = await req.json();
    const err = validateUsername(username);
    if (err) {
      return NextResponse.json({ error: err }, { status: 400 });
    }

    const admin = createServerClient();
    const { error } = await admin
      .from("profiles")
      .insert({ id: user.id, username: username.toLowerCase() });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Это имя уже занято" },
          { status: 400 },
        );
      }
      throw error;
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/auth/profile failed:", e);
    return NextResponse.json(
      { error: "Не удалось создать профиль" },
      { status: 500 },
    );
  }
}