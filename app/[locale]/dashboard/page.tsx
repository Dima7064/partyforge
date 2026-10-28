import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { getProfile } from "@/lib/db/profiles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SmartLink } from "@/components/ui/smart-link";
import { createServerClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";

function formatPlayers(n: number, locale: string): string {
  if (locale === "en") return `${n} players`;
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return `${n} игроков`;
  if (mod10 === 1) return `${n} игрок`;
  if (mod10 >= 2 && mod10 <= 4) return `${n} игрока`;
  return `${n} игроков`;
}

export default async function DashboardPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Dashboard' });

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login?next=/${locale}/dashboard`);

  const profile = await getProfile(user.id);
  if (!profile) redirect(`/${locale}/register`);

  const admin = createServerClient();

  const { data: memberships } = await admin
    .from("campaign_members")
    .select("campaign_id, role")
    .eq("user_id", user.id);

  const campaignIds = (memberships ?? []).map((m) => m.campaign_id);
  const roleMap = new Map(
    (memberships ?? []).map((m) => [m.campaign_id, m.role]),
  );

  const campaigns: Array<{
    id: string;
    share_code: string;
    title: string;
    status: string;
    party_size: number;
  }> =
    campaignIds.length > 0
      ? (
          (
            await admin
              .from("campaigns")
              .select("id, share_code, title, status, party_size, created_at")
              .in("id", campaignIds)
              .order("created_at", { ascending: false })
          ).data ?? []
        )
      : [];

  return (
    <main
      id="main-content"
      className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto space-y-8"
    >
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-forge-muted text-sm uppercase tracking-wider">
            {t('cabinet')}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-forge-gold-light">
            {t('greeting')}, {profile.username}
          </h1>
        </div>
        
        <div className="flex gap-2 flex-wrap items-center w-full md:w-auto">
          <Link href={`/${locale}/generate`}>
            <Button>{t('create')}</Button>
          </Link>
          <Link href={`/${locale}/join`}>
            <Button variant="outline">{t('join')}</Button>
          </Link>
          <Link href={`/${locale}/explore`}>
            <Button variant="outline">{t('explore')}</Button>
          </Link>
          
          <div className="flex-grow hidden md:block" />
          
          <Link href={`/${locale}/library`}>
            <Button variant="outline">{t('library')}</Button>
          </Link>
          <SmartLink href={`/${locale}/profile`}>
            <Button variant="outline">{t('profile')}</Button>
          </SmartLink>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-forge-gold">{t('myCampaigns')}</h2>
        {campaigns.length === 0 ? (
          <Card>
            <CardContent>
              <p className="text-forge-muted text-sm">
                {t('emptyText')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((c, i) => (
              <div
                key={c.id}
                className="animate-fade-up stagger"
                style={{ ["--stagger" as string]: String(i) }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-2 flex-wrap">
                      <span>{c.title}</span>
                      <Badge variant="muted">
                        {c.status}
                      </Badge>
                    </CardTitle>
                    <p className="text-xs text-forge-muted">
                      D&D · {formatPlayers(c.party_size - 1, locale)}
                    </p>
                  </CardHeader>
                  <CardContent className="flex gap-2 flex-wrap">
                    <Badge variant="gold">
                      {roleMap.get(c.id) === "master" ? t('master') : t('player')}
                    </Badge>
                    <Link href={`/${locale}/c/${c.share_code}`}>
                      <Button size="sm" variant="outline">
                        {t('open')}
                      </Button>
                    </Link>
                    {roleMap.get(c.id) === "master" && (
                      <SmartLink href={`/${locale}/c/${c.share_code}/settings`}>
                        <Button size="sm" variant="ghost">
                          {t('settings')}
                        </Button>
                      </SmartLink>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}