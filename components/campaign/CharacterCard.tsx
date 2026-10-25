"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Character, Hook, Relationship } from "@/types/generator";
import { backgroundNameRu, classNameRu, raceNameRu } from "@/data/localization";
import { CharacterNotes } from "./CharacterNotes";
import { ImagePickerModal } from "./ImagePickerModal";
import { IMAGE_DIMENSIONS } from "@/lib/images/dimensions";
import { useToast } from "@/lib/hooks/useToast";
import { shouldShowAchievement } from "@/lib/achievements-client";

const ROLE_LABEL: Record<string, string> = {
  tank: "Танк",
  healer: "Хилер",
  dps: "DPS",
  face: "Лицо партии",
  control: "Контроль",
  support: "Поддержка",
};

const ABILITY_KEYS = ["str", "dex", "con", "int", "wis", "cha"] as const;
const ABILITY_LABEL_SHORT: Record<string, string> = {
  str: "СИЛ",
  dex: "ЛОВ",
  con: "ТЕЛ",
  int: "ИНТ",
  wis: "МДР",
  cha: "ХАР",
};
const ABILITY_LABEL_FULL: Record<string, string> = {
  str: "Сила",
  dex: "Ловкость",
  con: "Телосложение",
  int: "Интеллект",
  wis: "Мудрость",
  cha: "Харизма",
};

const REL_LABEL: Record<string, string> = {
  trust: "Доверие",
  debt: "Долг",
  love: "Любовь",
  conflict: "Конфликт",
  secret: "Тайна",
};

interface Options {
  classes: { name: string; name_ru: string }[];
  races: { name: string; name_ru: string }[];
  backgrounds: { name: string; name_ru: string }[];
}

