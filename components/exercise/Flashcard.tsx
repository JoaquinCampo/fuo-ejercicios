import type { ReactNode } from "react";

export function Flashcard({
  title = "Flashcard",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section
      data-flashcard
      className="not-prose my-12 p-6 border-2 border-accent-600 rounded-md bg-accent-600/[0.03] print:break-before-page"
    >
      <p className="font-sans text-xs uppercase tracking-widest text-accent-700 mb-4">
        {title}
      </p>
      <div className="font-serif text-base leading-prose space-y-4">
        {children}
      </div>
    </section>
  );
}
