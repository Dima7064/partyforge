import React from "react";
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { styles } from "./styles";
import { resolveImageSrc } from "./imageSrc";
import type { SavedCampaignData } from "@/types/generator";

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

const LOCATION_TYPE_LABEL: Record<string, string> = {
  city: "Город",
  temple: "Храм",
  forest: "Лес",
  ruins: "Руины",
  port: "Порт",
};

const ATTITUDE_LABEL: Record<string, string> = {
  ally: "Союзник",
  enemy: "Враг",
  neutral: "Нейтрал",
};

const NPC_ROLE_LABEL: Record<string, string> = {
  ally: "Союзник",
  enemy: "Враг",
  neutral: "Нейтрал",
};

const THEME_LABEL: Record<string, string> = {
  classic: "Классика D&D",
  skyrim: "Скайрим",
};

const ABILITY_LABEL: Record<string, string> = {
  str: "СИЛ",
  dex: "ЛОВ",
  con: "ТЕЛ",
  int: "ИНТ",
  wis: "МДР",
  cha: "ХАР",
};

export function MasterNotesDocument({ campaign }: { campaign: SavedCampaignData }) {
  const mapSrc = resolveImageSrc(campaign.map_image_url ?? null);
  const terrainSrc = resolveImageSrc(campaign.terrain_image_url ?? null);

  return (
    <Document>
      {/* ============ Обложка ============ */}
      <Page size="A4" style={styles.cover}>
        <Text style={[styles.small, { textTransform: "uppercase", letterSpacing: 4 }]}>
          SagaForge · Конспект мастера
        </Text>
        <Text style={[styles.h1, { fontSize: 38, marginTop: 8 }]}>Кампания</Text>
        <Text style={{ fontSize: 16, marginTop: 4 }}>
          {THEME_LABEL[campaign.theme] ?? campaign.theme} · Ур. {campaign.input.level} ·{" "}
          {campaign.characters.length} героев
        </Text>
        <Text style={{ marginTop: 8, fontSize: 12 }}>
          Код: <Text style={{ fontWeight: "bold" }}>{campaign.share_code}</Text>
        </Text>

        <View style={{ marginTop: 24 }}>
          <Text style={styles.h2}>Ситуация</Text>
          <Text style={{ lineHeight: 1.4 }}>{campaign.situation}</Text>
        </View>

        <View style={styles.footer} fixed>
          <Text>SagaForge · {campaign.share_code}</Text>
          <Text>Конспект мастера</Text>
        </View>
      </Page>

      {/* ============ Карта региона — отдельный лист A4 landscape ============ */}
      {mapSrc ? (
        <Page size="A4" orientation="landscape" style={{ padding: 0 }}>
          <Image
            src={mapSrc}
            style={{ width: 842, height: 595, objectFit: "contain" }}
          />
        </Page>
      ) : null}

      {/* ============ Партия: по странице на героя ============ */}
      {campaign.characters.map((c, idx) => {
        const portraitSrc = resolveImageSrc(c.image_url);
        return (
          <Page key={idx} size="A4" style={styles.page} wrap>
            <View style={styles.row}>
              {portraitSrc ? (
                <Image
                  src={portraitSrc}
                  style={[styles.portrait, { width: 110, height: 165 }]}
                />
              ) : (
                <View
                  style={[
                    styles.portrait,
                    {
                      width: 110,
                      height: 165,
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
                <Text style={styles.h1}>{c.name}</Text>
                <Text>
                  {c.race_name} · {c.class_name} · {c.background_name} · Ур. {c.level}
                </Text>
                <Text style={[styles.small, { marginTop: 2 }]}>
                  {ROLE_LABEL[c.role] ?? c.role}
                </Text>
              </View>
            </View>

            <View style={styles.abilityGrid}>
              {Object.entries(c.abilities).map(([k, v]) => (
                <View key={k} style={styles.abilityBox}>
                  <Text style={styles.abilityLabel}>{ABILITY_LABEL[k] ?? k}</Text>
                  <Text style={styles.abilityValue}>{v}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.h3}>Ценности</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {c.personality.values.map((v) => (
                <Text key={v} style={styles.badge}>{v}</Text>
              ))}
            </View>
            <Text style={styles.h3}>Страхи</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {c.personality.fears.map((f) => (
                <Text key={f} style={styles.badgeDanger}>{f}</Text>
              ))}
            </View>
            <Text style={styles.h3}>Привычки</Text>
            <Text>{c.personality.habits.join(", ")}</Text>
            <Text style={styles.h3}>Мотивация</Text>
            <Text>{c.personality.motivation}</Text>

            {c.backstory ? (
              <View wrap>
                <Text style={styles.h2}>Предыстория</Text>
                <Text style={{ lineHeight: 1.4 }}>{c.backstory}</Text>
              </View>
            ) : null}

            {c.secret_text ? (
              <View wrap>
                <Text style={styles.h2}>Тайна (только для мастера)</Text>
                <Text style={{ lineHeight: 1.4, color: "#8a3010", fontStyle: "italic" }}>
                  {c.secret_text}
                </Text>
              </View>
            ) : null}

            <View style={styles.footer} fixed>
              <Text>{c.name} · {campaign.share_code}</Text>
              <Text
                render={({ pageNumber, totalPages }) =>
                  `стр. ${pageNumber} / ${totalPages}`
                }
              />
            </View>
          </Page>
        );
      })}

      {/* ============ Связи + Локации с картинками + Фракции + NPC с портретами + Крючки ============ */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.h2}>Связи между персонажами</Text>
        {campaign.relationships.map((r, i) => {
          const a = campaign.characters[r.source_character_index];
          const b = campaign.characters[r.target_character_index];
          return (
            <Text key={i} style={{ marginBottom: 3 }}>
              <Text style={{ fontWeight: "bold" }}>
                {a?.name ?? "?"} ↔ {b?.name ?? "?"}
              </Text>{" "}
              ({REL_LABEL[r.type] ?? r.type}): {r.description}
            </Text>
          );
        })}

        <Text style={styles.h2}>Локации</Text>
        {campaign.locations.map((l, i) => {
          const src = resolveImageSrc(l.image_url);
          return (
            <View key={i} style={{ marginBottom: 14 }} wrap={false}>
              {src ? (
                <Image
                  src={src}
                  style={{
                    width: 360,
                    height: 202,
                    borderRadius: 4,
                    marginBottom: 6,
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 360,
                    height: 202,
                    borderRadius: 4,
                    marginBottom: 6,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f5f0e5",
                    borderWidth: 1,
                    borderColor: "#d8cfb8",
                  }}
                >
                  <Text style={styles.small}>Изображение локации</Text>
                  <Text style={styles.small}>1280 × 720</Text>
                </View>
              )}
              <Text style={{ fontWeight: "bold", marginBottom: 2 }}>
                {l.name}
              </Text>
              <Text style={[styles.small, { marginBottom: 2 }]}>
                {LOCATION_TYPE_LABEL[l.type] ?? l.type}
              </Text>
              <Text>{l.description}</Text>
            </View>
          );
        })}

        <Text style={styles.h2}>Фракции</Text>
        {campaign.factions.map((f, i) => (
          <Text key={i} style={{ marginBottom: 4 }}>
            <Text style={{ fontWeight: "bold" }}>{f.name}</Text> (
            {ATTITUDE_LABEL[f.attitude] ?? f.attitude}): {f.description} Цель: {f.goals}
          </Text>
        ))}

        <Text style={styles.h2}>NPC</Text>
        {campaign.npcs.map((n, i) => {
          const src = resolveImageSrc(n.image_url);
          return (
            <View
              key={i}
              style={{ marginBottom: 10, flexDirection: "row", gap: 8 }}
              wrap={false}
            >
              {src ? (
                <Image
                  src={src}
                  style={{ width: 70, height: 70, borderRadius: 35 }}
                />
              ) : (
                <View
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 35,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f5f0e5",
                    borderWidth: 1,
                    borderColor: "#d8cfb8",
                  }}
                >
                  <Text style={styles.small}>NPC</Text>
                  <Text style={styles.small}>512×512</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "bold" }}>
                  {n.name} ({NPC_ROLE_LABEL[n.role] ?? n.role})
                </Text>
                <Text>{n.description}</Text>
              </View>
            </View>
          );
        })}

        <Text style={styles.h2}>Сюжетные крючки</Text>
        {campaign.hooks.map((h, i) => (
          <Text key={i} style={{ marginBottom: 4 }}>
            <Text style={{ fontWeight: "bold" }}>{h.title}</Text>: {h.description}
          </Text>
        ))}

        <View style={styles.footer} fixed>
          <Text>{campaign.share_code}</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `стр. ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>

      {/* ============ Террейн — отдельный лист A4 portrait ============ */}
      {terrainSrc ? (
        <Page size="A4" style={{ padding: 0 }}>
          <Image
            src={terrainSrc}
            style={{ width: 595, height: 842, objectFit: "contain" }}
          />
        </Page>
      ) : null}
    </Document>
  );
}