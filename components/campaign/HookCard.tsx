"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/lib/hooks/useToast";
import type {
  Character,
  Faction,
  Hook,
  HookType,
  Location,
  Npc,
} from "@/types/generator";

const TYPE_LABEL: Record<string, string> = {
  personal: "Личный",
  social: "Социальный",
  exploration: "Исследование",
  combat: "Бой",
};

interface Template {
  id: string;
  template: string;
  type: string;
  tags: string[];
}

export function HookCard({
  hook,
  hookId,
  character,
  factions,
  npcs,
  locations,
  canEdit,
}: {
  hook: Hook;
  hookId: string;
  character?: Character;
  factions: Faction[];
  npcs: Npc[];
  locations: Location[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const { show } = useToast();

  const [editing, setEditing] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [type, setType] = useState<HookType>(hook.type);
  const [templateId, setTemplateId] = useState(hook.template_id ?? "");
  const [templateStr, setTemplateStr] = useState("");
  const [metadata, setMetadata] = useState<Record<string, string>>(
    hook.metadata ?? {},
  );

  useEffect(() => {
    if (!editing) return;
    if (templates.length > 0) return;
    setLoading(true);
    fetch("/api/catalog/hook-templates")
      .then((r) => r.json())
      .then((d) => setTemplates(d.data ?? []))
      .catch(() => show("error", "Не удалось загрузить шаблоны"))
      .finally(() => setLoading(false));
  }, [editing, templates.length, show]);

  useEffect(() => {
    if (!templateId || templates.length === 0) return;
    const t = templates.find((x) => x.id === templateId);
    if (t) setTemplateStr(t.template);
  }, [templateId, templates]);

  const filteredTemplates = useMemo(
    () => templates.filter((t) => t.type === type),
    [templates, type],
  );

  const placeholders = useMemo(() => {
    const matches = templateStr.match(/\{(\w+)\}/g) ?? [];
    return [...new Set(matches.map((m) => m.slice(1, -1)))];
  }, [templateStr]);

  const preview = useMemo(() => {
    let text = templateStr;
    if (character) text = text.replace(/\{character\}/g, character.name);
    for (const [key, val] of Object.entries(metadata)) {
      if (key === "character") continue;
      text = text.replace(new RegExp(`\\{${key}\\}`, "g"), val);
    }
    return text;
  }, [templateStr, metadata, character]);

  function handleSelectTemplate(id: string) {
    setTemplateId(id);
    const t = templates.find((x) => x.id === id);
    if (!t) return;
    const matches = t.template.match(/\{(\w+)\}/g) ?? [];
    const keys = [...new Set(matches.map((m) => m.slice(1, -1)))];
    const newMeta: Record<string, string> = { ...metadata };
    for (const k of keys) {
      if (k === "character") continue;
      if (newMeta[k]) continue;
      if (k === "npc" && npcs[0]) newMeta[k] = npcs[0].name;
      else if (k === "faction" && factions[0]) newMeta[k] = factions[0].name;
      else if (k === "location" && locations[0]) newMeta[k] = locations[0].name;
    }
    setMetadata(newMeta);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/hooks/${hookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          description: preview,
          template_id: templateId || null,
          metadata,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Ошибка");
      }
      show("success", "Крючок обновлён");
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
          <span>{hook.title}</span>
          <Badge variant="muted">{TYPE_LABEL[hook.type] ?? hook.type}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {editing ? (
          <div className="space-y-3">
            <div>
              <Label>Тип</Label>
              <Select
                value={type}
                onChange={(e) => {
                  setType(e.target.value as HookType);
                  setTemplateId("");
                  setTemplateStr("");
                  setMetadata({ character: metadata.character });
                }}
              >
                {Object.entries(TYPE_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label>Шаблон</Label>
              <Select
                value={templateId}
                onChange={(e) => handleSelectTemplate(e.target.value)}
                disabled={loading}
              >
                <option value="">— свой текст —</option>
                {filteredTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.template}
                  </option>
                ))}
              </Select>
            </div>

            {placeholders.map((key) => {
              if (key === "character") return null;
              const options =
                key === "npc"
                  ? npcs.map((n) => n.name)
                  : key === "faction"
                    ? factions.map((f) => f.name)
                    : key === "location"
                      ? locations.map((l) => l.name)
                      : [];
              const label =
                key === "npc"
                  ? "NPC"
                  : key === "faction"
                    ? "Фракция"
                    : key === "location"
                      ? "Локация"
                      : key;
              return (
                <div key={key}>
                  <Label>{label}</Label>
                  <Select
                    value={metadata[key] ?? ""}
                    onChange={(e) =>
                      setMetadata({ ...metadata, [key]: e.target.value })
                    }
                  >
                    <option value="">— выбери —</option>
                    {options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </Select>
                </div>
              );
            })}

            <div>
              <Label>Итоговый текст</Label>
              <div className="bg-forge-bg border border-forge-border rounded p-3 text-sm text-forge-parchment">
                {preview || "—"}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSave}
                disabled={saving || !templateStr}
                aria-busy={saving}
              >
                {saving ? "Сохраняем..." : "Сохранить"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                Отмена
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-forge-parchment leading-relaxed">
              {hook.description}
            </p>
            {canEdit && hookId && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditing(true)}
              >
                Редактировать
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}