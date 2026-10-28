import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { getCampaignByCode } from "@/lib/db/campaigns";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const campaign = await getCampaignByCode(code, user.id);
  if (!campaign) return NextResponse.json({ error: "Не найдено" }, { status: 404 });

  const actors = campaign.characters.map(c => ({
    name: c.name,
    type: "character",
    system: {
      abilities: {
        str: { value: c.abilities.str }, dex: { value: c.abilities.dex }, con: { value: c.abilities.con },
        int: { value: c.abilities.int }, wis: { value: c.abilities.wis }, cha: { value: c.abilities.cha }
      },
      details: { biography: { value: c.backstory + "\n\nСекрет: " + c.secret_text } }
    }
  }));

  const data = JSON.stringify({ actors }, null, 2);
  return new NextResponse(data, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="sagaforge-${code}-foundry.json"`
    }
  });
}