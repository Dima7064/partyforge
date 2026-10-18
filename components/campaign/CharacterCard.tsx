import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Character } from "@/types/generator";

const ROLE_LABEL: Record<string, string> = {
  tank: "Танк",
  healer: "Хилер",
  dps: "DPS",
  face: "Лицо партии",
  control: "Контроль",
  support: "Поддержка",
};

const ABILITY_LABEL: Record<string, string> = {
  str: "СИЛ",
  dex: "ЛОВ",
  con: "ТЕЛ",
  int: "ИНТ",
  wis: "МДР",
  cha: "ХАР",
};

export function CharacterCard({ character }: { character: Character }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex gap-4">
        <div className="relative w-32 h-32 shrink-0 bg-forge-bg">
          {character.image_url ? (
            <Image
              src={character.image_url}
              alt={character.name}
              fill
              sizes="128px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-forge-gold/40">
              {character.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1 py-4 pr-4">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="flex items-center justify-between gap-2 flex-wrap">
              <span>{character.name}</span>
              <Badge variant="muted">
                {ROLE_LABEL[character.role] ?? character.role}
              </Badge>
            </CardTitle>
            <p className="text-sm text-forge-muted">
              {character.race_name} · {character.class_name} ·{" "}
              {character.background_name} · Ур. {character.level}
            </p>
          </CardHeader>
        </div>
      </div>

      <CardContent className="space-y-4 pt-4">
        <div className="grid grid-cols-6 gap-1">
          {Object.entries(character.abilities).map(([key, value]) => (
            <div
              key={key}
              className="bg-forge-bg border border-forge-border rounded p-1.5 text-center"
            >
              <div className="text-[10px] text-forge-muted">
                {ABILITY_LABEL[key] ?? key}
              </div>
              <div className="text-lg font-bold text-forge-gold-light">
                {value}
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="text-xs text-forge-muted uppercase tracking-wide mb-1">
            Ценности
          </div>
          <div className="flex flex-wrap gap-1">
            {character.personality.values.map((v) => (
              <Badge key={v} variant="gold">
                {v}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs text-forge-muted uppercase tracking-wide mb-1">
            Страхи
          </div>
          <div className="flex flex-wrap gap-1">
            {character.personality.fears.map((f) => (
              <Badge key={f} variant="ember">
                {f}
              </Badge>
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
      </CardContent>
    </Card>
  );
}