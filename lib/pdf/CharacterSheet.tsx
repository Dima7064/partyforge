import React from "react";
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { styles } from "./styles";
import { resolveImageSrc } from "./imageSrc";
import type { Character, Relationship, Hook } from "@/types/generator";

const ROLE_LABEL: Record<string, string> = {
  tank: "Танк",
  healer: "Хилер",
  dps: "DPS",
  face: "Лицо партии",
  control: "Контроль",
  support: "Поддержка",
};

const REL_LABEL: Record<string, string> = {
  trust: "Доверие",
  debt: "Долг",
  love: "Любовь",
  conflict: "Конфликт",
  secret: "Тайна",
};

const ABILITY_LABEL: Record<string, string> = {
  str: "СИЛ",
  dex: "ЛОВ",
  con: "ТЕЛ",
  int: "ИНТ",
  wis: "МДР",
  cha: "ХАР",
};

export function CharacterSheetDocument({
  character,
  characterIndex,
  characters,
  relationships,
  hooks,
  showSecret,
  campaignCode,
  themeLabel,
}: {
  character: Character;
  characterIndex: number;
  characters: Character[];
  relationships: Relationship[];
  hooks: Hook[];
  showSecret: boolean;
  campaignCode: string;
  themeLabel: string;
}) {
  const myRelationships = relationships.filter(
    (r) =>
      r.source_character_index === characterIndex ||
      r.target_character_index === characterIndex,
  );
  const myHooks = hooks.filter((h) => h.character_index === characterIndex);
  const portraitSrc = resolveImageSrc(character.image_url);

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.row}>
          {portraitSrc ? (
            <Image
              src={portraitSrc}
              style={[styles.portrait, { width: 120, height: 180 }]}
            />
          ) : (
            <View
              style={[
                styles.portrait,
                {
                  width: 120,
                  height: 180,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f5f0e5",
                },
              ]}
            >
              <Text style={styles.small}>Портрет</Text>
              <Text style={styles.small}>768 × 1152</Text>
            </View>
          )}
          <View style={styles.col}>
            <Text style={styles.h1}>{character.name}</Text>
            <Text>
              {character.race_name} · {character.class_name} ·{" "}
              {character.background_name} · Ур. {character.level}
            </Text>
            <Text style={[styles.small, { marginTop: 2 }]}>
              {ROLE_LABEL[character.role] ?? character.role} · {themeLabel}
            </Text>
          </View>
        </View>

        <View style={styles.hr} />

        <Text style={styles.h2}>Характеристики</Text>
        <View style={styles.abilityGrid}>
          {Object.entries(character.abilities).map(([key, value]) => (
            <View key={key} style={styles.abilityBox}>
              <Text style={styles.abilityLabel}>{ABILITY_LABEL[key] ?? key}</Text>
              <Text style={styles.abilityValue}>{value}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.h2}>Характер</Text>
        <Text style={styles.h3}>Ценности</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {character.personality.values.map((v) => (
            <Text key={v} style={styles.badge}>{v}</Text>
          ))}
        </View>
        <Text style={styles.h3}>Страхи</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {character.personality.fears.map((f) => (
            <Text key={f} style={styles.badgeDanger}>{f}</Text>
          ))}
        </View>
        <Text style={styles.h3}>Привычки</Text>
        <Text>{character.personality.habits.join(", ")}</Text>
        <Text style={styles.h3}>Мотивация</Text>
        <Text>{character.personality.motivation}</Text>

        {character.backstory ? (
          <View wrap>
            <Text style={styles.h2}>Предыстория</Text>
            <Text style={{ lineHeight: 1.4 }}>{character.backstory}</Text>
          </View>
        ) : null}

        {showSecret && character.secret_text ? (
          <View wrap>
            <Text style={styles.h2}>Тайна (только для мастера)</Text>
            <Text style={{ lineHeight: 1.4, color: "#8a3010", fontStyle: "italic" }}>
              {character.secret_text}
            </Text>
          </View>
        ) : null}

        {myRelationships.length > 0 ? (
          <View wrap>
            <Text style={styles.h2}>Связи</Text>
            {myRelationships.map((r, i) => {
              const otherIdx =
                r.source_character_index === characterIndex
                  ? r.target_character_index
                  : r.source_character_index;
              const other = characters[otherIdx];
              return (
                <Text key={i} style={{ marginBottom: 3 }}>
                  <Text style={{ fontWeight: "bold" }}>
                    {REL_LABEL[r.type] ?? r.type}
                  </Text>{" "}
                  с {other?.name ?? `#${otherIdx}`}: {r.description}
                </Text>
              );
            })}
          </View>
        ) : null}

        {myHooks.length > 0 ? (
          <View wrap>
            <Text style={styles.h2}>Крючки</Text>
            {myHooks.map((h, i) => (
              <Text key={i} style={{ marginBottom: 3 }}>
                • {h.description}
              </Text>
            ))}
          </View>
        ) : null}

        <View style={styles.footer} fixed>
          <Text>SagaForge · кампания {campaignCode}</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `стр. ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}