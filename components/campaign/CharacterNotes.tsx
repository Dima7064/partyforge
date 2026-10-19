"use client";

import { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";

export function CharacterNotes({
  characterId,
  initialContent,
}: {
  characterId: string;
  initialContent: string;
}) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!characterId) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSaving(true);
      try {
        await fetch(`/api/notes/${characterId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });
        setSavedAt(new Date().toLocaleTimeString("ru-RU"));
      } finally {
        setSaving(false);
      }
    }, 800);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [content, characterId]);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs text-forge-muted uppercase tracking-wide">
          Мои заметки
        </div>
        <div className="text-xs text-forge-muted">
          {saving ? "Сохранение..." : savedAt ? `Сохранено в ${savedAt}` : ""}
        </div>
      </div>
      <Textarea
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Тайные мысли, планы, догадки..."
      />
    </div>
  );
}