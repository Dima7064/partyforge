"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { Invite } from "@/types/generator";

export function InvitesPanel({
  campaignCode,
  initialInvites,
}: {
  campaignCode: string;
  initialInvites: Invite[];
}) {
  const router = useRouter();
  const [invites, setInvites] = useState(initialInvites);
  const [role, setRole] = useState<"player" | "master">("player");
  const [maxUses, setMaxUses] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch(`/api/campaigns/${campaignCode}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          maxUses: maxUses ? Number(maxUses) : undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Ошибка");
      }
      const { data } = await res.json();
      setInvites([data, ...invites]);
      setMaxUses("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Отозвать приглашение?")) return;
    try {
      await fetch(`/api/campaigns/${campaignCode}/invites/${id}`, {
        method: "DELETE",
      });
      setInvites(invites.filter((i) => i.id !== id));
      router.refresh();
    } catch {
      alert("Не удалось отозвать");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Приглашения</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-end">
          <div className="w-full md:w-1/3">
            <Label>Роль</Label>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value as "player" | "master")}
            >
              <option value="player">Игрок</option>
              <option value="master">Мастер</option>
            </Select>
          </div>
          <div className="w-full md:w-1/3">
            <Label>Лимит использований</Label>
            <Input
              type="number"
              min={1}
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              placeholder="без лимита"
            />
          </div>
          <div className="w-full md:w-auto">
            <Button
              onClick={handleCreate}
              disabled={creating}
              className="w-full md:w-auto"
            >
              {creating ? "Создаём..." : "Создать ссылку"}
            </Button>
          </div>
        </div>

        {error && <p className="text-forge-ember text-sm">{error}</p>}

        {invites.length === 0 ? (
          <p className="text-forge-muted text-sm">Пока нет приглашений.</p>
        ) : (
          <div className="space-y-2">
            {invites.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between gap-2 p-2 border border-forge-border rounded flex-wrap"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="text-forge-gold">{inv.code}</code>
                  <Badge variant={inv.role === "master" ? "gold" : "muted"}>
                    {inv.role === "master" ? "Мастер" : "Игрок"}
                  </Badge>
                  <span className="text-xs text-forge-muted">
                    {inv.uses_count}
                    {inv.max_uses ? `/${inv.max_uses}` : ""} использований
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(inv.id)}
                >
                  Отозвать
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}