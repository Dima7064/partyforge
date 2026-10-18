import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  CharacterLocation,
  Faction,
  Location,
  Npc,
} from "@/types/generator";

const ATTITUDE_LABEL: Record<string, string> = {
  ally: "Союзник",
  enemy: "Враг",
  neutral: "Нейтрал",
};

const ROLE_LABEL: Record<string, string> = {
  ally: "Союзник",
  enemy: "Враг",
  neutral: "Нейтрал",
};

const CONNECTION_LABEL: Record<string, string> = {
  born: "родился",
  lost: "потерял кого-то",
  served: "служил",
  dreams: "мечтает попасть",
};

export function WorldTab({
  locations,
  factions,
  npcs,
  character_locations,
  situation,
}: {
  locations: Location[];
  factions: Faction[];
  npcs: Npc[];
  character_locations: CharacterLocation[];
  situation: string;
}) {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Ситуация</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-forge-parchment">{situation}</p>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-forge-gold">Локации</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {locations.map((l, i) => {
            const links = character_locations.filter(
              (cl) => cl.location_index === i,
            );
            return (
              <Card key={i}>
                <CardHeader>
                  <CardTitle>{l.name}</CardTitle>
                  <p className="text-xs text-forge-muted uppercase tracking-wide">
                    {l.type}
                  </p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-forge-parchment">{l.description}</p>
                  {links.length > 0 && (
                    <div className="text-xs text-forge-muted">
                      Связаны:{" "}
                      {links
                        .map(
                          (cl) =>
                            `персонаж #${cl.character_index + 1} (${CONNECTION_LABEL[cl.connection_type] ?? cl.connection_type})`,
                        )
                        .join(", ")}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-forge-gold">Фракции</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {factions.map((f, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  <span>{f.name}</span>
                  <Badge
                    variant={f.attitude === "enemy" ? "ember" : "muted"}
                  >
                    {ATTITUDE_LABEL[f.attitude] ?? f.attitude}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-forge-parchment">{f.description}</p>
                <p className="text-xs text-forge-muted">Цель: {f.goals}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-forge-gold">NPC</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {npcs.map((n, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  <span>{n.name}</span>
                  <Badge variant={n.role === "enemy" ? "ember" : "muted"}>
                    {ROLE_LABEL[n.role] ?? n.role}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-forge-parchment">{n.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}