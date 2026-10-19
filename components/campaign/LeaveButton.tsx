"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function LeaveButton({ campaignCode }: { campaignCode: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLeave() {
    if (!confirm("Покинуть кампанию? Ты больше не сможешь вернуться без приглашения.")) return;
    setLoading(true);
    try {
      await fetch(`/api/campaigns/${campaignCode}/leave`, { method: "POST" });
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" variant="ghost" onClick={handleLeave} disabled={loading}>
      {loading ? "Выходим..." : "Покинуть"}
    </Button>
  );
}