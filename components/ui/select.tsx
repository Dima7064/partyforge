import { SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "w-full px-3 py-2 bg-forge-bg border border-forge-border rounded-md text-forge-parchment focus:outline-none focus:ring-2 focus:ring-forge-gold/50 focus:border-forge-gold",
        className,
      )}
      {...props}
    />
  ),
);
Select.displayName = "Select";