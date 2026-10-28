"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen p-8 flex flex-col items-center justify-center">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-3xl font-bold text-forge-ember">
          Что-то пошло не так
        </h1>
        <p className="text-forge-muted">
          Не удалось загрузить каталог. Попробуй ещё раз.
        </p>
        <Button onClick={reset}>Повторить</Button>
      </div>
    </main>
  );
}