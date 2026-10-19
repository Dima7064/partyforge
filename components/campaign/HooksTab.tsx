"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import type { Character, Hook } from "@/types/generator";

const TYPE_LABEL: Record<string, string> = {
  personal: "Личный",
  social: "Социальный",
  exploration: "Исследование",
  combat: "Бой",
};

export function HooksTab({
  hooks,
  characters,
  hideOtherCharacters,
  myCharacterIndex,
}: {
  hooks: Hook[];
  characters: Character[];
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
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <Select value={filterChar} onChange={(e) => setFilterChar(e.target.value)}>
            <option value="all">Все персонажи</option>
            {characters.map((c, i) => (
              <option key={i} value={String(i)}>{c.name}</option>
            ))}
          </Select>
        </div>
        <div className="flex-1 min-w-[160px]">
          <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
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
        <div className="grid md:grid-cols-2 gap-4">
          {visible.map((h, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  <span>{h.title}</span>
                  <Badge variant="muted">{TYPE_LABEL[h.type] ?? h.type}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-forge-parchment leading-relaxed">
                  {h.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}