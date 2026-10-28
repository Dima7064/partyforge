"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { Character, Hook, Relationship } from "@/types/generator";
import { backgroundNameRu, classNameRu, raceNameRu } from "@/data/localization";
import { CharacterNotes } from "./CharacterNotes";
import { ImagePickerModal } from "./ImagePickerModal";
import { IMAGE_DIMENSIONS } from "@/lib/images/dimensions";
import { useToast } from "@/lib/hooks/useToast";

const ROLE_LABEL: Record<string, string> = { tank: "Танк", healer: "Хилер", dps: "DPS", face: "Лицо партии", control: "Контроль", support: "Поддержка" };
const ABILITY_KEYS = ["str", "dex", "con", "int", "wis", "cha"] as const;
const ABILITY_LABEL_SHORT: Record<string, string> = { str: "СИЛ", dex: "ЛОВ", con: "ТЕЛ", int: "ИНТ", wis: "МДР", cha: "ХАР" };
const REL_LABEL: Record<string, string> = { trust: "Доверие", debt: "Долг", love: "Любовь", conflict: "Конфликт", secret: "Тайна" };

const ABILITY_PRESETS = [
  { id: "combat", label: "Боевой фокус", stats: { str: 15, dex: 14, con: 13, int: 8, wis: 10, cha: 10 } },
  { id: "balanced", label: "Сбалансированный", stats: { str: 12, dex: 12, con: 12, int: 12, wis: 12, cha: 12 } },
  { id: "magic", label: "Магический фокус", stats: { str: 8, dex: 10, con: 12, int: 15, wis: 14, cha: 13 } },
];

