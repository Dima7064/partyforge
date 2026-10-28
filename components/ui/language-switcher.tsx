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
    <div className="fixed top-4 right-4 z-[9999] flex items-center bg-forge-surface p-1 rounded-lg border border-forge-border shadow-lg">
      <Select 
        value={locale} 
        onChange={handleChange} 
        className="w-20 bg-forge-bg text-forge-parchment border-none focus:ring-0 text-sm font-semibold"
      >
        <option value="ru">RU</option>
        <option value="en">EN</option>
      </Select>
    </div>
  );
}