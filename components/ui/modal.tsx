"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = `modal-title-${Math.random().toString(36).slice(2, 8)}`;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      const first = dialogRef.current?.querySelector<HTMLElement>(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
      );
      first?.focus();
    }, 80);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const maxW =
    size === "sm" ? "max-w-md" : size === "lg" ? "max-w-4xl" : "max-w-2xl";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/70 overflow-y-auto"
          onClick={onClose}
          role="presentation"
        >
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              key="dialog"
              ref={dialogRef}
              initial={{ opacity: 0, scale: 0.9, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className={cn(
                "bg-forge-surface border border-forge-border rounded-lg w-full",
                maxW,
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-forge-border">
                <h2
                  id={titleId}
                  className="text-xl font-bold text-forge-gold-light"
                >
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  aria-label="Закрыть"
                  className="text-forge-muted hover:text-forge-parchment text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              <div className="p-5 max-h-[70vh] overflow-y-auto">{children}</div>
              {footer && (
                <div className="p-4 border-t border-forge-border flex gap-2 justify-end flex-wrap">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}