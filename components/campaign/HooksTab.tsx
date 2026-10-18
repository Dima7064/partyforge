import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Hook } from "@/types/generator";

const TYPE_LABEL: Record<string, string> = {
  personal: "Личный",
  social: "Социальный",
  exploration: "Исследование",
  combat: "Бой",
};

export function HooksTab({ hooks }: { hooks: Hook[] }) {
  if (hooks.length === 0) {
    return <p className="text-forge-muted">Крючки не сгенерированы.</p>;
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {hooks.map((h, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
              <span>{h.title}</span>
              <Badge variant="muted">{TYPE_LABEL[h.type] ?? h.type}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-forge-parchment leading-relaxed">
              {h.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}