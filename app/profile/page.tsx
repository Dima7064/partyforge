import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/currentUser";
import {
  getProfile,
  getProfileStats,
  getProfileAchievements,
} from "@/lib/db/profiles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SmartLink } from "@/components/ui/smart-link";
import { CountUp } from "@/components/ui/count-up";
import { Reveal } from "@/components/ui/reveal";
import {
  ClassDistributionChart,
  CampaignsByMonthChart,
  ThemeDistributionChart,
  RelationshipDistributionChart,
} from "@/components/profile/StatsCharts";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/profile");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/register");

  const [stats, achievements] = await Promise.all([
    getProfileStats(user.id),
    getProfileAchievements(user.id),
  ]);

  const progressPercent = Math.round(
    (stats.achievements_unlocked / Math.max(1, stats.achievements_total)) * 100,
  );

  return (
    <main
      id="main-content"
      className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto space-y-8"
    >
      <Reveal>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-forge-muted text-sm uppercase tracking-wider">
              Профиль
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-forge-gold-light">
              {profile.username}
            </h1>
            <p className="text-forge-muted text-sm mt-1">
              С нами с {new Date(profile.created_at).toLocaleDateString("ru-RU")}
            </p>
          </div>
          <SmartLink href="/dashboard">
            <Button variant="outline">На главную</Button>
          </SmartLink>
        </div>
      </Reveal>

      {/* Основные цифры */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Reveal delay={0}>
          <Card>
            <CardContent className="p-4 md:p-5">
              <p className="text-forge-muted text-xs uppercase tracking-wider">
                Мастер
              </p>
              <p className="text-2xl md:text-3xl font-bold text-forge-gold-light mt-1">
                <CountUp value={stats.campaigns_created} />
              </p>
              <p className="text-forge-muted text-xs mt-1">кампаний создано</p>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={0.05}>
          <Card>
            <CardContent className="p-4 md:p-5">
              <p className="text-forge-muted text-xs uppercase tracking-wider">
                Игрок
              </p>
              <p className="text-2xl md:text-3xl font-bold text-forge-gold-light mt-1">
                <CountUp value={stats.campaigns_joined} />
              </p>
              <p className="text-forge-muted text-xs mt-1">кампаний пройдено</p>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={0.1}>
          <Card>
            <CardContent className="p-4 md:p-5">
              <p className="text-forge-muted text-xs uppercase tracking-wider">
                Любимая роль
              </p>
              <p className="text-lg md:text-xl font-bold text-forge-gold-light mt-1 truncate">
                {stats.favorite_role_ru ?? "—"}
              </p>
              <p className="text-forge-muted text-xs mt-1 truncate">
                Класс: {stats.favorite_class_ru ?? "—"}
              </p>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={0.15}>
          <Card>
            <CardContent className="p-4 md:p-5">
              <p className="text-forge-muted text-xs uppercase tracking-wider">
                Достижения
              </p>
              <p className="text-2xl md:text-3xl font-bold text-forge-gold-light mt-1">
                <CountUp value={stats.achievements_unlocked} />
                <span className="text-base md:text-lg text-forge-muted">
                  {" "}/ {stats.achievements_total}
                </span>
              </p>
              <div
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Открыто ${stats.achievements_unlocked} из ${stats.achievements_total} достижений`}
                className="w-full bg-forge-border rounded-full h-2 mt-2"
              >
                <div
                  className="bg-forge-gold h-2 rounded-full transition-[width] duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </section>

      {/* Графики */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Reveal>
          <Card>
            <CardHeader>
              <CardTitle>Классы твоих персонажей</CardTitle>
            </CardHeader>
            <CardContent>
              <ClassDistributionChart data={stats.class_distribution} />
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={0.05}>
          <Card>
            <CardHeader>
              <CardTitle>Кампании по месяцам</CardTitle>
            </CardHeader>
            <CardContent>
              <CampaignsByMonthChart data={stats.campaigns_by_month} />
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle>Темы кампаний</CardTitle>
            </CardHeader>
            <CardContent>
              <ThemeDistributionChart data={stats.theme_distribution} />
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={0.15}>
          <Card>
            <CardHeader>
              <CardTitle>Типы связей в твоих играх</CardTitle>
            </CardHeader>
            <CardContent>
              <RelationshipDistributionChart
                data={stats.relationship_distribution}
              />
            </CardContent>
          </Card>
        </Reveal>
      </section>

      {/* Достижения */}
      <section className="space-y-3 pt-4">
        <Reveal>
          <h2 className="text-2xl font-semibold text-forge-gold">
            Достижения ({stats.achievements_unlocked} из{" "}
            {stats.achievements_total})
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((a, i) => {
            const isUnlocked = a.unlocked_at !== null;
            return (
              <Reveal key={a.code} delay={i * 0.04}>
                <Card
                  className={`h-full transition-opacity ${
                    isUnlocked
                      ? "border-forge-gold/50"
                      : "opacity-50 grayscale"
                  }`}
                >
                  <CardContent className="p-4 flex gap-3 items-start">
                    <span className="text-3xl" aria-hidden="true">
                      {a.icon}
                    </span>
                    <div>
                      <p
                        className={`font-semibold ${
                          isUnlocked
                            ? "text-forge-gold-light"
                            : "text-forge-muted"
                        }`}
                      >
                        {a.name_ru}
                      </p>
                      <p className="text-xs text-forge-muted mt-1">
                        {a.description_ru}
                      </p>
                      {isUnlocked ? (
                        <p className="text-[10px] text-forge-gold mt-2">
                          Открыто{" "}
                          {new Date(a.unlocked_at!).toLocaleDateString("ru-RU")}
                        </p>
                      ) : (
                        <p className="text-[10px] text-forge-muted mt-2">
                          <span aria-hidden="true">🔒 </span>
                          Не открыто
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </section>
    </main>
  );
}