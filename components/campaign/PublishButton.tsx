"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/lib/hooks/useToast";

export function PublishButton({ campaignCode }: { campaignCode: string }) {
  const router = useRouter();
  const { show } = useToast();
  const [loading, setLoading] = useState(false);

  async function handlePublish() {
    if (!confirm("Опубликовать кампанию в общем каталоге? Её смогут увидеть и скопировать другие пользователи.")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignCode}/publish`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Ошибка публикации");
      
      show("success", "Кампания опубликована в каталоге!");
      router.refresh();
    } catch (e) {
      show("error", "Не удалось опубликовать");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-forge-gold/50 bg-forge-gold/5">
      <CardContent className="p-4 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="font-semibold text-forge-gold-light">Публичный каталог</p>
          <p className="text-sm text-forge-muted">Поделитесь кампанией с сообществом. Другие смогут её скопировать.</p>
        </div>
        <Button onClick={handlePublish} disabled={loading}>
          {loading ? "Публикуем..." : "Опубликовать"}
        </Button>
      </CardContent>
    </Card>
  );
}