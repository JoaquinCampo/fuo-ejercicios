type FichaHeaderProps = {
  practico: 1 | 2 | 3;
  ejercicio: number;
  title: string;
  estimated_minutes?: number;
};

export function FichaHeader({
  practico,
  ejercicio,
  title,
  estimated_minutes,
}: FichaHeaderProps) {
  return (
    <header className="not-prose mb-12 pb-8 border-b border-ink-100">
      <p className="font-sans text-xs uppercase tracking-widest text-ink-500">
        Práctico {practico}, Ejercicio {ejercicio}
        {estimated_minutes != null && (
          <>
            {" · "}
            <span className="tabular-nums">~{estimated_minutes} min</span>
          </>
        )}
      </p>
      <h1 className="mt-3 font-serif text-4xl leading-tight tracking-tight text-ink-900 dark:text-ink-100">
        {title}
      </h1>
    </header>
  );
}
