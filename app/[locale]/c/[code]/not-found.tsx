import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-6xl font-bold text-forge-gold-light">404</h1>
        <p className="text-forge-parchment text-lg">
          Кампания не найдена. Возможно, код неверный или кампания удалена.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/">
            <Button>На главную</Button>
          </Link>
          <Link href="/generate">
            <Button variant="outline">Создать новую</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}