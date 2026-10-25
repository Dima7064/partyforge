"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/lib/hooks/useToast";

const ICONS: Record<string, string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
};

const COLORS: Record<string, string> = {
  success: "border-forge-gold text-forge-gold",
  error: "border-forge-ember text-forge-ember",
  info: "border-forge-muted text-forge-parchment",
};

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      <AnimatePresence>
        {toasts.map((t) => {
          if (t.kind === "achievement") {
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 120, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 120, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                role="status"
                className="pointer-events-auto bg-gradient-to-r from-forge-gold/25 via-forge-surface to-forge-surface border-2 border-forge-gold rounded-lg p-4 shadow-2xl flex items-center gap-3"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.15 }}
                  className="text-4xl shrink-0"
                >
                  {t.achievementIcon || "🏆"}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-forge-gold uppercase tracking-wider font-bold">
                    Достижение получено
                  </p>
                  <p className="text-sm font-bold text-forge-gold-light mt-0.5">
                    {t.title}
                  </p>
                  {t.description && (
                    <p className="text-xs text-forge-muted mt-0.5">
                      {t.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  aria-label="Закрыть уведомление"
                  className="text-forge-muted hover:text-forge-parchment text-lg shrink-0"
                >
                  ×
                </button>
              </motion.div>
            );
          }

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 80 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              role="status"
              className={`pointer-events-auto bg-forge-surface border rounded-lg p-3 shadow-lg flex items-start gap-3 ${COLORS[t.kind]}`}
            >
              <span className="text-lg font-bold">{ICONS[t.kind]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-forge-parchment">
                  {t.title}
                </p>
                {t.description && (
                  <p className="text-xs text-forge-muted mt-1">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Закрыть уведомление"
                className="text-forge-muted hover:text-forge-parchment"
              >
                ×
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}