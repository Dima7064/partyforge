"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/lib/hooks/useToast";
import { SKYRIM_FACTIONS } from "@/data/skyrim";
import type { Faction } from "@/types/generator";

export function FactionEditModal({
  open,
  onClose,
  faction,
  factionId,
  theme,
}: {
  open: boolean;
  onClose: () => void;
  faction: Faction;
  factionId: string;
  theme: string;
}) {
  const router = useRouter();
  const { show } = useToast();
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
      router.refresh();
      onClose();
    } catch (e) {
      show("error", e instanceof Error ? e.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  function handleSkyrimChange(newName: string) {
    const preset = SKYRIM_FACTIONS.find((f) => f.name === newName);
    if (preset) {
      setName(preset.name);
      setGoals(preset.goals);
      setDescription(preset.description);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Редактировать фракцию"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={saving || !name}>
            {saving ? "Сохраняем..." : "Сохранить"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {theme === "skyrim" ? (
          <>
            <div>
              <Label>Фракция (из Скайрима)</Label>
              <Select value={name} onChange={(e) => handleSkyrimChange(e.target.value)}>
                {SKYRIM_FACTIONS.map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Цели</Label>
              <Input value={goals} disabled />
            </div>
            <div>
              <Label>Описание</Label>
              <Textarea value={description} disabled rows={4} />
              <p className="text-forge-muted text-xs mt-1">
                Описание фиксировано для Скайрима.
              </p>
            </div>
          </>
        ) : (
          <>
            <div>
              <Label htmlFor="factName">Название</Label>
              <Input id="factName" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="factGoals">Цели</Label>
              <Input id="factGoals" value={goals} onChange={(e) => setGoals(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="factDesc">Описание</Label>
              <Textarea id="factDesc" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}