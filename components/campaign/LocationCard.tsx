"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { LightboxImage } from "@/components/ui/lightbox";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ImagePickerModal } from "./ImagePickerModal";
import { useToast } from "@/lib/hooks/useToast";
import { IMAGE_DIMENSIONS } from "@/lib/images/dimensions";
import type { CharacterLocation, Location } from "@/types/generator";

const LOCATION_TYPE_LABEL: Record<string, string> = { city: "Город", temple: "Храм", forest: "Лес", ruins: "Руины", port: "Порт" };

export function LocationCard({ location, locationId, canEdit, links }: { location: Location; locationId: string; canEdit: boolean; links: CharacterLocation[]; }) {
  const router = useRouter();
  const { show } = useToast();
  const [editing, setEditing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(location.name);
  const [type, setType] = useState(location.type);
  const [description, setDescription] = useState(location.description);
  const [pools, setPools] = useState<any>(null);

  useEffect(() => {
    if (!editing || pools) return;
    fetch("/api/catalog/pools").then(r => r.json()).then(d => setPools(d));
  }, [editing, pools]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/locations/${locationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, description }),
      });
      if (!res.ok) throw new Error("Ошибка");
      show("success", "Локация обновлена");
      setEditing(false);
      router.refresh();
    } catch (e) { show("error", "Ошибка"); } finally { setSaving(false); }
  }

  async function saveToLibrary() {
    try {
      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "location",
          name: location.name,
          data: { type: location.type, description: location.description },
        }),
      });
      if (!res.ok) throw new Error("Ошибка сохранения");
      show("success", "Локация сохранена в библиотеку");
    } catch (e) {
      show("error", "Не удалось сохранить");
    }
  }

  return (
    <>
      <Card>
        <div className="relative">
          {editing ? (
            <ImageSlot src={location.image_url ?? null} width={IMAGE_DIMENSIONS.location.width} height={IMAGE_DIMENSIONS.location.height} alt={location.name} rounded="none" />
          ) : (
            <LightboxImage src={location.image_url ?? null} width={IMAGE_DIMENSIONS.location.width} height={IMAGE_DIMENSIONS.location.height} alt={location.name} rounded="none" />
          )}
          {canEdit && locationId && (
            <div className="absolute top-2 right-2 z-10 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setPickerOpen(true)}>Картинка</Button>
              {!editing && <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Изменить</Button>}
            </div>
          )}
        </div>
        <CardHeader>
          {editing ? (
            <div className="space-y-3">
              <div>
                <Label>Название</Label>
                <Select value={name} onChange={e => setName(e.target.value)}>
                  <option value={location.name}>{location.name} (текущее)</option>
                  {pools?.descriptions?.filter((d:any) => d.entity_type === "location").map((d:any, i:number) => <option key={i} value={d.text.split(".")[0]}>{d.text.split(".")[0]}</option>)}
                </Select>
              </div>
              <div>
                <Label>Тип</Label>
                <Select value={type} onChange={e => setType(e.target.value)}>
                  {Object.entries(LOCATION_TYPE_LABEL).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </Select>
              </div>
            </div>
          ) : <CardTitle>{location.name}</CardTitle>}
        </CardHeader>
        <CardContent className="space-y-2">
          {editing ? (
            <div className="space-y-3">
              <div>
                <Label>Описание</Label>
                <Select value={description} onChange={e => setDescription(e.target.value)}>
                  <option value={location.description}>{location.description} (текущее)</option>
                  {pools?.descriptions?.filter((d:any) => d.entity_type === "location").map((d:any, i:number) => <option key={i} value={d.text}>{d.text}</option>)}
                </Select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} disabled={saving}>Сохранить</Button>
                <Button variant="ghost" onClick={() => setEditing(false)}>Отмена</Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-forge-parchment">{location.description}</p>
              {canEdit && (
                <div className="flex gap-2 pt-2">
                   <Button size="sm" variant="ghost" onClick={saveToLibrary}>В библиотеку</Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      {canEdit && <ImagePickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} title="Локация" type="location" locationType={location.type} currentUrl={location.image_url ?? null} onSelect={async (id) => { await fetch(`/api/locations/${locationId}/image`, { method: "PATCH", body: JSON.stringify({ image_id: id }) }); router.refresh(); }} />}
    </>
  );
}