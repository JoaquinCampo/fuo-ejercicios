"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Route } from "next";
import { fichas } from "@/lib/content/fichas";
import { cn } from "@/lib/utils";

export function FichaSidebar() {
  const pathname = usePathname();
  const activeSlug = pathname?.replace(/^\//, "") ?? "";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const list = (
    <ol className="mt-6 space-y-1">
      {fichas.map((f) => {
        const active = f.slug === activeSlug;
        return (
          <li key={f.slug}>
            <Link
              href={`/${f.slug}` as Route}
              onClick={() => setOpen(false)}
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
  );

  const homeLink = (
    <Link
      href={"/" as Route}
      className="block font-sans text-xs uppercase tracking-widest text-ink-500 hover:text-accent-700"
    >
      ← FuO 2026
    </Link>
  );

  return (
    <>
      {/* Mobile top bar with hamburger */}
      <div
        data-no-print
        className="no-print lg:hidden sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-ink-100 bg-paper/90 backdrop-blur px-4 py-3"
      >
        <button
          type="button"
          aria-label="Abrir índice de fichas"
          aria-expanded={open}
          aria-controls="ficha-drawer"
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center size-9 -ml-2 rounded-sm text-ink-700 hover:text-accent-700 hover:bg-ink-100/60 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5"
            aria-hidden
          >
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        </button>
        <Link
          href={"/" as Route}
          className="font-sans text-xs uppercase tracking-widest text-ink-500 hover:text-accent-700"
        >
          FuO 2026
        </Link>
        <span className="size-9" aria-hidden />
      </div>

      {/* Desktop sidebar */}
      <nav
        aria-label="Fichas"
        data-no-print
        className="no-print hidden lg:block w-60 shrink-0 border-r border-ink-100 px-6 py-8 sticky top-0 h-screen overflow-y-auto bg-paper"
      >
        {homeLink}
        {list}
      </nav>

      {/* Mobile drawer */}
      <div
        data-no-print
        className={cn(
          "no-print lg:hidden fixed inset-0 z-40 transition-opacity",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <button
          type="button"
          aria-label="Cerrar índice"
          onClick={() => setOpen(false)}
          tabIndex={open ? 0 : -1}
          className={cn(
            "absolute inset-0 bg-ink-900/40 transition-opacity",
            open ? "opacity-100" : "opacity-0",
          )}
        />
        <nav
          id="ficha-drawer"
          aria-label="Fichas"
          className={cn(
            "absolute inset-y-0 left-0 w-[82%] max-w-xs bg-paper border-r border-ink-100 px-6 py-6 overflow-y-auto shadow-xl transition-transform",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between">
            {homeLink}
            <button
              type="button"
              aria-label="Cerrar índice"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center size-8 -mr-2 rounded-sm text-ink-500 hover:text-accent-700 hover:bg-ink-100/60 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
                aria-hidden
              >
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
          </div>
          {list}
        </nav>
      </div>
    </>
  );
}