export function CharacterCard({
  character,
  characterIndex,
  campaignTheme,
  characters,
  relationships,
  hooks,
  canEdit,
  canSeeNotes,
  canChangeImage,
  initialNote,
}: {
  character: Character;
  characterIndex: number;
  campaignCode?: string;
  campaignTheme: string;
  characters: Character[];
  relationships: Relationship[];
  hooks: Hook[];
  canEdit: boolean;
  canSeeNotes: boolean;
  canChangeImage: boolean;
  initialNote: string;
}) {
  const router = useRouter();
  const { show, showAchievement } = useToast();

  const [editing, setEditing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [options, setOptions] = useState<Options | null>(null);
  const [saving, setSaving] = useState(false);

  // Поля редактирования
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
    if (!editing || options) return;
    fetch("/api/catalog/options")
      .then((r) => r.json())
      .then((d) => setOptions(d.data))
      .catch(() => show("error", "Не удалось загрузить список классов/рас"));
  }, [editing, options, show]);

  // Сброс при выходе из режима редактирования
  useEffect(() => {
    if (editing) return;
    setName(character.name);
    setClassName(character.class_name);
    setRaceName(character.race_name);
    setBackgroundName(character.background_name);
    setAbilities({ ...character.abilities });
    setValues(character.personality.values.join(", "));
    setFears(character.personality.fears.join(", "));
    setHabits(character.personality.habits.join(", "));
    setMotivation(character.personality.motivation);
    setBackstory(character.backstory);
  }, [character, editing]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/characters/${character.id}`, {
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
        showAchievement("Кузнец судеб", "Отредактируй персонажа вручную", "⚒️");
      } else {
        show("success", "Персонаж обновлён");
      }
      setEditing(false);
      router.refresh();
    } catch (e) {
      show("error", e instanceof Error ? e.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  async function handleSelectPortrait(imageId: string) {
    if (!character.id) return;
    const res = await fetch(`/api/characters/${character.id}/image`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_id: imageId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Ошибка");
    }
    show("success", "Портрет обновлён");
    router.refresh();
  }

  const myRelationships = relationships.filter(
    (r) =>
      r.source_character_index === characterIndex ||
      r.target_character_index === characterIndex,
  );
  const myHooks = hooks.filter((h) => h.character_index === characterIndex);
  const portraitSize = IMAGE_DIMENSIONS.portrait;

  return (
    <>
      <motion.div whileHover={editing ? undefined : { y: -2 }} transition={{ duration: 0.2 }}>
        <Card>
          <CardHeader>
            <div className="flex gap-4 items-start">
              <div className="w-20 md:w-24 shrink-0 space-y-1">
                <ImageSlot
                  src={character.image_url ?? null}
                  width={portraitSize.width}
                  height={portraitSize.height}
                  alt={`Портрет: ${character.name}`}
                  label="Портрет"
                  hint={
                    !character.image_url
                      ? `${character.race_name} · ${portraitSize.width}×${portraitSize.height}`
                      : undefined
                  }
                  rounded="md"
                />
                {canChangeImage && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full text-xs"
                    onClick={() => setPickerOpen(true)}
                  >
                    Сменить
                  </Button>
                )}
              </div>
              <div className="flex-1 min-w-0">
                {editing ? (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor={`char-name-${character.id}`}>Имя</Label>
                      <Input
                        id={`char-name-${character.id}`}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label>Класс</Label>
                        <Select value={className} onChange={(e) => setClassName(e.target.value)}>
                          {options?.classes.map((c) => (
                            <option key={c.name} value={c.name}>{c.name_ru}</option>
                          ))}
                        </Select>
                      </div>
                      <div>
                        <Label>Раса</Label>
                        <Select value={raceName} onChange={(e) => setRaceName(e.target.value)}>
                          {options?.races.map((r) => (
                            <option key={r.name} value={r.name}>{r.name_ru}</option>
                          ))}
                        </Select>
                      </div>
                      <div>
                        <Label>Предыстория</Label>
                        <Select value={backgroundName} onChange={(e) => setBackgroundName(e.target.value)}>
                          {options?.backgrounds.map((b) => (
                            <option key={b.name} value={b.name}>{b.name_ru}</option>
                          ))}
                        </Select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <CardTitle className="flex items-center justify-between gap-2 flex-wrap">
                      <span>{character.name}</span>
                      <Badge variant="muted">
                        {ROLE_LABEL[character.role] ?? character.role}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-forge-muted mt-1">
                      {raceNameRu(character.race_name)} · {classNameRu(character.class_name)} ·{" "}
                      {backgroundNameRu(character.background_name)} · Ур. {character.level}
                    </p>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Характеристики */}
            {editing ? (
              <div>
                <Label>Характеристики</Label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-1">
                  {ABILITY_KEYS.map((k) => (
                    <div key={k}>
                      <div className="text-xs text-forge-muted text-center mb-1">
                        {ABILITY_LABEL_FULL[k]}
                      </div>
                      <Input
                        type="number"
                        min={1}
                        max={30}
                        aria-label={ABILITY_LABEL_FULL[k]}
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
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
                {Object.entries(character.abilities).map(([key, value]) => (
                  <div
                    key={key}
                    className="bg-forge-bg border border-forge-border rounded p-1.5 text-center"
                  >
                    <div className="text-[10px] text-forge-muted">
                      {ABILITY_LABEL_SHORT[key] ?? key}
                    </div>
                    <div className="text-lg font-bold text-forge-gold-light">{value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Характер */}
            {editing ? (
              <>
                <div>
                  <Label>Ценности (через запятую)</Label>
                  <Input value={values} onChange={(e) => setValues(e.target.value)} />
                </div>
                <div>
                  <Label>Страхи (через запятую)</Label>
                  <Input value={fears} onChange={(e) => setFears(e.target.value)} />
                </div>
                <div>
                  <Label>Привычки (через запятую)</Label>
                  <Input value={habits} onChange={(e) => setHabits(e.target.value)} />
                </div>
                <div>
                  <Label>Мотивация</Label>
                  <Input value={motivation} onChange={(e) => setMotivation(e.target.value)} />
                </div>
                <div>
                  <Label>Предыстория</Label>
                  <Textarea
                    rows={5}
                    value={backstory}
                    onChange={(e) => setBackstory(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <div className="text-xs text-forge-muted uppercase tracking-wide mb-1">
                    Ценности
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {character.personality.values.map((v) => (
                      <Badge key={v} variant="gold">{v}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-forge-muted uppercase tracking-wide mb-1">
                    Страхи
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {character.personality.fears.map((f) => (
                      <Badge key={f} variant="ember">{f}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-forge-muted uppercase tracking-wide mb-1">
                    Привычки
                  </div>
                  <p className="text-sm text-forge-parchment">
                    {character.personality.habits.join(", ")}
                  </p>
                </div>
                <div>
                  <div className="text-xs text-forge-muted uppercase tracking-wide mb-1">
                    Мотивация
                  </div>
                  <p className="text-sm text-forge-parchment">
                    {character.personality.motivation}
                  </p>
                </div>
                {character.backstory && (
                  <div>
                    <div className="text-xs text-forge-muted uppercase tracking-wide mb-1">
                      Предыстория
                    </div>
                    <p className="text-sm text-forge-parchment leading-relaxed">
                      {character.backstory}
                    </p>
                  </div>
                )}
                {character.secret_text && (
                  <div>
                    <div className="text-xs text-forge-muted uppercase tracking-wide mb-1">
                      Тайна (только для мастера)
                    </div>
                    <p className="text-sm text-forge-ember italic">
                      {character.secret_text}
                    </p>
                  </div>
                )}
                {myRelationships.length > 0 && (
                  <div>
                    <div className="text-xs text-forge-muted uppercase tracking-wide mb-1">
                      Связи
                    </div>
                    <ul className="text-sm text-forge-parchment space-y-1">
                      {myRelationships.map((r, i) => {
                        const otherIdx =
                          r.source_character_index === characterIndex
                            ? r.target_character_index
                            : r.source_character_index;
                        const other = characters[otherIdx];
                        return (
                          <li key={i}>
                            <span className="text-forge-gold">
                              {REL_LABEL[r.type] ?? r.type}
                            </span>{" "}
                            с {other?.name ?? `#${otherIdx}`}: {r.description}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
                {myHooks.length > 0 && (
                  <div>
                    <div className="text-xs text-forge-muted uppercase tracking-wide mb-1">
                      Крючки
                    </div>
                    <ul className="text-sm text-forge-parchment space-y-1">
                      {myHooks.map((h, i) => (
                        <li key={i}>{h.description}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {canSeeNotes && (
                  <CharacterNotes
                    characterId={character.id ?? ""}
                    initialContent={initialNote}
                  />
                )}
              </>
            )}

            {/* Кнопки */}
            {canEdit && (
              <div className="pt-2 flex gap-2 flex-wrap">
                {editing ? (
                  <>
                    <Button onClick={handleSave} disabled={saving} aria-busy={saving}>
                      {saving ? "Сохраняем..." : "Сохранить"}
                    </Button>
                    <Button variant="ghost" onClick={() => setEditing(false)} disabled={saving}>
                      Отмена
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                    Редактировать
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {canChangeImage && (
        <ImagePickerModal
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          title={`Портрет: ${character.name}`}
          type="portrait"
          raceName={character.race_name}
          theme={campaignTheme}
          currentUrl={character.image_url ?? null}
          onSelect={handleSelectPortrait}
        />
      )}
    </>
  );
}