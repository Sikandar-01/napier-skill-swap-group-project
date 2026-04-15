"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

type ToastContextValue = {
  showToast: (message: string, variant?: ToastVariant) => void;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const VARIANT_STYLES: Record<
  ToastVariant,
  { border: string; bg: string; text: string; icon: React.ReactNode }
> = {
  success: {
    border: "border-green-600/80",
    bg: "bg-green-950/95",
    text: "text-green-100",
    icon: <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400" />,
  },
  error: {
    border: "border-red-600/80",
    bg: "bg-red-950/95",
    text: "text-red-100",
    icon: <XCircle className="h-5 w-5 shrink-0 text-red-400" />,
  },
  info: {
    border: "border-blue-600/80",
    bg: "bg-blue-950/95",
    text: "text-blue-100",
    icon: <Info className="h-5 w-5 shrink-0 text-blue-400" />,
  },
  warning: {
    border: "border-amber-600/80",
    bg: "bg-amber-950/95",
    text: "text-amber-100",
    icon: <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />,
  },
};

const DEFAULT_DURATION_MS: Record<ToastVariant, number> = {
  success: 4500,
  error: 8000,
  info: 5000,
  warning: 6000,
};

function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[200] flex max-h-[min(80vh,420px)] w-[min(calc(100vw-2rem),380px)] flex-col gap-2 overflow-y-auto p-0"
      aria-live="polite"
      aria-relevant="additions text"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => {
          const s = VARIANT_STYLES[t.variant];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm ${s.border} ${s.bg}`}
              role="status"
            >
              {s.icon}
              <p className={`min-w-0 flex-1 text-sm leading-snug ${s.text}`}>
                {t.message}
              </p>
              <button
                type="button"
                onClick={() => onDismiss(t.id)}
                className={`shrink-0 rounded-lg p-1 transition-colors hover:bg-white/10 ${s.text}`}
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismissToast = useCallback((id: string) => {
    const t = timers.current.get(id);
    if (t) {
      clearTimeout(t);
      timers.current.delete(id);
    }
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToasts((prev) => [...prev, { id, message, variant }]);
      const ms = DEFAULT_DURATION_MS[variant];
      const timer = setTimeout(() => dismissToast(id), ms);
      timers.current.set(id, timer);
    },
    [dismissToast],
  );

  useEffect(() => {
    return () => {
      timers.current.forEach((t) => clearTimeout(t));
      timers.current.clear();
    };
  }, []);

  const value = useMemo(
    () => ({ showToast, dismissToast }),
    [showToast, dismissToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
