"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { PageLoader } from "./page-loader";

export function SmartLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <>
      {isPending && <PageLoader />}
      <div
        className="inline-block cursor-pointer"
        onClick={(e) => {
          e.preventDefault();
          startTransition(() => router.push(href));
        }}
      >
        {children}
      </div>
    </>
  );
}