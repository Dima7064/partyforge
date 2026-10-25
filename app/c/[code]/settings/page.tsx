import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { getCampaignByCode } from "@/lib/db/campaigns";
import { SettingsForm } from "@/components/campaign/SettingsForm";
import { InvitesPanel } from "@/components/campaign/InvitesPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SmartLink } from "@/components/ui/smart-link";

export default async function CampaignSettingsPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const campaign = await getCampaignByCode(code, user.id);
  if (!campaign) notFound();
  if (campaign.viewer_role !== "master") {
    return (
      <main id="main-content" className="min-h-screen p-8 max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <p className="text-forge-muted">
              Только мастер может настраивать кампанию.
            </p>
            <SmartLink href={`/c/${code}`}>
              <Button variant="outline" className="mt-3">
                Назад
              </Button>
            </SmartLink>
          </CardContent>
        </Card>
      </main>
    );
  }

  const joinUrl = `/join/${code}`;

  return (
    <main
      id="main-content"
      className="min-h-screen p-8 max-w-3xl mx-auto space-y-6"
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-forge-muted text-sm uppercase tracking-wider">
            Настройки
          </p>
          <h1 className="text-3xl font-bold text-forge-gold-light">
            {campaign.share_code}
          </h1>
        </div>
        <SmartLink href={`/c/${code}`}>
          <Button variant="outline">К кампании</Button>
        </SmartLink>
      </div>

      <SettingsForm
        code={code}
        initialTitle={""}
        initialStatus={campaign.status}
      />

      <Card>
        <CardHeader>
          <CardTitle>Приглашение</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-forge-muted text-sm">
            Отправь эту ссылку игрокам — они войдут по коду.
          </p>
          <div className="flex gap-2 items-center flex-wrap">
            <Badge variant="gold">{campaign.share_code}</Badge>
            <code className="text-forge-parchment bg-forge-bg border border-forge-border px-2 py-1 rounded text-sm">
              {joinUrl}
            </code>
            <SmartLink href={joinUrl}>
              <Button size="sm" variant="outline">
                Открыть страницу входа
              </Button>
            </SmartLink>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Участники ({campaign.members.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {campaign.members.map((m) => {
            const char =
              m.character_index !== undefined
                ? campaign.characters[m.character_index]
                : null;
            return (
              <div
                key={m.user_id}
                className="flex items-center justify-between border-b border-forge-border pb-2 last:border-0 last:pb-0"
              >
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                  <span className="text-forge-parchment font-medium">
                    {m.username || m.user_id.slice(0, 8)}
                  </span>
                  {char ? (
                    <span className="text-forge-muted text-xs sm:text-sm">
                      играет за {char.name}
                    </span>
                  ) : (
                    <span className="text-forge-muted text-xs sm:text-sm">
                      управляет миром
                    </span>
                  )}
                </div>
                <Badge variant={m.role === "master" ? "gold" : "muted"}>
                  {m.role === "master" ? "Мастер" : "Игрок"}
                </Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <InvitesPanel
        campaignCode={code}
        initialInvites={campaign.invites ?? []}
      />
    </main>
  );
}