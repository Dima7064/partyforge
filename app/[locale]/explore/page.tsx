import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ExplorePage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const supabase = createServerClient();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, share_code, title, party_size, created_at")
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  return (
    <main id="main-content" className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-forge-gold-light mb-2">
          Каталог кампаний
        </h1>
        <p className="text-forge-muted">
          Публичные приключения, созданные сообществом SagaForge.
        </p>
      </div>

      {!campaigns || campaigns.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-forge-muted">
              В каталоге пока пусто. Зайдите в настройки своей кампании и нажмите «Опубликовать», чтобы поделиться ею!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((c) => (
            <Link key={c.id} href={`/${locale}/c/${c.share_code}`}>
              <Card className="h-full hover:border-forge-gold/50 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">{c.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="muted">Код: {c.share_code}</Badge>
                    <Badge variant="muted">{c.party_size - 1} игроков</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}