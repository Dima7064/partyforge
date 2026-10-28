"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/lib/hooks/useToast";
import { useRouter } from "next/navigation";
import { classNameRu, raceNameRu } from "@/data/localization";

export default function NpcsPage() {
  const { show } = useToast();
  const router = useRouter();
  const [npc, setNpc] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch("/api/generate/npc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setNpc(data.character);
    } finally {
      setLoading(false);
    }
  }

  async function saveToLibrary() {
    if (!npc) return;
    setSaving(true);
    try {
      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "npc",
          name: npc.name,
          data: npc,
        }),
      });
      if (res.status === 401) {
        router.push("/login?next=/npcs");
        return;
      }
      if (!res.ok) throw new Error("Ошибка сохранения");
      show("success", "NPC сохранен в библиотеку");
    } catch (e) {
      show("error", "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-forge-gold-light mb-2">Генератор NPC</h1>
        <p className="text-forge-muted">Создавайте колоритных персонажей для ваших игр.</p>
      </div>

      <Button onClick={generate} disabled={loading} className="w-full">
        {loading ? "Генерируем..." : "Сгенерировать NPC"}
      </Button>

      {npc && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{npc.name}</span>
              <Badge variant="muted">{npc.role}</Badge>
            </CardTitle>
            <p className="text-sm text-forge-muted mt-1">
              {raceNameRu(npc.race_name)} · {classNameRu(npc.class_name)}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-forge-parchment">{npc.backstory}</p>
            <div className="flex gap-2">
              <Button onClick={generate} variant="outline">Перегенерировать</Button>
              <Button onClick={saveToLibrary} disabled={saving}>В библиотеку</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}