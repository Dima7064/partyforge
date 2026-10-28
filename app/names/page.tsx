"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/lib/hooks/useToast";
import { useRouter } from "next/navigation";

const RACES = ["Human", "Elf", "Dwarf", "Halfling", "Dragonborn", "Gnome", "Half-Elf", "Half-Orc", "Tiefling"];

export default function NamesPage() {
  const { show } = useToast();
  const router = useRouter();
  const [race, setRace] = useState("Human");
  const [names, setNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    try {
      const promises = Array.from({ length: 10 }).map(() =>
        fetch("/api/generate/name", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ race }),
        }).then(r => r.json())
      );
      const results = await Promise.all(promises);
      setNames(results.map(r => r.name));
    } finally {
      setLoading(false);
    }
  }

  async function saveName(name: string) {
    setSaving(name);
    try {
      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "name",
          name: name,
          data: { value: name, race },
        }),
      });
      if (res.status === 401) {
        router.push("/login?next=/names");
        return;
      }
      if (!res.ok) throw new Error("Ошибка сохранения");
      show("success", "Имя сохранено в библиотеку");
    } catch (e) {
      show("error", "Не удалось сохранить");
    } finally {
      setSaving(null);
    }
  }

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-forge-gold-light mb-2">Генератор имён</h1>
        <p className="text-forge-muted">Создавайте уникальные имена для ваших NPC и персонажей.</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label>Раса</Label>
            <Select value={race} onChange={e => setRace(e.target.value)}>
              {RACES.map(r => <option key={r} value={r}>{r}</option>)}
            </Select>
          </div>
          <Button onClick={generate} disabled={loading} className="w-full">
            {loading ? "Генерируем..." : "Сгенерировать 10 имён"}
          </Button>
        </CardContent>
      </Card>

      {names.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {names.map((n, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center justify-between gap-2">
                <span className="font-semibold text-forge-parchment">{n}</span>
                <Button size="sm" variant="outline" onClick={() => saveName(n)} disabled={saving === n}>
                  {saving === n ? "..." : "В библиотеку"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}