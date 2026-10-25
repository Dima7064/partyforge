"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/lib/hooks/useToast";
import { shouldShowAchievement } from "@/lib/achievements-client";
import type { SavedCampaignData } from "@/types/generator";

function download(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function Row({
  title,
  description,
  hint,
  onClick,
  disabled,
  onFirstSuccess,
}: {
  title: string;
  description: string;
  hint?: string;
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  onFirstSuccess?: () => void;
}) {
  const { show } = useToast();
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    try {
      await onClick();
      show("success", "Файл скачивается", title);
      onFirstSuccess?.();
    } catch (e) {
      show("error", e instanceof Error ? e.message : "Не удалось скачать");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-start justify-between gap-4 p-4 border border-forge-border rounded-lg flex-wrap">
      <div className="flex-1 min-w-0">
        <p className="text-forge-parchment font-semibold">{title}</p>
        <p className="text-forge-muted text-sm mt-1">{description}</p>
        {hint && <p className="text-forge-muted text-xs mt-1">{hint}</p>}
      </div>
      <Button variant="outline" onClick={handle} disabled={disabled || loading} aria-busy={loading}>
        {loading ? "Готовим..." : "Скачать"}
      </Button>
    </div>
  );
}

export function ExportTab({ campaign }: { campaign: SavedCampaignData }) {
  const { showAchievement } = useToast();
  const isMaster = campaign.viewer_role === "master";
  const code = campaign.share_code;
  const [achievementShown, setAchievementShown] = useState(false);

  function handleFirstExport() {
    if (achievementShown) return;
    if (shouldShowAchievement("first_export")) {
      setAchievementShown(true);
      setTimeout(() => {
        showAchievement(
          "Книжник",
          "Экспортируй кампанию в PDF или SVG",
          "📜",
        );
      }, 700);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Экспорт кампании</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {campaign.characters.map((c, i) => {
            const canDownload = isMaster || campaign.viewer_character_index === i;
            if (!canDownload) return null;
            return (
              <Row
                key={i}
                title={`PDF — ${c.name}`}
                description={`Лист персонажа: портрет, характеристики, характер${isMaster ? ", тайна" : ""}, связи, крючки. A4, готов к печати.`}
                hint="Для печати: A4, 100% масштаб"
                onClick={() =>
                  download(
                    `/api/export/${code}/character/${i}/pdf`,
                    `partyforge-${code}-${c.name}.pdf`,
                  )
                }
                onFirstSuccess={handleFirstExport}
              />
            );
          })}

          {isMaster && (
            <Row
              title="PDF — конспект мастера"
              description="Обложка + карта региона (A4 ландшафт) + страницы партии + связи + локации с картинками + NPC с портретами + крючки + террейн (A4 портрет). Всё, что нужно мастеру, в одном файле."
              hint="A4, для печати или планшета"
              onClick={() =>
                download(
                  `/api/export/${code}/pdf`,
                  `partyforge-${code}-master-notes.pdf`,
                )
              }
              onFirstSuccess={handleFirstExport}
            />
          )}

          <Row
            title="SVG — карта связей"
            description="Векторный граф связей между персонажами. Подходит для вставки в презентации, PDF или печати A3."
            hint="Векторный, масштабируется без потерь"
            onClick={() =>
              download(`/api/export/${code}/svg`, `partyforge-${code}-relationships.svg`)
            }
            onFirstSuccess={handleFirstExport}
          />
        </CardContent>
      </Card>

      <p className="text-forge-muted text-xs text-center">
        Все файлы скачиваются сразу. Данные не сохраняются на сервере — только
        отдаются в ответ на твой запрос.
      </p>
    </div>
  );
}