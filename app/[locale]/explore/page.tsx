import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";

export default async function ExplorePage() {
  const supabase = createServerClient();
  const { data } = await supabase.from("campaigns").select(`
    id, share_code, title, created_at, fork_count,
    profiles:user_id (username),
    campaign_ratings (rating)
  `).eq("is_public", true).order("created_at", { ascending: false });

  const campaigns = (data || []).map((c: any) => {
    const ratings = c.campaign_ratings || [];
    const avg = ratings.length > 0 ? (ratings.reduce((acc: number, r: any) => acc + r.rating, 0) / ratings.length).toFixed(1) : "0.0";
    return { ...c, avg };
  });

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-forge-gold-light">Каталог кампаний</h1>
        <p className="text-forge-muted">Открывайте и копируйте кампании других мастеров</p>
      </div>

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-forge-muted">Пока нет публичных кампаний.</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((c: any) => (
            <Card key={c.id}>
              <CardHeader>
                <CardTitle className="text-lg">{c.title}</CardTitle>
                <p className="text-xs text-forge-muted">Автор: {c.profiles?.username || "Unknown"}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="gold">★ {c.avg}</Badge>
                  <Badge variant="muted">Форков: {c.fork_count}</Badge>
                </div>
                <Link href={`/c/${c.share_code}`}>
                  <Button className="w-full" variant="outline">Посмотреть</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}