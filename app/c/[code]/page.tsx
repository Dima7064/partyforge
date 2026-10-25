import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CampaignTabs } from "@/components/campaign/CampaignTabs";
import { LeaveButton } from "@/components/campaign/LeaveButton";
import { SmartLink } from "@/components/ui/smart-link";
import { getCampaignByCode } from "@/lib/db/campaigns";
import { getCurrentUser } from "@/lib/auth/currentUser";

const THEME_LABEL: Record<string, string> = {
  classic: "Классика D&D",
  skyrim: "Скайрим",
};

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const user = await getCurrentUser();
  const campaign = await getCampaignByCode(code, user?.id);

  if (!campaign) notFound();
  if (campaign.viewer_role === "none") redirect(`/join/${code}`);

  return (
    <main
      id="main-content"
      className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto space-y-8"
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-forge-muted text-sm uppercase tracking-[0.2em] mb-1">
            Кампания
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-forge-gold-light">
            {THEME_LABEL[campaign.theme] ?? campaign.theme} · Ур.{" "}
            {campaign.input.level} · {campaign.characters.length} героев
          </h1>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <Badge variant="gold">{campaign.share_code}</Badge>
            <Badge variant="muted">
              {campaign.viewer_role === "master" ? "Ты — мастер" : "Ты — игрок"}
            </Badge>
            <SmartLink href="/dashboard">
              <Button variant="ghost" size="sm">
                На главную
              </Button>
            </SmartLink>
            {campaign.viewer_role === "master" && (
              <SmartLink href={`/c/${code}/settings`}>
                <Button variant="ghost" size="sm">
                  Настройки
                </Button>
              </SmartLink>
            )}
            {campaign.viewer_role === "player" && (
              <LeaveButton campaignCode={code} />
            )}
          </div>
        </div>
      </div>

      <CampaignTabs campaign={campaign} />
    </main>
  );
}