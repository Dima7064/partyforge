"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type ToastKind = "success" | "error" | "info" | "achievement";

export interface Toast {
  id: string;
  kind: ToastKind;
  title: string;
  description?: string;
  achievementIcon?: string;
}

interface ToastContextValue {
  toasts: Toast[];
  show: (
    kind: ToastKind,
    title: string,
    description?: string,
    achievementIcon?: string,
  ) => void;
  showAchievement: (name: string, description: string, icon: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (
      kind: ToastKind,
      title: string,
      description?: string,
      achievementIcon?: string,
    ) => {
      const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [
        ...prev,
        { id, kind, title, description, achievementIcon },
      ]);
      const duration = kind === "achievement" ? 6500 : 4500;
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const showAchievement = useCallback(
    (name: string, description: string, icon: string) => {
      show("achievement", name, description, icon);
    },
    [show],
  );

  const value = useMemo(
    () => ({ toasts, show, showAchievement, dismiss }),
    [toasts, show, showAchievement, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}