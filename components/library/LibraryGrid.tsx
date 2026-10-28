"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/lib/hooks/useToast";

const TYPE_LABEL: Record<string, string> = {
  all: "Все",
  name: "Имена",
  npc: "NPC",
  location: "Локации",
  campaign: "Кампании",
};

export function LibraryGrid({ campaigns }: { campaigns: any[] }) {
  const router = useRouter();
  const { show } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  
  const [useModalOpen, setUseModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedCampaign, setSelectedCampaign] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/library?type=${filter}`)
      .then(r => r.json())
      .then(d => setItems(d.data || []))
      .catch(() => show("error", "Не удалось загрузить библиотеку"))
      .finally(() => setLoading(false));
  }, [filter, show]);

  async function handleDelete(id: string) {
    if (!confirm("Удалить из библиотеки?")) return;
    await fetch(`/api/library/${id}`, { method: "DELETE" });
    setItems(items.filter(i => i.id !== id));
    show("success", "Удалено");
  }

  async function handleUse() {
    if (!selectedCampaign) return;
    try {
      const res = await fetch("/api/library/use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: selectedItem.id, campaignId: selectedCampaign }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      show("success", "Объект добавлен в кампанию!");
      setUseModalOpen(false);
    } catch (e) {
      show("error", e instanceof Error ? e.message : "Ошибка");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {Object.entries(TYPE_LABEL).map(([k, v]) => (
          <Button
            key={k}
            size="sm"
            variant={filter === k ? "default" : "outline"}
            onClick={() => setFilter(k)}
          >
            {v}
          </Button>
        ))}
      </div>

      {loading ? (
        <p className="text-forge-muted">Загрузка...</p>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-forge-muted">
            В этой категории пока пусто. Сгенерируйте что-нибудь и сохраните сюда!
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2 flex-wrap text-base">
                  <span>{item.name}</span>
                  <Badge variant="muted">{TYPE_LABEL[item.type] || item.type}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-forge-parchment line-clamp-3">
                  {item.data?.description || item.data?.value || "Объект без описания"}
                </p>
                <div className="flex gap-2 pt-2">
                  {(item.type === "npc" || item.type === "location") && (
                    <Button size="sm" variant="outline" onClick={() => { setSelectedItem(item); setUseModalOpen(true); }}>
                      В кампанию
                    </Button>
                  )}
                  <Button size="sm" variant="danger" onClick={() => handleDelete(item.id)}>
                    Удалить
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={useModalOpen}
        onClose={() => setUseModalOpen(false)}
        title="Использовать в кампании"
        footer={
          <>
            <Button variant="ghost" onClick={() => setUseModalOpen(false)}>Отмена</Button>
            <Button onClick={handleUse} disabled={!selectedCampaign}>Добавить</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-forge-parchment">Выберите кампанию, куда добавить объект:</p>
          {campaigns.length === 0 ? (
            <p className="text-forge-ember text-sm">У вас нет кампаний, где вы мастер.</p>
          ) : (
            <Select value={selectedCampaign} onChange={e => setSelectedCampaign(e.target.value)}>
              <option value="" disabled>-- Выберите --</option>
              {campaigns.map(c => (
                <option key={c.id} value={c.id}>{c.title} ({c.share_code})</option>
              ))}
            </Select>
          )}
        </div>
      </Modal>
    </div>
  );
}