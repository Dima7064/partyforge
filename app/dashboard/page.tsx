import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { getProfile } from "@/lib/db/profiles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SmartLink } from "@/components/ui/smart-link";
import { createServerClient } from "@/lib/supabase/server";

function formatPlayers(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return `${n} игроков`;
  if (mod10 === 1) return `${n} игрок`;
  if (mod10 >= 2 && mod10 <= 4) return `${n} игрока`;
  return `${n} игроков`;
}

const THEME_LABEL: Record<string, string> = {
  classic: "Классика D&D",
  skyrim: "Скайрим",
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Черновик",
  active: "Активна",
  finished: "Завершена",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/register");

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
    theme: string;
    status: string;
    party_size: number;
  }> =
    campaignIds.length > 0
      ? (
          (
            await admin
              .from("campaigns")
              .select(
                "id, share_code, title, theme, status, party_size, created_at",
              )
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
            Личный кабинет
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-forge-gold-light">
            Привет, {profile.username}
          </h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/generate">
            <Button>Создать кампанию</Button>
          </Link>
          <Link href="/join">
            <Button variant="outline">Присоединиться</Button>
          </Link>
          <SmartLink href="/profile">
            <Button variant="ghost">Профиль</Button>
          </SmartLink>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-forge-gold">Мои кампании</h2>
        {campaigns.length === 0 ? (
          <Card>
            <CardContent>
              <p className="text-forge-muted text-sm">
                Пока нет кампаний. Создай первую или присоединись по коду.
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
                        {STATUS_LABEL[c.status] ?? c.status}
                      </Badge>
                    </CardTitle>
                    <p className="text-xs text-forge-muted">
                      {THEME_LABEL[c.theme] ?? c.theme} ·{" "}
                      {formatPlayers(c.party_size - 1)}
                    </p>
                  </CardHeader>
                  <CardContent className="flex gap-2 flex-wrap">
                    <Badge variant="gold">
                      {roleMap.get(c.id) === "master" ? "Мастер" : "Игрок"}
                    </Badge>
                    <Link href={`/c/${c.share_code}`}>
                      <Button size="sm" variant="outline">
                        Открыть
                      </Button>
                    </Link>
                    {roleMap.get(c.id) === "master" && (
                      <SmartLink href={`/c/${c.share_code}/settings`}>
                        <Button size="sm" variant="ghost">
                          Настройки
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