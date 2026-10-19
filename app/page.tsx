import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <p className="text-forge-gold text-sm tracking-[0.3em] uppercase">
            Конструктор партий
          </p>
          <h1 className="text-5xl md:text-7xl font-bold text-forge-gold-light">
            PartyForge
          </h1>
          <p className="text-forge-muted text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
            Собирай связанные партии персонажей, локации, ситуации и сюжетные
            крючки для настольных ролевых игр.
          </p>
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button size="lg">Мой кабинет</Button>
              </Link>
              <Link href="/generate">
                <Button size="lg" variant="outline">Создать кампанию</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/register">
                <Button size="lg">Зарегистрироваться</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">Войти</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}