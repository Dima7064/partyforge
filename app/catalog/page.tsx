import { getClasses, getRaces, getBackgrounds, getTraits, getSecrets, getHookTemplates, getToneWeights } from "@/lib/db/catalog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function CatalogPage() {
  const [classes, races, backgrounds, traits, secrets, hookTemplates, toneWeights] =
    await Promise.all([
      getClasses(),
      getRaces(),
      getBackgrounds(),
      getTraits(),
      getSecrets(),
      getHookTemplates(),
      getToneWeights(),
    ]);

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto space-y-12">
      <div>
        <h1 className="text-4xl font-bold text-forge-gold-light mb-2">Каталог</h1>
        <p className="text-forge-muted">
          Всё, из чего собираются персонажи и миры.
        </p>
      </div>

      {/* Классы */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-forge-gold">
          Классы <span className="text-forge-muted text-base">({classes.length})</span>
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((c) => (
            <Card key={c.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {c.name}
                  <Badge variant="muted">{c.role}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-forge-parchment mb-3">{c.description}</p>
                <div className="flex flex-wrap gap-1">
                  {c.tone_tags.map((t: string) => (
                    <Badge key={t} variant="gold">{t}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Расы */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-forge-gold">
          Расы <span className="text-forge-muted text-base">({races.length})</span>
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {races.map((r) => (
            <Card key={r.id}>
              <CardHeader>
                <CardTitle>{r.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-forge-parchment mb-3">{r.description}</p>
                <div className="flex flex-wrap gap-1">
                  {r.tone_tags.map((t: string) => (
                    <Badge key={t} variant="gold">{t}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Предыстории */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-forge-gold">
          Предыстории <span className="text-forge-muted text-base">({backgrounds.length})</span>
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {backgrounds.map((b) => (
            <Card key={b.id}>
              <CardHeader>
                <CardTitle>{b.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-forge-parchment mb-3">{b.description}</p>
                <div className="flex flex-wrap gap-1">
                  {b.tone_tags.map((t: string) => (
                    <Badge key={t} variant="gold">{t}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Черты */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-forge-gold">
          Черты <span className="text-forge-muted text-base">({traits.length})</span>
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {traits.map((t) => (
            <Card key={t.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-forge-parchment">{t.name}</span>
                  <Badge variant="muted">{t.type}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Тайны */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-forge-gold">
          Тайны <span className="text-forge-muted text-base">({secrets.length})</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {secrets.map((s) => (
            <Card key={s.id}>
              <CardContent className="p-4">
                <p className="text-sm text-forge-parchment">{s.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Шаблоны крючков */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-forge-gold">
          Шаблоны крючков <span className="text-forge-muted text-base">({hookTemplates.length})</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {hookTemplates.map((h) => (
            <Card key={h.id}>
              <CardContent className="p-4">
                <p className="text-sm text-forge-parchment">{h.template}</p>
                <Badge variant="muted" className="mt-2">{h.type}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Tone-веса */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-forge-gold">
          Tone-веса <span className="text-forge-muted text-base">({toneWeights.length})</span>
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {toneWeights.map((tw) => (
            <Card key={tw.id}>
              <CardContent className="p-4 text-sm text-forge-parchment">
                {tw.tone} · {tw.entity_type} · {tw.weight}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}