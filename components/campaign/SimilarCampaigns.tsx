"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { useParams } from "next/navigation";

export function SimilarCampaigns({ currentCode }: { currentCode: string }) {
  const params = useParams();
  const locale = params.locale as string;
  const [items, setItems] = useState<{ share_code: string; title: string }[]>([]);

  useEffect(() => {
    fetch(`/api/recommendations/${currentCode}`)
      .then(r => r.json())
      .then(d => setItems(d.data || []))
      .catch(() => {});
  }, [currentCode]);

  if (items.length === 0) return null;

  return (
    <div className="space-y-3 mt-8 pt-8 border-t border-forge-border">
      <h3 className="text-xl font-semibold text-forge-gold">Похожие кампании (ML)</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {items.map(item => (
          <Link key={item.share_code} href={`/${locale}/c/${item.share_code}`}>
            <Card className="hover:border-forge-gold/50 transition-colors h-full">
              <CardContent className="p-4">
                <p className="font-semibold text-forge-parchment">{item.title}</p>
                <p className="text-xs text-forge-muted mt-1">Код: {item.share_code}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}