export function CharacterCard({
  character, characterIndex, characters, relationships, hooks, canEdit, canSeeNotes, canChangeImage, initialNote,
}: {
  character: Character; characterIndex: number; campaignCode?: string; characters: Character[]; relationships: Relationship[]; hooks: Hook[]; canEdit: boolean; canSeeNotes: boolean; canChangeImage: boolean; initialNote: string;
}) {
  const router = useRouter();
  const { show } = useToast();
  const [editing, setEditing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [pools, setPools] = useState<any>(null);

  const [name, setName] = useState(character.name);
  const [className, setClassName] = useState(character.class_name);
  const [raceName, setRaceName] = useState(character.race_name);
  const [backgroundName, setBackgroundName] = useState(character.background_name);
  const [abilitiesPreset, setAbilitiesPreset] = useState("combat");
  const [values, setValues] = useState<string[]>(character.personality.values);
  const [fears, setFears] = useState<string[]>(character.personality.fears);
  const [habits, setHabits] = useState<string[]>(character.personality.habits);
  const [motivation, setMotivation] = useState(character.personality.motivation);
  const [backstory, setBackstory] = useState(character.backstory);

  useEffect(() => {
    if (!editing || pools) return;
    fetch("/api/catalog/pools").then(r => r.json()).then(d => setPools(d)).catch(() => show("error", "Ошибка загрузки пулов"));
  }, [editing, pools, show]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/characters/${character.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, class_name: className, race_name: raceName, background_name: backgroundName,
          abilities: ABILITY_PRESETS.find(p => p.id === abilitiesPreset)?.stats,
          personality: { values, fears, habits, motivation },
          backstory,
        }),
      });
      if (!res.ok) throw new Error("Ошибка");
      show("success", "Персонаж обновлён (No Free Text)");
      setEditing(false);
      router.refresh();
    } catch (e) {
      show("error", "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  }

  async function saveToLibrary() {
    try {
      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "npc",
          name: character.name,
          data: character,
        }),
      });
      if (!res.ok) throw new Error("Ошибка сохранения");
      show("success", "Персонаж сохранён в библиотеку");
    } catch (e) {
      show("error", "Не удалось сохранить");
    }
  }

  const portraitSize = IMAGE_DIMENSIONS.portrait;

  return (
    <>
      <motion.div whileHover={editing ? undefined : { y: -2 }}>
        <Card>
          <CardHeader>
            <div className="flex gap-4 items-start">
              <div className="w-20 md:w-24 shrink-0 space-y-1">
                <ImageSlot src={character.image_url ?? null} width={portraitSize.width} height={portraitSize.height} alt={`Портрет: ${character.name}`} label="Портрет" rounded="md" />
                {canChangeImage && <Button size="sm" variant="ghost" className="w-full text-xs" onClick={() => setPickerOpen(true)}>Сменить</Button>}
              </div>
              <div className="flex-1 min-w-0">
                {editing ? (
                  <div className="space-y-3">
                    <div>
                      <Label>Имя (из пула)</Label>
                      <Select value={name} onChange={e => setName(e.target.value)}>
                        {pools?.names?.filter((n:any) => n.race_name === raceName).map((n:any) => <option key={n.id} value={n.name}>{n.name}</option>)}
                        <option value={character.name}>{character.name} (текущее)</option>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <>
                    <CardTitle className="flex items-center justify-between gap-2 flex-wrap">
                      <span>{character.name}</span>
                      <Badge variant="muted">{ROLE_LABEL[character.role] ?? character.role}</Badge>
                    </CardTitle>
                    <p className="text-sm text-forge-muted mt-1">
                      {raceNameRu(character.race_name)} · {classNameRu(character.class_name)} · {backgroundNameRu(character.background_name)} · Ур. {character.level}
                    </p>
                  </>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {editing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label>Класс</Label>
                    <Select value={className} onChange={e => setClassName(e.target.value)}>
                      {["Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk", "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"].map(c => <option key={c} value={c}>{classNameRu(c)}</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label>Раса</Label>
                    <Select value={raceName} onChange={e => setRaceName(e.target.value)}>
                      {["Human", "Elf", "Dwarf", "Halfling", "Dragonborn", "Gnome", "Half-Elf", "Half-Orc", "Tiefling"].map(r => <option key={r} value={r}>{raceNameRu(r)}</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label>Предыстория</Label>
                    <Select value={backgroundName} onChange={e => setBackgroundName(e.target.value)}>
                      {["Acolyte", "Criminal", "Folk Hero", "Noble", "Sage", "Soldier", "Charlatan", "Sailor"].map(b => <option key={b} value={b}>{backgroundNameRu(b)}</option>)}
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Характеристики (пресет)</Label>
                  <Select value={abilitiesPreset} onChange={e => setAbilitiesPreset(e.target.value)}>
                    {ABILITY_PRESETS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </Select>
                </div>

                <div>
                  <Label>Ценности (макс. 3)</Label>
                  <select multiple className="w-full p-2 bg-forge-bg border border-forge-border rounded text-sm text-forge-parchment" value={values} onChange={e => setValues(Array.from(e.target.selectedOptions, o => o.value).slice(0,3))}>
                    {pools?.traits?.filter((t:any) => t.type === "value").map((t:any) => <option key={t.id} value={t.name}>{t.name}</option>)}
                  </select>
                </div>

                <div>
                  <Label>Страхи (макс. 2)</Label>
                  <select multiple className="w-full p-2 bg-forge-bg border border-forge-border rounded text-sm text-forge-parchment" value={fears} onChange={e => setFears(Array.from(e.target.selectedOptions, o => o.value).slice(0,2))}>
                    {pools?.traits?.filter((t:any) => t.type === "fear").map((t:any) => <option key={t.id} value={t.name}>{t.name}</option>)}
                  </select>
                </div>

                <div>
                  <Label>Мотивация</Label>
                  <Select value={motivation} onChange={e => setMotivation(e.target.value)}>
                    {pools?.traits?.filter((t:any) => t.type === "motivation").map((t:any) => <option key={t.id} value={t.name}>{t.name}</option>)}
                  </Select>
                </div>

                <div>
                  <Label>Предыстория (выбор из 5)</Label>
                  <Select value={backstory} onChange={e => setBackstory(e.target.value)}>
                    {(character.backstory_options || [character.backstory]).map((b, i) => <option key={i} value={b}>{b}</option>)}
                  </Select>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSave} disabled={saving}>Сохранить</Button>
                  <Button variant="ghost" onClick={() => setEditing(false)}>Отмена</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
                  {Object.entries(character.abilities).map(([key, value]) => (
                    <div key={key} className="bg-forge-bg border border-forge-border rounded p-1.5 text-center">
                      <div className="text-[10px] text-forge-muted">{ABILITY_LABEL_SHORT[key] ?? key}</div>
                      <div className="text-lg font-bold text-forge-gold-light">{value}</div>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="text-xs text-forge-muted uppercase mb-1">Ценности</div>
                  <div className="flex flex-wrap gap-1">{character.personality.values.map(v => <Badge key={v} variant="gold">{v}</Badge>)}</div>
                </div>

                <div>
                  <div className="text-xs text-forge-muted uppercase mb-1">Предыстория</div>
                  <p className="text-sm text-forge-parchment leading-relaxed">{character.backstory}</p>
                </div>

                {canEdit && (
                  <div className="pt-2 flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Редактировать (Выбор)</Button>
                    <Button variant="ghost" size="sm" onClick={saveToLibrary}>В библиотеку</Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
      {canChangeImage && <ImagePickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} title={`Портрет`} type="portrait" raceName={character.race_name} currentUrl={character.image_url ?? null} onSelect={async (id) => { await fetch(`/api/characters/${character.id}/image`, { method: "PATCH", body: JSON.stringify({ image_id: id }) }); router.refresh(); }} />}
    </>
  );
}