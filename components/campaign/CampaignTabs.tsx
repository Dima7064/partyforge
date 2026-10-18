"use client";

import { useState } from "react";
import { CharacterCard } from "./CharacterCard";
import { RelationshipsGraph } from "./RelationshipsGraph";
import { WorldTab } from "./WorldTab";
import { HooksTab } from "./HooksTab";
import type { SavedCampaignData } from "@/types/generator";

const TABS = [
  { id: "party", label: "Партия" },
  { id: "relationships", label: "Связи" },
  { id: "world", label: "Мир" },
  { id: "hooks", label: "Крючки" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function CampaignTabs({ campaign }: { campaign: SavedCampaignData }) {
  const [active, setActive] = useState<TabId>("party");

  return (
    <div className="space-y-6">
      <div className="flex gap-1 flex-wrap border-b border-forge-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              active === t.id
                ? "text-forge-gold border-forge-gold"
                : "text-forge-muted border-transparent hover:text-forge-parchment"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {active === "party" && (
        <div className="grid md:grid-cols-2 gap-4">
          {campaign.characters.map((c, i) => (
            <CharacterCard key={i} character={c} />
          ))}
        </div>
      )}

      {active === "relationships" && (
        <RelationshipsGraph
          characters={campaign.characters}
          relationships={campaign.relationships}
        />
      )}

      {active === "world" && (
        <WorldTab
          locations={campaign.locations}
          factions={campaign.factions}
          npcs={campaign.npcs}
          character_locations={campaign.character_locations}
          situation={campaign.situation}
        />
      )}

      {active === "hooks" && <HooksTab hooks={campaign.hooks} />}
    </div>
  );
}