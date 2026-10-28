"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/lib/hooks/useToast";
import { CLASSIC_SITUATIONS } from "@/data/situations";

export function SituationCard({
  campaignCode,
  situation,
  canEdit,
}: {
  campaignCode: string;
  situation: string;
  canEdit: boolean;
}) {
  const router = useRouter();
  const { show } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [value, setValue] = useState(situation);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignCode}/situation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation: value }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Ошибка");
      }
      show("success", "Ситуация обновлена");
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
          <span>Ситуация</span>
          {canEdit && !editing && (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              Изменить
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="space-y-3">
            <div>
              <Label>Выбрать из готовых</Label>
              <Select
                value={value}
                onChange={(e) => setValue(e.target.value)}
              >
                {CLASSIC_SITUATIONS.map((s, i) => (
                  <option key={i} value={s}>{s}</option>
                ))}
              </Select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={saving || !value.trim()} aria-busy={saving}>
                {saving ? "Сохраняем..." : "Сохранить"}
              </Button>
              <Button variant="ghost" onClick={() => setEditing(false)} disabled={saving}>
                Отмена
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-forge-parchment">{situation}</p>
        )}
      </CardContent>
    </Card>
  );
}