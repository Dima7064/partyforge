import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CampaignTabs } from "@/components/campaign/CampaignTabs";
import { getCampaignByCode } from "@/lib/db/campaigns";

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const campaign = await getCampaignByCode(code);

  if (!campaign) notFound();

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-forge-muted text-sm uppercase tracking-[0.2em] mb-1">
            Кампания
          </div>
          <h1 className="text-4xl font-bold text-forge-gold-light">
            {campaign.input.tone === "dark_fantasy" && "Тёмное фэнтези"}
            {campaign.input.tone === "heroic" && "Героика"}
            {campaign.input.tone === "comedic" && "Комедия"}
            {campaign.input.tone === "political" && "Политика"}
            {campaign.input.tone === "wild" && "Дикость"}
            {campaign.input.tone === "religious" && "Религия"}
            {" · "}
            Ур. {campaign.input.level} · {campaign.characters.length} героев
          </h1>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-forge-muted text-sm">Код:</span>
            <Badge variant="gold">{campaign.share_code}</Badge>
            <Link href="/">
              <Button variant="ghost" size="sm">На главную</Button>
            </Link>
          </div>
        </div>
      </div>

      <CampaignTabs campaign={campaign} />
    </main>
  );
}