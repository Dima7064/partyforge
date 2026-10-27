"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function GuestBanner({ authenticated }: { authenticated: boolean }) {
  const pathname = usePathname();

  // Не показываем на страницах входа/регистрации и для залогиненных
  if (authenticated) return null;
  if (pathname === "/login" || pathname === "/register") return null;

  return (
    <div className="bg-forge-surface border-b border-forge-border text-forge-parchment text-sm">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-3 flex-wrap">
        <span className="text-forge-muted">
          Вы просматриваете SagaForge как гость. Зарегистрируйтесь, чтобы
          создавать кампании, оценивать и сохранять в библиотеку.
        </span>
        <Link
          href="/register"
          className="text-forge-gold hover:underline font-medium shrink-0"
        >
          Зарегистрироваться
        </Link>
      </div>
    </div>
  );
}