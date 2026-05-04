import Link from "next/link";
import type { Route } from "next";
import { fichas } from "@/lib/content/fichas";

export default function Home() {
  return (
    <main className="prose mx-auto px-6 py-16">
      <header className="mb-16">
        <p className="font-sans text-sm uppercase tracking-wider text-ink-500">
          Fundamentos de Optimización 2026
        </p>
        <h1 className="mt-2 font-serif text-4xl leading-tight tracking-tight">
          Fichas para la prueba escrita
        </h1>
        <p className="mt-4 text-lg text-ink-700">
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
                className="group flex items-baseline gap-6 py-5 transition-colors hover:bg-ink-50/60"
              >
                <span className="font-mono text-sm tabular-nums text-ink-500 w-16">
                  {f.id}
                </span>
                <span className="flex-1 font-serif text-lg group-hover:text-accent-700">
                  {f.title}
                </span>
                <span className="font-sans text-xs text-ink-500 tabular-nums">
                  ~{f.estimated_minutes} min
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
