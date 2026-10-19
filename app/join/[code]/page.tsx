import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { getCampaignByCode } from "@/lib/db/campaigns";
import { JoinForm } from "@/components/campaign/JoinForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const THEME_LABEL: Record<string, string> = {
  classic: "Классика D&D",
  skyrim: "Скайрим",
};

export default async function JoinByCodePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/join/${code}`);

  const campaign = await getCampaignByCode(code, user.id);
  if (!campaign) notFound();

  if (campaign.viewer_role !== "none") {
    redirect(`/c/${code}`);
  }

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Приглашение в кампанию</CardTitle>
          <p className="text-xs text-forge-muted">
            Код: {campaign.share_code}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            <Badge variant="gold">{THEME_LABEL[campaign.theme]}</Badge>
            <Badge variant="muted">{campaign.characters.length} героев</Badge>
            <Badge variant="muted">Ур. {campaign.input.level}</Badge>
          </div>
          <p className="text-forge-parchment text-sm">{campaign.situation}</p>
        </CardContent>
      </Card>

      <JoinForm
        code={code}
        characters={campaign.characters.map((c, i) => ({
          index: i,
          name: c.name,
          className: c.class_name,
          taken: campaign.members.some((m) => m.character_index === i),
        }))}
      />
    </main>
  );
}