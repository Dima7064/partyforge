import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { getCampaignByCode, findInviteByCode, joinCampaign } from "@/lib/db/campaigns";
import { JoinForm } from "@/components/campaign/JoinForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function JoinByCodePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/join/${code}`);

  const inviteCheck = await findInviteByCode(code);
  const isInvite = inviteCheck !== null;
  const campaign = await getCampaignByCode(code, user.id);

  if (!campaign) {
    if (isInvite && inviteCheck) {
      const { createServerClient } = await import("@/lib/supabase/server");
      const admin = createServerClient();
      const { data: c } = await admin
        .from("campaigns")
        .select("share_code")
        .eq("id", inviteCheck.campaign_id)
        .maybeSingle();

      if (!c) notFound();
      redirect(`/join/${c.share_code}`);
    }
    notFound();
  }

  if (campaign.viewer_role !== "none") {
    redirect(`/c/${campaign.share_code}`);
  }

  const takenIndexes = new Set(
    campaign.members
      .filter((m) => m.character_index !== undefined)
      .map((m) => m.character_index!),
  );

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {isInvite ? "Приглашение в кампанию" : "Вход по коду"}
          </CardTitle>
          <p className="text-xs text-forge-muted">Код: {campaign.share_code}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            <Badge variant="gold">Классика D&D</Badge>
            <Badge variant="muted">{campaign.characters.length} героев</Badge>
            <Badge variant="muted">Ур. {campaign.input.level}</Badge>
          </div>
          <p className="text-forge-parchment text-sm">{campaign.situation}</p>
        </CardContent>
      </Card>
      <JoinForm
        code={campaign.share_code}
        characters={campaign.characters.map((c, i) => ({
          index: i,
          name: c.name,
          className: c.class_name,
          taken: takenIndexes.has(i),
        }))}
      />
    </main>
  );
}