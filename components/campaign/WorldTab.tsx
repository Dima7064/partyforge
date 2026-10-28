"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LightboxImage } from "@/components/ui/lightbox";
import { ImagePickerModal } from "./ImagePickerModal";
import { LocationCard } from "./LocationCard";
import { FactionCard } from "./FactionCard";
import { NpcCard } from "./NpcCard";
import { SituationCard } from "./SituationCard";
import { useToast } from "@/lib/hooks/useToast";
import { IMAGE_DIMENSIONS } from "@/lib/images/dimensions";
import type { CharacterLocation, Faction, Location, Npc } from "@/types/generator";

export function WorldTab({
  campaignCode,
  locations,
  factions,
  npcs,
  character_locations,
  situation,
  canEdit,
  npcIds,
  locationIds,
  factionIds,
  mapImageUrl,
}: {
  campaignCode: string;
  locations: Location[];
  factions: Faction[];
  npcs: Npc[];
  character_locations: CharacterLocation[];
  situation: string;
  canEdit: boolean;
  npcIds: string[];
  locationIds: string[];
  factionIds: string[];
  mapImageUrl?: string | null;
}) {
  const router = useRouter();
  const { show } = useToast();
  const [pickerMapOpen, setPickerMapOpen] = useState(false);

  async function changeMapImage(imageId: string) {
    const res = await fetch(`/api/campaigns/${campaignCode}/map`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_id: imageId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Ошибка");
    }
    show("success", "Карта региона обновлена");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2 flex-wrap">
            <span>Карта региона</span>
            {canEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPickerMapOpen(true)}
                aria-label="Сменить карту региона"
              >
                Сменить карту
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full max-w-sm">
            <LightboxImage
              src={mapImageUrl ?? null}
              width={IMAGE_DIMENSIONS.map.width}
              height={IMAGE_DIMENSIONS.map.height}
              alt="Карта региона"
              label="Карта региона"
              hint={
                !mapImageUrl
                  ? `${IMAGE_DIMENSIONS.map.width}×${IMAGE_DIMENSIONS.map.height} (A4 альбом)`
                  : undefined
              }
              rounded="md"
            />
          </div>
          {mapImageUrl && (
            <p className="text-forge-muted text-xs mt-3">
              Нажми на карту, чтобы открыть на весь экран. В конспекте мастера
              карта печатается отдельным листом A4 (ландшафт).
            </p>
          )}
        </CardContent>
      </Card>

      <SituationCard
        campaignCode={campaignCode}
        situation={situation}
        canEdit={canEdit}
      />

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-forge-gold">Локации</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {locations.map((l, i) => {
            const links = character_locations.filter(
              (cl) => cl.location_index === i,
            );
            const locId = locationIds[i];
            return (
              <LocationCard
                key={i}
                location={l}
                locationId={locId}
                canEdit={canEdit}
                links={links}
              />
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-forge-gold">Фракции</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {factions.map((f, i) => (
            <FactionCard
              key={i}
              faction={f}
              factionId={factionIds[i]}
              canEdit={canEdit}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-forge-gold">NPC</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {npcs.map((n, i) => (
            <NpcCard
              key={i}
              npc={n}
              npcId={npcIds[i]}
              canEdit={canEdit}
            />
          ))}
        </div>
      </section>

      <ImagePickerModal
        open={pickerMapOpen}
        onClose={() => setPickerMapOpen(false)}
        title="Карта региона"
        type="map"
        currentUrl={mapImageUrl ?? null}
        onSelect={changeMapImage}
      />
    </div>
  );
}