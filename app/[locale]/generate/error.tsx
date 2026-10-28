"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-3xl font-bold text-forge-ember">
          Ошибка генерации
        </h1>
        <p className="text-forge-muted">
          {error.message || "Что-то пошло не так. Попробуй ещё раз."}
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>Повторить</Button>
          <Link href="/">
            <Button variant="outline">На главную</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}