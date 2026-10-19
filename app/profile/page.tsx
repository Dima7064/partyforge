import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/currentUser";
import {
  getProfile,
  getProfileStats,
  getProfileAchievements,
} from "@/lib/db/profiles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ClassDistributionChart,
  CampaignsByMonthChart,
} from "@/components/profile/StatsCharts";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/register");

  const [stats, achievements] = await Promise.all([
    getProfileStats(user.id),
    getProfileAchievements(user.id),
  ]);

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-forge-muted text-sm uppercase tracking-wider">Профиль</p>
          <h1 className="text-4xl font-bold text-forge-gold-light">
            {profile.username}
          </h1>
          <p className="text-forge-muted text-sm mt-1">
            С нами с {new Date(profile.created_at).toLocaleDateString("ru-RU")}
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">На дашборд</Button>
        </Link>
      </div>

      <section className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-forge-muted text-xs uppercase tracking-wider">Мастер</p>
            <p className="text-3xl font-bold text-forge-gold-light mt-1">
              {stats.campaigns_created}
            </p>
            <p className="text-forge-muted text-xs mt-1">кампаний создано</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-forge-muted text-xs uppercase tracking-wider">Игрок</p>
            <p className="text-3xl font-bold text-forge-gold-light mt-1">
              {stats.campaigns_joined}
            </p>
            <p className="text-forge-muted text-xs mt-1">кампаний пройдено</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-forge-muted text-xs uppercase tracking-wider">Персонажи</p>
            <p className="text-3xl font-bold text-forge-gold-light mt-1">
              {stats.total_characters}
            </p>
            <p className="text-forge-muted text-xs mt-1">всего создано</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-forge-muted text-xs uppercase tracking-wider">Любимый класс</p>
            <p className="text-xl font-bold text-forge-gold-light mt-1 truncate">
              {stats.favorite_class_ru ?? "—"}
            </p>
            <p className="text-forge-muted text-xs mt-1">
              {stats.favorite_race_ru ? `Раса: ${stats.favorite_race_ru}` : "—"}
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Классы персонажей</CardTitle>
          </CardHeader>
          <CardContent>
            <ClassDistributionChart data={stats.class_distribution} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Кампании по месяцам</CardTitle>
          </CardHeader>
          <CardContent>
            <CampaignsByMonthChart data={stats.campaigns_by_month} />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-forge-gold">
          Достижения ({achievements.length})
        </h2>
        {achievements.length === 0 ? (
          <Card>
            <CardContent>
              <p className="text-forge-muted text-sm">
                Пока нет достижений. Создай первую кампанию!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {achievements.map((a) => (
              <Card key={a.code}>
                <CardContent className="p-4 flex gap-3 items-start">
                  <span className="text-3xl">{a.icon}</span>
                  <div>
                    <p className="font-semibold text-forge-gold-light">{a.name_ru}</p>
                    <p className="text-xs text-forge-muted mt-1">{a.description_ru}</p>
                    <p className="text-[10px] text-forge-muted mt-1">
                      {new Date(a.unlocked_at).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}