import Link from "next/link";
import type { Route } from "next";
import { fichas } from "@/lib/content/fichas";

export default function Home() {
  return (
    <main className="prose mx-auto px-5 py-10 sm:px-6 sm:py-16">
      <header className="mb-10 sm:mb-16">
        <p className="font-sans text-xs sm:text-sm uppercase tracking-wider text-ink-500">
          Fundamentos de Optimización 2026
        </p>
        <h1 className="mt-2 font-serif text-3xl sm:text-4xl leading-tight tracking-tight text-balance">
          Fichas para la prueba escrita
        </h1>
        <p className="mt-4 text-base sm:text-lg text-ink-700">
          Diez ejercicios candidatos a caer en la prueba del 8 de mayo. Cada ficha
          es autocontenida: motivación, definiciones, demostración paso a paso,
          errores típicos, preguntas de control y flashcard.
        </p>
      </header>

      <section className="not-prose">
        <ol className="divide-y divide-ink-100 border-y border-ink-100">
          {fichas.map((f) => (
            <li key={f.slug}>
              <Link
                href={`/${f.slug}` as Route}
                className="group flex items-baseline gap-3 sm:gap-6 py-4 sm:py-5 transition-colors hover:bg-ink-50/60"
              >
                <span className="font-mono text-xs sm:text-sm tabular-nums text-ink-500 w-12 sm:w-16 shrink-0">
                  {f.id}
                </span>
                <span className="flex-1 min-w-0 font-serif text-base sm:text-lg group-hover:text-accent-700">
                  {f.title}
                </span>
                <span className="font-sans text-xs text-ink-500 tabular-nums shrink-0">
                  ~{f.estimated_minutes}m
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
