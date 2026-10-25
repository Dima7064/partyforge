"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { LightboxImage } from "@/components/ui/lightbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ImagePickerModal } from "./ImagePickerModal";
import { useToast } from "@/lib/hooks/useToast";
import { IMAGE_DIMENSIONS } from "@/lib/images/dimensions";
import type { CharacterLocation, Location } from "@/types/generator";

const LOCATION_TYPE_LABEL: Record<string, string> = {
  city: "Город",
  temple: "Храм",
  forest: "Лес",
  ruins: "Руины",
  port: "Порт",
};
const LOCATION_TYPES = [
  { value: "city", label: "Город" },
  { value: "temple", label: "Храм" },
  { value: "forest", label: "Лес" },
  { value: "ruins", label: "Руины" },
  { value: "port", label: "Порт" },
];

const CONNECTION_LABEL: Record<string, string> = {
  born: "родился",
  lost: "потерял кого-то",
  served: "служил",
  dreams: "мечтает попасть",
};

const SKYRIM_LOCATIONS_OPTIONS = [
  "Вайтран", "Солитьюд", "Виндхельм", "Рифтен", "Маркарт",
  "Драконий предел", "Лабиринт Шалидора", "Альфтанд", "Мзулфт",
  "Храм Небесной Гавани", "Святилище Азуры", "Храм Мары",
  "Храм Девяти", "Сумрачный лес", "Тундра Вайтрана",
  "Болото Хьялмарк", "Глотка мира",
];

export function LocationCard({
  location,
  locationId,
  theme,
  canEdit,
  links,
}: {
  location: Location;
  locationId: string;
  theme: string;
  canEdit: boolean;
  links: CharacterLocation[];
}) {
  const router = useRouter();
  const { show } = useToast();
  const isSkyrim = theme === "skyrim";

  const [editing, setEditing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
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
      setEditing(false);
      router.refresh();
    } catch (e) {
      show("error", e instanceof Error ? e.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  async function changeImage(imageId: string) {
    const res = await fetch(`/api/locations/${locationId}/image`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_id: imageId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Ошибка");
    }
    show("success", "Изображение локации обновлено");
    router.refresh();
  }

  return (
    <>
      <Card>
        <div className="relative">
          {editing ? (
            <ImageSlot
              src={location.image_url ?? null}
              width={IMAGE_DIMENSIONS.location.width}
              height={IMAGE_DIMENSIONS.location.height}
              alt={location.name}
              label={`Локация · ${LOCATION_TYPE_LABEL[location.type] ?? location.type}`}
              hint={!location.image_url ? `${IMAGE_DIMENSIONS.location.width}×${IMAGE_DIMENSIONS.location.height}` : undefined}
              rounded="none"
            />
          ) : (
            <LightboxImage
              src={location.image_url ?? null}
              width={IMAGE_DIMENSIONS.location.width}
              height={IMAGE_DIMENSIONS.location.height}
              alt={location.name}
              label={`Локация · ${LOCATION_TYPE_LABEL[location.type] ?? location.type}`}
              hint={!location.image_url ? `${IMAGE_DIMENSIONS.location.width}×${IMAGE_DIMENSIONS.location.height}` : undefined}
              rounded="none"
            />
          )}
          {canEdit && locationId && (
            <div className="absolute top-2 right-2 z-10 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setPickerOpen(true)}>
                Картинка
              </Button>
              {!editing && (
                <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                  Редактировать
                </Button>
              )}
            </div>
          )}
        </div>
        <CardHeader>
          {editing ? (
            <div className="space-y-3">
              {isSkyrim ? (
                <div>
                  <Label>Локация (из Скайрима)</Label>
                  <Select value={name} onChange={(e) => setName(e.target.value)}>
                    {SKYRIM_LOCATIONS_OPTIONS.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </Select>
                </div>
              ) : (
                <>
                  <div>
                    <Label>Название</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div>
                    <Label>Тип</Label>
                    <Select value={type} onChange={(e) => setType(e.target.value)}>
                      {LOCATION_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </Select>
                  </div>
                </>
              )}
            </div>
          ) : (
            <CardTitle>{location.name}</CardTitle>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {editing ? (
            <div>
              <Label>Описание</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                disabled={isSkyrim}
              />
              {isSkyrim && (
                <p className="text-forge-muted text-xs mt-1">
                  Описание фиксировано для Скайрима.
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-forge-parchment">{location.description}</p>
          )}
          {links.length > 0 && (
            <div className="text-xs text-forge-muted">
              Связаны:{" "}
              {links
                .map(
                  (cl) =>
                    `герой #${cl.character_index + 1} (${CONNECTION_LABEL[cl.connection_type] ?? cl.connection_type})`,
                )
                .join(", ")}
            </div>
          )}
          {editing && (
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={saving} aria-busy={saving}>
                {saving ? "Сохраняем..." : "Сохранить"}
              </Button>
              <Button variant="ghost" onClick={() => setEditing(false)} disabled={saving}>
                Отмена
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {canEdit && (
        <ImagePickerModal
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          title={`Локация: ${location.name}`}
          type="location"
          locationType={location.type}
          theme={theme}
          currentUrl={location.image_url ?? null}
          onSelect={changeImage}
        />
      )}
    </>
  );
}