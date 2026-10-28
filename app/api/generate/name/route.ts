import { NextRequest, NextResponse } from "next/server";
import { generateFantasyName } from "@/lib/generator/name-generator";

export async function POST(req: NextRequest) {
  const { race } = await req.json();
  const name = generateFantasyName(race || "Human");
  return NextResponse.json({ name });
}