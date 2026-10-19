"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { classNameRu } from "@/data/localization";

interface CharOption {
  index: number;
  name: string;
  className: string;
  taken: boolean;
}

export function JoinForm({
  code,
  characters,
}: {
  code: string;
  characters: CharOption[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin() {
    if (selected === null) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/campaigns/${code}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ character_index: selected }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Ошибка");
      }
      router.push(`/c/${code}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
      setLoading(false);
    }
  }

  const free = characters.filter((c) => !c.taken);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Выбери своего персонажа</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {free.length === 0 ? (
          <p className="text-forge-ember text-sm">Все персонажи уже заняты.</p>
        ) : (
          free.map((c) => (
            <button
              type="button"
              key={c.index}
              onClick={() => setSelected(c.index)}
              className={`w-full text-left p-3 rounded border transition-colors ${
                selected === c.index
                  ? "border-forge-gold bg-forge-gold/10"
                  : "border-forge-border bg-forge-bg hover:border-forge-gold/50"
              }`}
            >
              <p className="text-forge-parchment font-semibold">{c.name}</p>
              <p className="text-forge-muted text-xs">
                {classNameRu(c.className)}
              </p>
            </button>
          ))
        )}
        {error && <p className="text-forge-ember text-sm">{error}</p>}
        <Button
          onClick={handleJoin}
          disabled={selected === null || loading}
          className="w-full"
        >
          {loading ? "Присоединяемся..." : "Присоединиться"}
        </Button>
      </CardContent>
    </Card>
  );
}