"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type Status = "draft" | "active" | "finished";

export function SettingsForm({
  code,
  initialTitle,
  initialStatus,
}: {
  code: string;
  initialTitle: string;
  initialStatus: Status;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState<Status>(initialStatus);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch(`/api/campaigns/${code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title || undefined, status }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Удалить кампанию? Это необратимо.")) return;
    setDeleting(true);
    try {
      await fetch(`/api/campaigns/${code}`, { method: "DELETE" });
      router.push("/dashboard");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div>
        <Label htmlFor="title">Название</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Оставь пустым — сохранится текущее"
        />
      </div>
      <div>
        <Label htmlFor="status">Статус</Label>
        <Select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as Status)}
        >
          <option value="draft">Черновик</option>
          <option value="active">Активна</option>
          <option value="finished">Завершена</option>
        </Select>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button type="submit" disabled={saving}>
          {saving ? "Сохраняем..." : "Сохранить"}
        </Button>
        <Button
          type="button"
          variant="danger"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Удаляем..." : "Удалить кампанию"}
        </Button>
      </div>
    </form>
  );
}