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
  ThemeDistributionChart,
  RelationshipDistributionChart,
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
    <main className="min-h-screen p-8 max-w-6xl mx-auto space-y-8">
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
          <Button variant="outline">На главную</Button>
        </Link>
      </div>

      {/* Основные цифры */}
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
            <p className="text-forge-muted text-xs uppercase tracking-wider">Любимая роль</p>
            <p className="text-xl font-bold text-forge-gold-light mt-1 truncate">
              {stats.favorite_role_ru ?? "—"}
            </p>
            <p className="text-forge-muted text-xs mt-1">
              Класс: {stats.favorite_class_ru ?? "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-forge-muted text-xs uppercase tracking-wider">Достижения</p>
            <p className="text-3xl font-bold text-forge-gold-light mt-1">
              {stats.achievements_unlocked} <span className="text-lg text-forge-muted">/ {stats.achievements_total}</span>
            </p>
            <div className="w-full bg-forge-border rounded-full h-2 mt-2">
              <div
                className="bg-forge-gold h-2 rounded-full"
                style={{ width: `${(stats.achievements_unlocked / Math.max(1, stats.achievements_total)) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Графики */}
      <section className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Классы твоих персонажей</CardTitle>
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
        <Card>
          <CardHeader>
            <CardTitle>Темы кампаний</CardTitle>
          </CardHeader>
          <CardContent>
            <ThemeDistributionChart data={stats.theme_distribution} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Типы связей в твоих играх</CardTitle>
          </CardHeader>
          <CardContent>
            <RelationshipDistributionChart data={stats.relationship_distribution} />
          </CardContent>
        </Card>
      </section>

      {/* Достижения */}
      <section className="space-y-3 pt-4">
        <h2 className="text-2xl font-semibold text-forge-gold">
          Достижения ({stats.achievements_unlocked} из {stats.achievements_total})
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((a) => {
            const isUnlocked = a.unlocked_at !== null;
            return (
              <Card
                key={a.code}
                className={`transition-opacity ${isUnlocked ? "border-forge-gold/50" : "opacity-50 grayscale"}`}
              >
                <CardContent className="p-4 flex gap-3 items-start">
                  <span className="text-3xl">{a.icon}</span>
                  <div>
                    <p className={`font-semibold ${isUnlocked ? "text-forge-gold-light" : "text-forge-muted"}`}>
                      {a.name_ru}
                    </p>
                    <p className="text-xs text-forge-muted mt-1">{a.description_ru}</p>
                    {isUnlocked ? (
                      <p className="text-[10px] text-forge-gold mt-2">
                        Открыто {new Date(a.unlocked_at!).toLocaleDateString("ru-RU")}
                      </p>
                    ) : (
                      <p className="text-[10px] text-forge-muted mt-2">
                        🔒 Не открыто
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  );
}