import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { getLibraryItems, createLibraryItem } from "@/lib/db/library";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

    const type = new URL(req.url).searchParams.get("type") || undefined;
    const items = await getLibraryItems(user.id, type);
    
    return NextResponse.json({ data: items });
  } catch (e) {
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

    const body = await req.json();
    const item = await createLibraryItem(user.id, body);
    
    return NextResponse.json({ data: item });
  } catch (e) {
    return NextResponse.json({ error: "Ошибка" }, { status: 400 });
  }
}