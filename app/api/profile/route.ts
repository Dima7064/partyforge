import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";
import {
  getProfile,
  getProfileStats,
  getProfileAchievements,
} from "@/lib/db/profiles";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

    const [profile, stats, achievements] = await Promise.all([
      getProfile(user.id),
      getProfileStats(user.id),
      getProfileAchievements(user.id),
    ]);

    return NextResponse.json({ data: { profile, stats, achievements } });
  } catch (e) {
    console.error("GET /api/profile failed:", e);
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}