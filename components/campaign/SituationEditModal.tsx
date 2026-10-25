"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/lib/hooks/useToast";
import { CLASSIC_SITUATIONS, SKYRIM_SITUATIONS } from "@/data/situations";

export function SituationEditModal({
  open,
  onClose,
  campaignCode,
  currentSituation,
  theme,
}: {
  open: boolean;
  onClose: () => void;
  campaignCode: string;
  currentSituation: string;
  theme: string;
}) {
  const router = useRouter();
  const { show } = useToast();
  const [saving, setSaving] = useState(false);
  const [situation, setSituation] = useState(currentSituation);

  const presets =
    theme === "skyrim" ? SKYRIM_SITUATIONS : CLASSIC_SITUATIONS;

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignCode}/situation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Ошибка");
      }
      show("success", "Ситуация обновлена");
      router.refresh();
      onClose();
    } catch (e) {
      show("error", e instanceof Error ? e.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Редактировать ситуацию"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={saving || !situation.trim()}>
            {saving ? "Сохраняем..." : "Сохранить"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <Label>Выбрать из готовых</Label>
          <Select
            value=""
            onChange={(e) => {
              if (e.target.value) setSituation(e.target.value);
            }}
          >
            <option value="">— выбрать —</option>
            {presets.map((s, i) => (
              <option key={i} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Свой текст</Label>
          <Textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            rows={5}
          />
        </div>
      </div>
    </Modal>
  );
}