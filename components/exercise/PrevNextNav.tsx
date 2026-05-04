import Link from "next/link";
import type { Route } from "next";
import { fichas } from "@/lib/content/fichas";

export function PrevNextNav({ currentSlug }: { currentSlug: string }) {
  const idx = fichas.findIndex((f) => f.slug === currentSlug);
  if (idx === -1) return null;
  const prev = idx > 0 ? fichas[idx - 1] : null;
  const next = idx < fichas.length - 1 ? fichas[idx + 1] : null;

  return (
    <nav
      aria-label="Navegación entre fichas"
      data-no-print
      className="not-prose no-print mt-16 sm:mt-20 pt-6 sm:pt-8 border-t border-ink-100 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
    >
      <div>
        {prev ? (
          <Link
            href={`/${prev.slug}` as Route}
            className="group block rounded-md border border-ink-100 hover:border-accent-600 transition-colors px-4 py-3"
          >
            <p className="font-sans text-xs uppercase tracking-wider text-ink-500 group-hover:text-accent-700">
              ← Anterior · {prev.id}
            </p>
            <p className="mt-1 font-serif text-base text-ink-900 dark:text-ink-100">
              {prev.title}
            </p>
          </Link>
        ) : (
          <span className="block px-4 py-3" />
        )}
      </div>
      <div>
        {next ? (
          <Link
            href={`/${next.slug}` as Route}
            className="group block rounded-md border border-ink-100 hover:border-accent-600 transition-colors px-4 py-3 text-right"
          >
            <p className="font-sans text-xs uppercase tracking-wider text-ink-500 group-hover:text-accent-700">
              Siguiente · {next.id} →
            </p>
            <p className="mt-1 font-serif text-base text-ink-900 dark:text-ink-100">
              {next.title}
            </p>
          </Link>
        ) : (
          <span className="block px-4 py-3" />
        )}
      </div>
    </nav>
  );
}
