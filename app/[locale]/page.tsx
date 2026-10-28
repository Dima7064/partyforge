import { getCurrentUser } from "@/lib/auth/currentUser";
import { Hero } from "@/components/home/Hero";
import { Ornament } from "@/components/ui/ornament";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main id="main-content" className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <Hero authenticated={!!user} />
      <div className="max-w-2xl w-full mt-12">
        <Ornament />
        <p className="text-forge-muted text-lg leading-relaxed illuminated-letter">
          Добро пожаловать в Сагу. Здесь рождаются легенды. Наш конструктор позволяет создать глубокий, связанный мир за считанные секунды. Выбирайте, комбинируйте и создавайте кампании, которые запомнятся вашим игрокам на долгие годы.
        </p>
      </div>
    </main>
  );
}