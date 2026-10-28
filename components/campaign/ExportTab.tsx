"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/lib/hooks/useToast";
import type { SavedCampaignData } from "@/types/generator";

function download(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function Row({ title, description, onClick }: { title: string; description: string; onClick: () => void }) {
  const { show } = useToast();
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    try {
      await onClick();
      show("success", "Файл скачивается", title);
    } catch (e) {
      show("error", "Не удалось скачать");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-start justify-between gap-4 p-4 border border-forge-border rounded-lg flex-wrap">
      <div className="flex-1 min-w-0">
        <p className="text-forge-parchment font-semibold">{title}</p>
        <p className="text-forge-muted text-sm mt-1">{description}</p>
      </div>
      <Button variant="outline" onClick={handle} disabled={loading}>
        {loading ? "Готовим..." : "Скачать"}
      </Button>
    </div>
  );
}

export function ExportTab({ campaign }: { campaign: SavedCampaignData }) {
  const isMaster = campaign.viewer_role === "master";
  const code = campaign.share_code;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Экспорт кампании</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {campaign.characters.map((c, i) => {
            const canDownload = isMaster || campaign.viewer_character_index === i;
            if (!canDownload) return null;
            return (
              <Row key={i} title={`PDF --- ${c.name}`} description="Лист персонажа для печати." onClick={() => download(`/api/export/${code}/character/${i}/pdf`, `sagaforge-${code}-${c.name}.pdf`)} />
            );
          })}

          {isMaster && (
            <>
              <Row title="PDF --- конспект мастера" description="Все секреты, карты и NPC в одном файле." onClick={() => download(`/api/export/${code}/pdf`, `sagaforge-${code}-master.pdf`)} />
              <Row title="SVG --- карта связей" description="Векторный граф отношений." onClick={() => download(`/api/export/${code}/svg`, `sagaforge-${code}-relationships.svg`)} />
              <Row title="Foundry VTT JSON" description="Импорт персонажей в Foundry." onClick={() => download(`/api/export/${code}/foundry`, `sagaforge-${code}-foundry.json`)} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}