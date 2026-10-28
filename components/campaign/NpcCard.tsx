"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ImagePickerModal } from "./ImagePickerModal";
import { useToast } from "@/lib/hooks/useToast";
import { IMAGE_DIMENSIONS } from "@/lib/images/dimensions";
import type { Npc } from "@/types/generator";

const ROLE_LABEL: Record<string, string> = {
  ally: "Союзник",
  enemy: "Враг",
  neutral: "Нейтрал",
};

const NPC_ROLES = [
  { value: "ally", label: "Союзник" },
  { value: "enemy", label: "Враг" },
  { value: "neutral", label: "Нейтрал" },
];

export function NpcCard({
  npc,
  npcId,
  canEdit,
}: {
  npc: Npc;
  npcId: string;
  canEdit: boolean;
}) {
  const router = useRouter();
  const { show } = useToast();
  const [editing, setEditing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(npc.name);
  const [role, setRole] = useState(npc.role);
  const [description, setDescription] = useState(npc.description);
  
  const [pools, setPools] = useState<any>(null);

  useEffect(() => {
    if (!editing || pools) return;
    fetch("/api/catalog/pools").then(r => r.json()).then(d => setPools(d));
  }, [editing, pools]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/npcs/${npcId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, description }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Ошибка");
      }
      show("success", "NPC обновлён");
      setEditing(false);
      router.refresh();
    } catch (e) {
      show("error", e instanceof Error ? e.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  async function changeImage(imageId: string) {
    const res = await fetch(`/api/npcs/${npcId}/image`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_id: imageId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Ошибка");
    }
    show("success", "Портрет NPC обновлён");
    router.refresh();
  }

  return (
    <>
      <Card>
        <div className="flex gap-3 p-4">
          <div className="w-16 md:w-20 shrink-0">
            <ImageSlot
              src={npc.image_url ?? null}
              width={IMAGE_DIMENSIONS.npc.width}
              height={IMAGE_DIMENSIONS.npc.height}
              alt={`NPC: ${npc.name}`}
              label="NPC"
              rounded="full"
            />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              {editing ? (
                <span className="text-base text-forge-parchment font-semibold">
                  Редактирование NPC
                </span>
              ) : (
                <CardTitle className="text-base">{npc.name}</CardTitle>
              )}
              <Badge
                variant={
                  npc.role === "enemy"
                    ? "ember"
                    : npc.role === "ally"
                    ? "success"
                    : "muted"
                }
              >
                {ROLE_LABEL[npc.role] ?? npc.role}
              </Badge>
            </div>
            {editing ? (
              <div className="space-y-3">
                <div>
                  <Label>Имя</Label>
                  <Select value={name} onChange={(e) => setName(e.target.value)}>
                    <option value={npc.name}>{npc.name} (текущее)</option>
                    {pools?.names?.filter((n:any) => n.race_name === "Human").map((n:any) => (
                      <option key={n.id} value={n.name}>{n.name}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Роль</Label>
                  <Select value={role} onChange={(e) => setRole(e.target.value as "ally" | "enemy" | "neutral")}>
                    {NPC_ROLES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Описание</Label>
                  <Select value={description} onChange={(e) => setDescription(e.target.value)}>
                    <option value={npc.description}>{npc.description} (текущее)</option>
                    {pools?.descriptions?.filter((d:any) => d.entity_type === "npc").map((d:any, i:number) => (
                      <option key={i} value={d.text}>{d.text}</option>
                    ))}
                  </Select>
                </div>
                <div className="flex gap-2 flex-wrap pt-1">
                  <Button size="sm" variant="outline" onClick={() => setPickerOpen(true)}>
                    Сменить картинку
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={saving} aria-busy={saving}>
                    {saving ? "Сохраняем..." : "Сохранить"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(false)} disabled={saving}>
                    Отмена
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-forge-parchment">{npc.description}</p>
                {canEdit && npcId && (
                  <div className="flex gap-2 mt-1">
                    <Button size="sm" variant="ghost" onClick={() => setPickerOpen(true)}>
                      Картинка
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
                      Изменить
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Card>
      {canEdit && (
        <ImagePickerModal
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          title={`Портрет NPC: ${npc.name}`}
          type="npc"
          currentUrl={npc.image_url ?? null}
          onSelect={changeImage}
        />
      )}
    </>
  );
}