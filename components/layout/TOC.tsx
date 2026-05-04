"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type TocItem = { id: string; text: string; level: 2 | 3 };

export function TOC() {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const article = document.querySelector("article.prose");
    if (!article) return;

    const headings = Array.from(
      article.querySelectorAll<HTMLElement>("h2, h3"),
    );
    const list: TocItem[] = headings
      .filter((h) => h.id)
      .map((h) => ({
        id: h.id,
        text: h.textContent ?? "",
        level: h.tagName === "H2" ? 2 : 3,
      }));
    setItems(list);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible?.target instanceof HTMLElement) {
          setActiveId(visible.target.id);
        }
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 },
    );
    headings.forEach((h) => h.id && observer.observe(h));
    return () => observer.disconnect();
  }, []);

  if (items.length === 0) return null;

  return (
    <aside
      data-no-print
      className="no-print hidden xl:block w-56 shrink-0 px-4 py-12 sticky top-0 self-start max-h-screen overflow-y-auto"
    >
      <p className="font-sans text-xs uppercase tracking-widest text-ink-500 mb-3">
        En esta ficha
      </p>
      <ul className="space-y-1.5 border-l border-ink-100">
        {items.map((it) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              className={cn(
                "block py-1 pl-3 -ml-px border-l-2 border-transparent font-sans text-sm transition-colors leading-snug",
                it.level === 3 && "pl-6 text-xs",
                activeId === it.id
                  ? "border-l-accent-600 text-accent-700 font-medium"
                  : "text-ink-500 hover:text-ink-900 hover:border-l-ink-300",
              )}
            >
              {it.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
