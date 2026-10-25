"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/lib/hooks/useToast";
import { shouldShowAchievement } from "@/lib/achievements-client";
import type { Character } from "@/types/generator";

interface Options {
  classes: { name: string; name_ru: string }[];
  races: { name: string; name_ru: string }[];
  backgrounds: { name: string; name_ru: string }[];
}

const ABILITY_KEYS = ["str", "dex", "con", "int", "wis", "cha"] as const;
const ABILITY_LABEL: Record<string, string> = {
  str: "Сила",
  dex: "Ловкость",
  con: "Телосложение",
  int: "Интеллект",
  wis: "Мудрость",
  cha: "Харизма",
};

export function CharacterEditModal({
  open,
  onClose,
  character,
  characterId,
}: {
  open: boolean;
  onClose: () => void;
  character: Character;
  characterId: string;
}) {
  const router = useRouter();
  const { show, showAchievement } = useToast();
  const [options, setOptions] = useState<Options | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(character.name);
  const [className, setClassName] = useState(character.class_name);
  const [raceName, setRaceName] = useState(character.race_name);
  const [backgroundName, setBackgroundName] = useState(character.background_name);
  const [abilities, setAbilities] = useState({ ...character.abilities });
  const [values, setValues] = useState(character.personality.values.join(", "));
  const [fears, setFears] = useState(character.personality.fears.join(", "));
  const [habits, setHabits] = useState(character.personality.habits.join(", "));
  const [motivation, setMotivation] = useState(character.personality.motivation);
  const [backstory, setBackstory] = useState(character.backstory);

  useEffect(() => {
    if (!open || options) return;
    fetch("/api/catalog/options")
      .then((r) => r.json())
      .then((d) => setOptions(d.data))
      .catch(() => show("error", "Не удалось загрузить список классов/рас"));
  }, [open, options, show]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/characters/${characterId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          class_name: className,
          race_name: raceName,
          background_name: backgroundName,
          abilities,
          personality: {
            values: values.split(",").map((s) => s.trim()).filter(Boolean),
            fears: fears.split(",").map((s) => s.trim()).filter(Boolean),
            habits: habits.split(",").map((s) => s.trim()).filter(Boolean),
            motivation,
          },
          backstory,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Ошибка");
      }

      if (shouldShowAchievement("character_editor")) {
        showAchievement(
          "Кузнец судеб",
          "Отредактируй персонажа вручную",
          "⚒️",
        );
      } else {
        show("success", "Персонаж обновлён");
      }

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
      title="Редактировать персонажа"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={saving || !options} aria-busy={saving}>
            {saving ? "Сохраняем..." : "Сохранить"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Имя</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="class">Класс</Label>
            <Select id="class" value={className} onChange={(e) => setClassName(e.target.value)}>
              {options?.classes.map((c) => (
                <option key={c.name} value={c.name}>{c.name_ru}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="race">Раса</Label>
            <Select id="race" value={raceName} onChange={(e) => setRaceName(e.target.value)}>
              {options?.races.map((r) => (
                <option key={r.name} value={r.name}>{r.name_ru}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="bg">Предыстория</Label>
            <Select id="bg" value={backgroundName} onChange={(e) => setBackgroundName(e.target.value)}>
              {options?.backgrounds.map((b) => (
                <option key={b.name} value={b.name}>{b.name_ru}</option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <Label>Характеристики</Label>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-1">
            {ABILITY_KEYS.map((k) => (
              <div key={k}>
                <div className="text-xs text-forge-muted text-center mb-1">
                  {ABILITY_LABEL[k]}
                </div>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  aria-label={ABILITY_LABEL[k]}
                  value={abilities[k]}
                  onChange={(e) =>
                    setAbilities({ ...abilities, [k]: Number(e.target.value) })
                  }
                  className="text-center"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="values">Ценности (через запятую)</Label>
          <Input id="values" value={values} onChange={(e) => setValues(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="fears">Страхи (через запятую)</Label>
          <Input id="fears" value={fears} onChange={(e) => setFears(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="habits">Привычки (через запятую)</Label>
          <Input id="habits" value={habits} onChange={(e) => setHabits(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="motivation">Мотивация</Label>
          <Input id="motivation" value={motivation} onChange={(e) => setMotivation(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="backstory">Предыстория</Label>
          <Textarea id="backstory" rows={5} value={backstory} onChange={(e) => setBackstory(e.target.value)} />
        </div>
      </div>
    </Modal>
  );
}