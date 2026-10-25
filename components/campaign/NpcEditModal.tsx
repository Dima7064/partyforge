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
import { SKYRIM_NPCS } from "@/data/skyrim";
import type { Npc } from "@/types/generator";

const NPC_ROLES = [
  { value: "ally", label: "Союзник" },
  { value: "enemy", label: "Враг" },
  { value: "neutral", label: "Нейтрал" },
];

export function NpcEditModal({
  open,
  onClose,
  npc,
  npcId,
  theme,
}: {
  open: boolean;
  onClose: () => void;
  npc: Npc;
  npcId: string;
  theme: string;
}) {
  const router = useRouter();
  const { show } = useToast();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(npc.name);
  const [role, setRole] = useState(npc.role);
  const [description, setDescription] = useState(npc.description);

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
      router.refresh();
      onClose();
    } catch (e) {
      show("error", e instanceof Error ? e.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  function handleSkyrimChange(newName: string) {
    const preset = SKYRIM_NPCS.find((n) => n.name === newName);
    if (preset) {
      setName(preset.name);
      setDescription(preset.description);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Редактировать NPC"
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
          <div>
            <Label>Имя (из Скайрима)</Label>
            <Select value={name} onChange={(e) => handleSkyrimChange(e.target.value)}>
              {SKYRIM_NPCS.map((n) => (
                <option key={n.name} value={n.name}>
                  {n.name}
                </option>
              ))}
            </Select>
          </div>
        ) : (
          <div>
            <Label htmlFor="npcName">Имя</Label>
            <Input id="npcName" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        )}

        <div>
          <Label htmlFor="npcRole">Роль</Label>
          <Select id="npcRole" value={role} onChange={(e) => setRole(e.target.value as "ally" | "enemy" | "neutral")}>
            {NPC_ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="npcDesc">Описание</Label>
          <Textarea
            id="npcDesc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={theme === "skyrim"}
            rows={4}
          />
          {theme === "skyrim" && (
            <p className="text-forge-muted text-xs mt-1">
              Описание фиксировано для Скайрима.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}