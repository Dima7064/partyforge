"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/lib/hooks/useToast";
import type { Faction } from "@/types/generator";

const ATTITUDE_LABEL: Record<string, string> = {
  ally: "Союзник",
  enemy: "Враг",
  neutral: "Нейтрал",
};

const SKYRIM_FACTIONS_OPTIONS = [
  "Соратники", "Среброрукие", "Талмор", "Гильдия Воров",
  "Тёмное Братство", "Империя", "Братья Бури",
];

export function FactionCard({
  faction,
  factionId,
  theme,
  canEdit,
}: {
  faction: Faction;
  factionId: string;
  theme: string;
  canEdit: boolean;
}) {
  const router = useRouter();
  const { show } = useToast();
  const isSkyrim = theme === "skyrim";

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(faction.name);
  const [goals, setGoals] = useState(faction.goals);
  const [description, setDescription] = useState(faction.description);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/factions/${factionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, goals, description }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Ошибка");
      }
      show("success", "Фракция обновлена");
      setEditing(false);
      router.refresh();
    } catch (e) {
      show("error", e instanceof Error ? e.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2 flex-wrap">
          {editing ? (
            <span className="text-base text-forge-parchment">Редактирование</span>
          ) : (
            <span>{faction.name}</span>
          )}
          <div className="flex gap-2 items-center">
            <Badge
              variant={
                faction.attitude === "enemy"
                  ? "ember"
                  : faction.attitude === "ally"
                  ? "success"
                  : "muted"
              }
            >
              {ATTITUDE_LABEL[faction.attitude] ?? faction.attitude}
            </Badge>
            {canEdit && !editing && factionId && (
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                Редактировать
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {editing ? (
          <div className="space-y-3">
            {isSkyrim ? (
              <div>
                <Label>Фракция (из Скайрима)</Label>
                <Select value={name} onChange={(e) => setName(e.target.value)}>
                  {SKYRIM_FACTIONS_OPTIONS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </Select>
              </div>
            ) : (
              <div>
                <Label>Название</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            )}
            <div>
              <Label>Цели</Label>
              <Input value={goals} onChange={(e) => setGoals(e.target.value)} disabled={isSkyrim} />
              {isSkyrim && (
                <p className="text-forge-muted text-xs mt-1">Фиксировано для Скайрима.</p>
              )}
            </div>
            <div>
              <Label>Описание</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} disabled={isSkyrim} />
              {isSkyrim && (
                <p className="text-forge-muted text-xs mt-1">Фиксировано для Скайрима.</p>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={saving} aria-busy={saving}>
                {saving ? "Сохраняем..." : "Сохранить"}
              </Button>
              <Button variant="ghost" onClick={() => setEditing(false)} disabled={saving}>
                Отмена
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-forge-parchment">{faction.description}</p>
            <p className="text-xs text-forge-muted">Цель: {faction.goals}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}