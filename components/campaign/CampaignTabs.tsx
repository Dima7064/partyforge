"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CharacterCard } from "./CharacterCard";
import { RelationshipsGraph } from "./RelationshipsGraph";
import { WorldTab } from "./WorldTab";
import { HooksTab } from "./HooksTab";
import { TerrainTab } from "./TerrainTab";
import { ExportTab } from "./ExportTab";
import type { SavedCampaignData } from "@/types/generator";

const ALL_TABS = [
  { id: "party", label: "Партия" },
  { id: "relationships", label: "Связи" },
  { id: "world", label: "Мир" },
  { id: "hooks", label: "Крючки" },
  { id: "terrain", label: "Террейн", masterOnly: true },
  { id: "export", label: "Экспорт" },
] as const;

type TabId = (typeof ALL_TABS)[number]["id"];

export function CampaignTabs({ campaign }: { campaign: SavedCampaignData }) {
  const [active, setActive] = useState<TabId>("party");

  const isPlayer = campaign.viewer_role === "player";
  const isMaster = campaign.viewer_role === "master";
  const myIndex = campaign.viewer_character_index;

  const visibleCharacters =
    isPlayer && myIndex !== undefined
      ? [campaign.characters[myIndex]]
      : campaign.characters;

  const visibleTabs = ALL_TABS.filter(
    (t) => !("masterOnly" in t && t.masterOnly) || isMaster,
  );

  return (
    <div className="space-y-6">
      <div
        role="tablist"
        aria-label="Разделы кампании"
        className="tabs-scroll flex gap-1 flex-nowrap md:flex-wrap border-b border-forge-border relative"
      >
        {visibleTabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            onClick={() => setActive(t.id)}
            className={`shrink-0 px-4 py-2 text-sm font-medium transition-colors relative ${
              active === t.id
                ? "text-forge-gold"
                : "text-forge-muted hover:text-forge-parchment"
            }`}
          >
            {t.label}
            {active === t.id && (
              <motion.div
                layoutId="campaign-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-forge-gold rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="animate-fade-up">
        {active === "party" && (
          <div className="space-y-3">
            {isPlayer && (
              <p className="text-forge-muted text-sm">
                Ты видишь только своего персонажа. Секреты других скрыты.
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visibleCharacters.map((c, i) => {
                const realIndex = isPlayer && myIndex !== undefined ? myIndex : i;
                const canEdit = isMaster || (isPlayer && realIndex === myIndex);
                const canSeeNotes = isPlayer && realIndex === myIndex;
                const note = c.id ? campaign.my_notes?.[c.id] ?? "" : "";
                return (
                  <div
                    key={realIndex}
                    className="animate-fade-up stagger"
                    style={{ ["--stagger" as string]: String(i) }}
                  >
                    <CharacterCard
                      character={c}
                      characterIndex={realIndex}
                      campaignCode={campaign.share_code}
                      campaignTheme={campaign.theme}
                      characters={campaign.characters}
                      relationships={campaign.relationships}
                      hooks={campaign.hooks}
                      canEdit={canEdit}
                      canSeeNotes={canSeeNotes}
                      canChangeImage={canEdit}
                      initialNote={note}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {active === "relationships" && (
          <RelationshipsGraph
            characters={campaign.characters}
            relationships={campaign.relationships}
            canEdit={isMaster}
            campaignCode={campaign.share_code}
          />
        )}

        {active === "world" && (
          <WorldTab
            campaignCode={campaign.share_code}
            campaignTheme={campaign.theme}
            locations={campaign.locations}
            factions={campaign.factions}
            npcs={campaign.npcs}
            character_locations={campaign.character_locations}
            situation={campaign.situation}
            canEdit={isMaster}
            npcIds={campaign.npc_ids ?? []}
            locationIds={campaign.location_ids ?? []}
            factionIds={campaign.faction_ids ?? []}
            mapImageUrl={campaign.map_image_url ?? null}
          />
        )}

        {active === "hooks" && (
          <HooksTab
          hooks={campaign.hooks}
          characters={campaign.characters}
          factions={campaign.factions}
          npcs={campaign.npcs}
          locations={campaign.locations}
          canEdit={isMaster}
          hideOtherCharacters={isPlayer}
          myCharacterIndex={myIndex}
          />
        )}

        {active === "terrain" && isMaster && (
          <TerrainTab
            campaignCode={campaign.share_code}
            campaignTheme={campaign.theme}
            terrainImageUrl={campaign.terrain_image_url ?? null}
            canEdit={isMaster}
          />
        )}

        {active === "export" && <ExportTab campaign={campaign} />}
      </div>
    </div>
  );
}