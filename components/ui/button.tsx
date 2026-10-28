"use client";

import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type Variant = "default" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  default:
    "bg-gradient-to-b from-forge-gold to-[#9a7b1c] text-forge-bg border border-[#e8c547]/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_4px_10px_rgba(0,0,0,0.5)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_0_20px_rgba(201,162,39,0.4)]",
  outline:
    "border border-forge-gold/50 text-forge-gold bg-transparent hover:bg-forge-gold/10 hover:shadow-[0_0_15px_rgba(201,162,39,0.2)]",
  ghost: "text-forge-parchment hover:bg-forge-surface hover:text-forge-gold-light",
  danger:
    "bg-gradient-to-b from-forge-ember to-[#8a3010] text-forge-parchment border border-[#ff6b35]/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_10px_rgba(0,0,0,0.5)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_0_20px_rgba(184,69,26,0.5)]",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-8 py-3 text-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", disabled, ...props }, ref) => (
    <motion.button
      ref={ref}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-semibold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-forge-gold/50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = "Button";