"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { fichas } from "@/lib/content/fichas";
import { cn } from "@/lib/utils";

export function FichaSidebar() {
  const pathname = usePathname();
  const activeSlug = pathname?.replace(/^\//, "") ?? "";

  return (
    <nav
      aria-label="Fichas"
      data-no-print
      className="no-print w-60 shrink-0 border-r border-ink-100 px-6 py-8 sticky top-0 h-screen overflow-y-auto bg-paper"
    >
      <Link
        href={"/" as Route}
        className="block font-sans text-xs uppercase tracking-widest text-ink-500 hover:text-accent-700"
      >
        ← FuO 2026
      </Link>
      <ol className="mt-6 space-y-1">
        {fichas.map((f) => {
          const active = f.slug === activeSlug;
          return (
            <li key={f.slug}>
              <Link
                href={`/${f.slug}` as Route}
                className={cn(
                  "block py-2 pl-3 pr-2 -ml-3 rounded-sm font-sans text-sm leading-tight transition-colors",
                  active
                    ? "bg-accent-600/10 text-accent-700 font-medium"
                    : "text-ink-700 hover:text-accent-700 hover:bg-ink-100/50",
                )}
              >
                <span className="font-mono text-xs text-ink-500 tabular-nums mr-2">
                  {f.id}
                </span>
                {f.title}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
