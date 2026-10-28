"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Select } from "@/components/ui/select";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value;
    const newPathname = pathname.replace(`/${locale}`, `/${nextLocale}`);
    router.replace(newPathname);
  };

  return (
    <Select value={locale} onChange={handleChange} className="w-20 bg-forge-bg text-forge-parchment border-forge-border">
      <option value="ru">RU</option>
      <option value="en">EN</option>
    </Select>
  );
}