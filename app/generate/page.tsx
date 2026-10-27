"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { DiceLoader } from "@/components/ui/dice-loader";
import { useToast } from "@/lib/hooks/useToast";
import { shouldShowAchievement } from "@/lib/achievements-client";
import type { Theme } from "@/types/generator";

export default function GeneratePage() {
  const router = useRouter();
  const { show, showAchievement } = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState(3);
  const [partySize, setPartySize] = useState(4);
  const [theme, setTheme] = useState<Theme>("classic");
  const [duration, setDuration] = useState("mini_campaign");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: "dnd5e",
          level,
          tone: "dark_fantasy",
          theme,
          party_size: partySize,
          world: "custom",
          constraints: {},
          duration,
          title: title.trim() || undefined,
        }),
      });

      if (res.status === 401) {
        router.push("/register?next=/generate");
        return;
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Ошибка");
      }

      const { share_code } = await res.json();

      if (shouldShowAchievement("first_campaign")) {
        showAchievement(
          "Первая кампания",
          "Создай свою первую кампанию как мастер",
          "🎲",
        );
        setTimeout(() => router.push(`/c/${share_code}`), 900);
      } else {
        show("success", "Кампания создана", "Открываем...");
        router.push(`/c/${share_code}`);
      }
    } catch (err) {
      show("error", err instanceof Error ? err.message : "Ошибка генерации");
      setLoading(false);
    }
  }

  return (
    <main id="main-content" className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-forge-gold-light mb-2">
        Создать кампанию
      </h1>
      <p className="text-forge-muted mb-8">
        Тёмное фэнтези. Выбери тему, уровень и размер группы.
      </p>

      {loading ? (
        <Card>
          <CardContent>
            <DiceLoader label="Собираем партию, генерируем мир..." />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Параметры</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="title">Название (опционально)</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Сумрачный лес"
                />
              </div>

              <div>
                <Label htmlFor="theme">Тема</Label>
                <Select
                  id="theme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as Theme)}
                >
                  <option value="classic">Классика D&amp;D</option>
                  <option value="skyrim">Скайрим</option>
                </Select>
              </div>

              <div>
                <Label htmlFor="level">Уровень</Label>
                <Input
                  id="level"
                  type="number"
                  min={1}
                  max={20}
                  value={level}
                  onChange={(e) => setLevel(Number(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="partySize">
                  Размер группы (включая мастера)
                </Label>
                <Input
                  id="partySize"
                  type="number"
                  min={2}
                  max={6}
                  value={partySize}
                  onChange={(e) => setPartySize(Number(e.target.value))}
                />
                <p className="text-forge-muted text-xs mt-1">
                  Например, 4 — это 1 мастер и 3 игрока.
                </p>
              </div>

              <div>
                <Label htmlFor="duration">Длительность</Label>
                <Select
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                >
                  <option value="one_shot">Ваншот</option>
                  <option value="mini_campaign">Мини-кампания</option>
                  <option value="long_campaign">Долгая кампания</option>
                </Select>
              </div>

              <Button type="submit" size="lg" className="w-full">
                Сгенерировать
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </main>
  );
}