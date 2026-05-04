"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ControlQuestion({
  n,
  question,
  children,
}: {
  n?: number;
  question: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      data-control-question
      className="my-6 border border-ink-200 rounded-md overflow-hidden bg-paper-soft dark:bg-paper-dark-soft"
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        className="w-full flex items-baseline gap-3 text-left px-4 py-3 hover:bg-ink-100/40 dark:hover:bg-ink-800/30 transition-colors"
      >
        {n != null && (
          <span className="font-mono text-xs text-ink-500 tabular-nums shrink-0">
            Q{n}
          </span>
        )}
        <span className="flex-1 font-serif text-base">{question}</span>
        <span
          aria-hidden
          className={cn(
            "font-mono text-xs text-ink-500 transition-transform",
            open && "rotate-90",
          )}
        >
          {"›"}
        </span>
      </button>
      {open && (
        <div className="px-4 py-4 border-t border-ink-200 font-serif text-base">
          {children}
        </div>
      )}
      {/* en print, mostrar siempre la respuesta */}
      <div className="hidden print:block px-4 py-4 border-t border-ink-200 font-serif text-base">
        {children}
      </div>
    </div>
  );
}
