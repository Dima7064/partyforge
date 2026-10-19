"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ReactFlow, {
  Background,
  Controls,
  type Edge,
  type Node,
  type EdgeMouseHandler,
} from "reactflow";
import "reactflow/dist/style.css";
import type { Character, Relationship } from "@/types/generator";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

const EDGE_COLORS: Record<string, string> = {
  trust: "#5fa85f",
  debt: "#c9a227",
  love: "#d66f9e",
  conflict: "#b8451a",
  secret: "#8a5fc9",
};

const EDGE_LABELS: Record<string, string> = {
  trust: "доверие",
  debt: "долг",
  love: "любовь",
  conflict: "конфликт",
  secret: "тайна",
};

export function RelationshipsGraph({
  characters,
  relationships,
  canEdit,
  campaignCode,
}: {
  characters: Character[];
  relationships: Relationship[];
  canEdit: boolean;
  campaignCode: string;
}) {
  const router = useRouter();
  const [editingEdge, setEditingEdge] = useState<{
    id: string;
    type: string;
    description: string;
  } | null>(null);
  const [newType, setNewType] = useState("");
  const [saving, setSaving] = useState(false);

  const { nodes, edges } = useMemo(() => {
    const n: Node[] = characters.map((c, i) => {
      const angle = (2 * Math.PI * i) / Math.max(1, characters.length);
      const radius = 180;
      return {
        id: `char-${i}`,
        position: {
          x: 250 + radius * Math.cos(angle),
          y: 200 + radius * Math.sin(angle),
        },
        data: { label: `${c.name}\n${c.class_name}` },
        style: {
          background: "#1a1613",
          color: "#e8ddc4",
          border: "1px solid #c9a227",
          borderRadius: "8px",
          padding: "8px 12px",
          fontSize: "12px",
          whiteSpace: "pre-line",
          textAlign: "center" as const,
          width: 140,
        },
      };
    });

    const e: Edge[] = relationships.map((r, i) => ({
      id: `rel-${i}`,
      source: `char-${r.source_character_index}`,
      target: `char-${r.target_character_index}`,
      label: EDGE_LABELS[r.type] ?? r.type,
      animated: r.type === "conflict",
      style: {
        stroke: EDGE_COLORS[r.type] ?? "#8a7d6d",
        strokeWidth: 2,
        cursor: canEdit ? "pointer" : "default",
      },
      labelStyle: {
        fill: "#e8ddc4",
        fontSize: 10,
        fontWeight: 600,
      },
      labelBgStyle: {
        fill: "#1a1613",
        fillOpacity: 0.9,
      },
      labelBgPadding: [4, 2] as [number, number],
      labelBgBorderRadius: 4,
      data: { relIndex: i, type: r.type, description: r.description },
    }));

    return { nodes: n, edges: e };
  }, [characters, relationships, canEdit]);

  const onEdgeClick: EdgeMouseHandler = (_event, edge) => {
    if (!canEdit) return;
    setEditingEdge({
      id: edge.id,
      type: edge.data?.type ?? "trust",
      description: edge.data?.description ?? "",
    });
    setNewType(edge.data?.type ?? "trust");
  };

  async function handleSave() {
    if (!editingEdge) return;
    const idx = Number(editingEdge.id.replace("rel-", ""));
    const rel = relationships[idx];
    if (!rel) return;

    setSaving(true);
    try {
      // Находим relationship_id в БД по индексам
      const res = await fetch(
        `/api/campaigns/${campaignCode}/relationships?source=${rel.source_character_index}&target=${rel.target_character_index}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: newType }),
        },
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Ошибка");
      }
      router.refresh();
      setEditingEdge(null);
    } finally {
      setSaving(false);
    }
  }

  if (characters.length === 0) {
    return <p className="text-forge-muted">Нет персонажей</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 text-xs">
        {Object.entries(EDGE_LABELS).map(([type, label]) => (
          <span key={type} className="flex items-center gap-1">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ background: EDGE_COLORS[type] }}
            />
            <span className="text-forge-muted">{label}</span>
          </span>
        ))}
        {canEdit && (
          <span className="text-forge-muted ml-2">
            · клик по ребру — изменить тип
          </span>
        )}
      </div>

      <div className="h-[500px] bg-forge-bg border border-forge-border rounded-lg overflow-hidden">
        <ReactFlow nodes={nodes} edges={edges} onEdgeClick={onEdgeClick} fitView>
          <Background color="#2e2620" gap={20} />
          <Controls />
        </ReactFlow>
      </div>

      {editingEdge && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setEditingEdge(null)}
        >
          <div
            className="bg-forge-surface border border-forge-border rounded-lg max-w-md w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-forge-gold-light">
              Изменить связь
            </h2>
            <p className="text-sm text-forge-muted">{editingEdge.description}</p>
            <div>
              <label className="block text-sm text-forge-parchment mb-1.5">
                Тип связи
              </label>
              <Select value={newType} onChange={(e) => setNewType(e.target.value)}>
                {Object.entries(EDGE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setEditingEdge(null)} disabled={saving}>
                Отмена
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Сохраняем..." : "Сохранить"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}