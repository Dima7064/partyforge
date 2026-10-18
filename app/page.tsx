import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
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
            Собирай связанные партии персонажей, локации, ситуации и сюжетные крючки
            для настольных ролевых игр.
          </p>
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/generate">
            <Button size="lg">Сгенерировать кампанию</Button>
          </Link>
          <Link href="/catalog">
            <Button size="lg" variant="outline">Каталог</Button>
          </Link>
          <Link href="/design">
            <Button size="lg" variant="ghost">Дизайн-система</Button>
          </Link>
        </div>

        <Card className="max-w-md mx-auto text-left">
          <CardContent>
            <p className="text-sm text-forge-muted">
              Версия 0.2 — генерация работает end-to-end. Дальше: экспорт в PDF и JSON.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}