"use client";

import { useMemo } from "react";
import Image from "next/image";
import ReactFlow, {
  Background,
  Controls,
  type Edge,
  type Node,
} from "reactflow";
import "reactflow/dist/style.css";
import type { Character, Relationship } from "@/types/generator";

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

function CharacterNode({ character }: { character: Character }) {
  return (
    <div
      style={{
        background: "#1a1613",
        border: "1px solid #c9a227",
        borderRadius: 8,
        padding: 6,
        width: 140,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        color: "#e8ddc4",
        fontSize: 11,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          overflow: "hidden",
          background: "#0f0d0a",
          border: "1px solid #2e2620",
        }}
      >
        {character.image_url ? (
          <Image
            src={character.image_url}
            alt={character.name}
            width={64}
            height={64}
            style={{ objectFit: "cover", width: "100%", height: "100%" }}
            unoptimized
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              color: "#c9a227",
            }}
          >
            {character.name.charAt(0)}
          </div>
        )}
      </div>
      <div style={{ fontWeight: 600, lineHeight: 1.2 }}>{character.name}</div>
      <div style={{ fontSize: 10, color: "#8a7d6d" }}>{character.class_name}</div>
    </div>
  );
}

export function RelationshipsGraph({
  characters,
  relationships,
}: {
  characters: Character[];
  relationships: Relationship[];
}) {
  const { nodes, edges } = useMemo(() => {
    const n: Node[] = characters.map((c, i) => {
      const angle = (2 * Math.PI * i) / characters.length;
      const radius = 180;
      return {
        id: `char-${i}`,
        position: {
          x: 250 + radius * Math.cos(angle),
          y: 200 + radius * Math.sin(angle),
        },
        data: { character: c },
        type: "default",
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
    }));

    return { nodes: n, edges: e };
  }, [characters, relationships]);

  if (characters.length === 0) {
    return <p className="text-forge-muted">Нет персонажей</p>;
  }

  return (
    <div className="h-[500px] bg-forge-bg border border-forge-border rounded-lg overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodeTypes={{
          default: ({ data }: { data: { character: Character } }) => (
            <CharacterNode character={data.character} />
          ),
        }}
      >
        <Background color="#2e2620" gap={20} />
        <Controls />
      </ReactFlow>
    </div>
  );
}