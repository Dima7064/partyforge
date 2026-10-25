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
import { SKYRIM_LOCATIONS } from "@/data/skyrim";
import type { Location } from "@/types/generator";

const LOCATION_TYPES = [
  { value: "city", label: "Город" },
  { value: "temple", label: "Храм" },
  { value: "forest", label: "Лес" },
  { value: "ruins", label: "Руины" },
  { value: "port", label: "Порт" },
];

export function LocationEditModal({
  open,
  onClose,
  location,
  locationId,
  theme,
}: {
  open: boolean;
  onClose: () => void;
  location: Location;
  locationId: string;
  theme: string;
}) {
  const router = useRouter();
  const { show } = useToast();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(location.name);
  const [type, setType] = useState(location.type);
  const [description, setDescription] = useState(location.description);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/locations/${locationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, description }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Ошибка");
      }
      show("success", "Локация обновлена");
      router.refresh();
      onClose();
    } catch (e) {
      show("error", e instanceof Error ? e.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  function handleSkyrimChange(newName: string) {
    const preset = SKYRIM_LOCATIONS.find((l) => l.name === newName);
    if (preset) {
      setName(preset.name);
      setType(preset.type);
      setDescription(preset.description);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Редактировать локацию"
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
              <Label>Локация (из Скайрима)</Label>
              <Select value={name} onChange={(e) => handleSkyrimChange(e.target.value)}>
                {SKYRIM_LOCATIONS.map((l) => (
                  <option key={l.name} value={l.name}>
                    {l.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Тип</Label>
              <Input value={type} disabled />
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
              <Label htmlFor="locName">Название</Label>
              <Input id="locName" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="locType">Тип</Label>
              <Select id="locType" value={type} onChange={(e) => setType(e.target.value)}>
                {LOCATION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="locDesc">Описание</Label>
              <Textarea id="locDesc" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}