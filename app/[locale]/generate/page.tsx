"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { DiceLoader } from "@/components/ui/dice-loader";
import { useToast } from "@/lib/hooks/useToast";
import { useTranslations } from "next-intl";

export default function GeneratePage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations("Generate");
  const { show } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState(3);
  const [partySize, setPartySize] = useState(4);
  const [focus, setFocus] = useState("balanced");
  const [noMagic, setNoMagic] = useState(false);
  const [noEvil, setNoEvil] = useState(false);

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
          party_size: partySize,
          focus,
          constraints: { no_magic: noMagic, no_evil: noEvil },
          world: "custom",
          duration: "mini_campaign",
          title: title.trim() || undefined,
        }),
      });

      if (res.status === 401) {
        router.push(`/${locale}/register?next=/${locale}/generate`);
        return;
      }
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Ошибка");
      }
      const { share_code } = await res.json();
      router.push(`/${locale}/c/${share_code}`);
    } catch (err) {
      show("error", err instanceof Error ? err.message : "Ошибка");
      setLoading(false);
    }
  }

  return (
    <main id="main-content" className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-forge-gold-light mb-2">{t("title")}</h1>
      <p className="text-forge-muted mb-8">{t("desc")}</p>

      {loading ? (
        <Card><CardContent><DiceLoader label="Генерируем..." /></CardContent></Card>
      ) : (
        <Card>
          <CardHeader><CardTitle>{t("params")}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label>{t("titleLabel")}</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Сумрачный лес" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t("level")}</Label>
                  <Input type="number" min={1} max={20} value={level} onChange={(e) => setLevel(Number(e.target.value))} />
                </div>
                <div>
                  <Label>{t("partySize")}</Label>
                  <Input type="number" min={2} max={6} value={partySize} onChange={(e) => setPartySize(Number(e.target.value))} />
                </div>
              </div>

              <div>
                <Label>Фокус кампании</Label>
                <Select value={focus} onChange={(e) => setFocus(e.target.value)}>
                  <option value="balanced">Сбалансированный</option>
                  <option value="combat">Боевой (больше сражений)</option>
                  <option value="intrigue">Интриги (политика, обман)</option>
                  <option value="exploration">Исследование (дикая природа)</option>
                  <option value="roleplay">Ролевой (больше общения)</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ограничения (No Free Text)</Label>
                <label className="flex items-center gap-2 text-sm text-forge-parchment">
                  <input type="checkbox" checked={noMagic} onChange={(e) => setNoMagic(e.target.checked)} className="accent-forge-gold" />
                  Без магии (только воины и плуты)
                </label>
                <label className="flex items-center gap-2 text-sm text-forge-parchment">
                  <input type="checkbox" checked={noEvil} onChange={(e) => setNoEvil(e.target.checked)} className="accent-forge-gold" />
                  Без злых персонажей
                </label>
              </div>

              <Button type="submit" size="lg" className="w-full">{t("generateBtn")}</Button>
            </form>
          </CardContent>
        </Card>
      )}
    </main>
  );
}