"use client";

import { useState } from "react";
import { Select } from "@/components/ui/select";
import { HookCard } from "./HookCard";
import type { Character, Faction, Hook, Location, Npc } from "@/types/generator";

const TYPE_LABEL: Record<string, string> = {
  personal: "Личный",
  social: "Социальный",
  exploration: "Исследование",
  combat: "Бой",
};

export function HooksTab({
  hooks,
  characters,
  factions,
  npcs,
  locations,
  canEdit,
  hideOtherCharacters,
  myCharacterIndex,
}: {
  hooks: Hook[];
  characters: Character[];
  factions: Faction[];
  npcs: Npc[];
  locations: Location[];
  canEdit: boolean;
  hideOtherCharacters?: boolean;
  myCharacterIndex?: number;
}) {
  const [filterChar, setFilterChar] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  if (hooks.length === 0) {
    return <p className="text-forge-muted">Крючки не сгенерированы.</p>;
  }

  const visible = hooks.filter((h) => {
    if (hideOtherCharacters && myCharacterIndex !== undefined) {
      if (h.character_index !== myCharacterIndex) return false;
    }
    if (filterChar !== "all") {
      if (String(h.character_index ?? "") !== filterChar) return false;
    }
    if (filterType !== "all" && h.type !== filterType) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Select
            aria-label="Фильтр по персонажу"
            value={filterChar}
            onChange={(e) => setFilterChar(e.target.value)}
          >
            <option value="all">Все персонажи</option>
            {characters.map((c, i) => (
              <option key={i} value={String(i)}>{c.name}</option>
            ))}
          </Select>
        </div>
        <div className="flex-1">
          <Select
            aria-label="Фильтр по типу крючка"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">Все типы</option>
            {Object.entries(TYPE_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-forge-muted">Нет крючков по фильтру.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visible.map((h, i) => (
            <HookCard
              key={i}
              hook={h}
              hookId={h.id ?? ""}
              character={
                h.character_index !== undefined
                  ? characters[h.character_index]
                  : undefined
              }
              factions={factions}
              npcs={npcs}
              locations={locations}
              canEdit={canEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}