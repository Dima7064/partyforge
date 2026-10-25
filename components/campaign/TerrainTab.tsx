"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { Lightbox } from "@/components/ui/lightbox";
import { ImagePickerModal } from "./ImagePickerModal";
import { useToast } from "@/lib/hooks/useToast";
import { IMAGE_DIMENSIONS } from "@/lib/images/dimensions";

export function TerrainTab({
  campaignCode,
  campaignTheme,
  terrainImageUrl,
  canEdit,
}: {
  campaignCode: string;
  campaignTheme: string;
  terrainImageUrl: string | null;
  canEdit: boolean;
}) {
  const router = useRouter();
  const { show } = useToast();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const t = IMAGE_DIMENSIONS.terrain;

  async function handleSelect(imageId: string) {
    const res = await fetch(`/api/campaigns/${campaignCode}/terrain`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_id: imageId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Ошибка");
    }
    show("success", "Террейн обновлён");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2 flex-wrap">
            <span>Террейн (карта с клетками)</span>
            {canEdit && (
              <Button size="sm" variant="outline" onClick={() => setPickerOpen(true)}>
                Сменить террейн
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!canEdit && !terrainImageUrl ? (
            <p className="text-forge-muted text-sm">
              Мастер ещё не выбрал террейн для этой кампании.
            </p>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <button
                type="button"
                onClick={() => terrainImageUrl && setLightboxOpen(true)}
                disabled={!terrainImageUrl}
                aria-label="Открыть террейн на весь экран"
                className={`block w-full max-w-[220px] rounded-lg overflow-hidden border border-forge-border ${
                  terrainImageUrl
                    ? "cursor-zoom-in hover:opacity-90 transition-opacity"
                    : "cursor-default"
                }`}
              >
                <ImageSlot
                  src={terrainImageUrl}
                  width={t.width}
                  height={t.height}
                  alt="Террейн"
                  label="Террейн"
                  hint={!terrainImageUrl ? `${t.width}×${t.height} (A4)` : undefined}
                  rounded="none"
                />
              </button>
              <div className="flex-1 space-y-2">
                <p className="text-forge-muted text-xs">
                  Нажми на террейн, чтобы открыть на весь экран. В конспекте
                  мастера террейн печатается отдельным листом A4 (портрет).
                </p>
                <p className="text-forge-muted text-xs">
                  Для печати: {t.width}×{t.height} px, A4 портрет, сетка 12×12
                  клеток по центру с полями.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Lightbox
        open={lightboxOpen}
        src={terrainImageUrl}
        alt="Террейн"
        onClose={() => setLightboxOpen(false)}
      />

      {canEdit && (
        <ImagePickerModal
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          title="Выбрать террейн"
          type="terrain"
          theme={campaignTheme}
          currentUrl={terrainImageUrl}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
}