import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full px-3 py-2 bg-forge-bg border border-forge-border rounded-md text-forge-parchment placeholder:text-forge-muted focus:outline-none focus:ring-2 focus:ring-forge-gold/50 focus:border-forge-gold",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";