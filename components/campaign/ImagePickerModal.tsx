"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/lib/hooks/useToast";
import { IMAGE_DIMENSIONS, getDimsFromType } from "@/lib/images/dimensions";

interface PoolImage {
  id: string;
  url: string;
  width: number;
  height: number;
}

const TYPE_LABEL: Record<string, string> = {
  portrait: "портрет",
  npc: "NPC",
  location: "локация",
  map: "карта",
  terrain: "террейн",
};

const FOLDER_BY_TYPE: Record<string, string> = {
  portrait: "portraits/{race}",
  npc: "npcs",
  location: "locations/{type}",
  map: "maps",
  terrain: "terrain",
};

function folderHint(type: string, raceName?: string, locationType?: string) {
  const raw = FOLDER_BY_TYPE[type] ?? `${type}s`;
  return raw
    .replace("{race}", raceName ?? "...")
    .replace("{type}", locationType ?? "...");
}

function sizeHint(type: string): string {
  const dims = getDimsFromType(type);
  const aspect = (dims.width / dims.height).toFixed(2);
  const ratio =
    aspect === "0.67" ? "2:3" : aspect === "1.00" ? "1:1" : aspect === "1.78" ? "16:9" : aspect === "1.33" ? "4:3" : aspect;
  return `${dims.width}×${dims.height} (${ratio})`;
}

export function ImagePickerModal({
  open,
  onClose,
  title,
  type,
  raceName,
  locationType,
  theme,
  currentUrl,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  type: string;
  raceName?: string;
  locationType?: string;
  theme?: string;
  currentUrl?: string | null;
  onSelect: (imageId: string) => Promise<void>;
}) {
  const { show } = useToast();
  const [pool, setPool] = useState<PoolImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setSelected(null);
    const qs = new URLSearchParams({ type });
    if (raceName) qs.set("race_name", raceName);
    if (locationType) qs.set("location_type", locationType);
    if (theme) qs.set("theme", theme);
    fetch(`/api/image-pool?${qs}`)
      .then((r) => r.json())
      .then((d) => setPool(d.data ?? []))
      .catch(() => show("error", "Не удалось загрузить пул"))
      .finally(() => setLoading(false));
  }, [open, type, raceName, locationType, theme, show]);

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    try {
      await onSelect(selected);
      show("success", "Изображение обновлено");
      onClose();
    } catch (e) {
      show("error", e instanceof Error ? e.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Отмена
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selected || saving}
            aria-busy={saving}
          >
            {saving ? "Сохраняем..." : "Выбрать"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs text-forge-muted">
          <span>
            Тип: <span className="text-forge-parchment">{TYPE_LABEL[type] ?? type}</span>
          </span>
          <span>
            Формат:{" "}
            <span className="font-mono text-forge-gold">{sizeHint(type)}</span>
          </span>
        </div>

        <div aria-live="polite" aria-busy={loading}>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] w-full" />
              ))}
            </div>
          ) : pool.length === 0 ? (
            <div className="space-y-3 p-4 border border-dashed border-forge-border rounded-md">
              <p className="text-forge-parchment text-sm">
                В пуле пока нет изображений этого типа.
              </p>
              <div className="space-y-1 text-forge-muted text-sm">
                <p>
                  Сгенерируй картинку и положи в{" "}
                  <code className="text-forge-gold">
                    public/images/{folderHint(type, raceName, locationType)}/
                  </code>
                </p>
                <p>
                  Размер:{" "}
                  <span className="font-mono text-forge-gold">{sizeHint(type)}</span>
                </p>
                <p className="text-xs">
                  После этого запусти{" "}
                  <code className="text-forge-gold">npx tsx scripts/seed-images.ts</code> — картинка
                  появится здесь.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {pool.map((img) => {
                const isCurrent = img.url === currentUrl;
                const isSelected = selected === img.id;
                return (
                  <button
                    key={img.id}
                    type="button"
                    aria-label={
                      isCurrent
                        ? "Текущее изображение"
                        : isSelected
                        ? "Выбрано"
                        : "Выбрать это изображение"
                    }
                    aria-pressed={isSelected}
                    onClick={() => setSelected(img.id)}
                    className={`relative border-2 rounded-md overflow-hidden transition-all ${
                      isSelected
                        ? "border-forge-gold ring-2 ring-forge-gold/40"
                        : "border-forge-border hover:border-forge-gold/50"
                    }`}
                  >
                    <ImageSlot
                      src={img.url}
                      width={img.width}
                      height={img.height}
                      alt=""
                      rounded="none"
                    />
                    {isCurrent && (
                      <div className="absolute top-1 right-1 bg-forge-gold text-forge-bg text-[10px] px-1.5 py-0.5 rounded">
                        текущее
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}