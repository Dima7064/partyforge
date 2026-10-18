import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "gold" | "ember" | "muted";

const variants: Record<Variant, string> = {
  gold: "bg-forge-gold/15 text-forge-gold border-forge-gold/30",
  ember: "bg-forge-ember/15 text-forge-ember border-forge-ember/30",
  muted: "bg-forge-surface text-forge-muted border-forge-border",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export function Badge({ className, variant = "gold", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
