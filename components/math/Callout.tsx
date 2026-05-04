import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "theorem" | "definition" | "proof" | "example" | "warning";

const variantStyles: Record<Variant, string> = {
  theorem: "border-l-theorem bg-theorem-soft/30 dark:bg-theorem/10",
  definition: "border-l-definition bg-definition-soft/30 dark:bg-definition/10",
  proof: "border-l-proof bg-transparent",
  example: "border-l-example bg-example-soft/25 dark:bg-example/10",
  warning: "border-l-warning bg-warning-soft/25 dark:bg-warning/10",
};

const variantLabels: Record<Variant, string> = {
  theorem: "Teorema",
  definition: "Definición",
  proof: "Demostración",
  example: "Ejemplo",
  warning: "Atención",
};

export function Callout({
  variant,
  title,
  children,
}: {
  variant: Variant;
  title?: string | undefined;
  children: ReactNode;
}) {
  const label = title ?? variantLabels[variant];
  const isProof = variant === "proof";
  return (
    <aside
      data-callout={variant}
      className={cn(
        "my-8 border-l-2 pl-5 py-1",
        variantStyles[variant],
      )}
    >
      <p className="font-sans text-xs uppercase tracking-wider font-semibold text-ink-700 dark:text-ink-200 mb-2">
        {isProof ? (
          <>
            <span data-proof-label>{label}</span>
          </>
        ) : (
          <span data-callout-label={variant}>{label}</span>
        )}
      </p>
      <div className="prose-callout">{children}</div>
      {isProof && (
        <p className="mt-3 text-right text-ink-600" aria-hidden>
          {"∎"}
        </p>
      )}
    </aside>
  );
}
