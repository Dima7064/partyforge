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
    "bg-forge-gold text-forge-bg hover:bg-forge-gold-light hover:shadow-[0_0_24px_rgba(201,162,39,0.45)]",
  outline:
    "border border-forge-gold text-forge-gold hover:bg-forge-gold/10 hover:shadow-[0_0_20px_rgba(201,162,39,0.3)]",
  ghost: "text-forge-parchment hover:bg-forge-surface",
  danger:
    "bg-forge-ember text-forge-parchment hover:bg-forge-ember/80 hover:shadow-[0_0_20px_rgba(184,69,26,0.45)]",
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
      whileHover={disabled ? undefined : { scale: 1.03 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-semibold transition-[background-color,box-shadow] duration-200 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-forge-gold/50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";