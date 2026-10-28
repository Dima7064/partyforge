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
  const [published, setPublished] = useState(false);

  async function handlePublish() {
    if (!confirm("Опубликовать кампанию в общем каталоге? Её смогут увидеть и скопировать другие пользователи.")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignCode}/publish`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Ошибка публикации");
      
      show("success", "Кампания опубликована в каталоге!");
      setPublished(true);
      router.refresh();
    } catch (e) {
      show("error", "Не удалось опубликовать");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-forge-gold/50 bg-forge-gold/5 relative overflow-visible">
      <CardContent className="p-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="font-semibold text-forge-gold-light font-serif text-lg">Публичный каталог</p>
          <p className="text-sm text-forge-muted">Поделитесь кампанией с сообществом. Другие смогут её скопировать.</p>
        </div>
        
        {published ? (
          <div className="wax-seal w-16 h-16 text-3xl rotate-12 transform">
            S
          </div>
        ) : (
          <Button onClick={handlePublish} disabled={loading} variant="danger">
            {loading ? "Публикуем..." : "Опубликовать"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}