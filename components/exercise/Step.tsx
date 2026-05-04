"use client";

import {
  Children,
  isValidElement,
  useId,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

function isWhyElement(node: ReactNode): node is ReactElement<{
  children?: ReactNode;
}> {
  if (!isValidElement(node)) return false;
  const props = node.props as { ["data-why"]?: unknown } | null;
  return Boolean(props && props["data-why"]);
}

export function Step({
  children,
  n,
  title,
}: {
  children: ReactNode;
  n?: number | undefined;
  title?: string | undefined;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const whys: ReactNode[] = [];
  const body: ReactNode[] = [];
  for (const c of Children.toArray(children)) {
    if (isWhyElement(c)) {
      whys.push(c.props.children);
    } else {
      body.push(c);
    }
  }
  const hasWhy = whys.length > 0;

  return (
    <div
      className="proof-step grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 my-4"
      data-step={n}
    >
      <div className="step-num shrink-0 size-6 rounded-full bg-accent-500/15 text-accent-700 text-xs font-semibold flex items-center justify-center mt-0.5 select-none">
        {n ?? "•"}
      </div>
      <div className="min-w-0">
        {title ? (
          <div className="step-title font-sans text-xs uppercase tracking-wider text-ink-700 mb-1">
            {title}
          </div>
        ) : null}
        <div className="step-body">{body}</div>
        {hasWhy ? (
          <>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls={panelId}
              className="why-toggle no-print mt-2 inline-flex items-center gap-1.5 text-xs font-sans text-accent-600 hover:text-accent-700 hover:underline underline-offset-2 transition-colors"
            >
              <span aria-hidden className="font-mono text-[0.65rem]">
                {open ? "▾" : "▸"}
              </span>
              <span>{open ? "ocultar explicación" : "¿por qué?"}</span>
            </button>
            <div
              id={panelId}
              className={`why-body mt-2 px-4 py-3 bg-paper-soft border-l-2 border-accent-400/70 text-sm text-ink-700 rounded-sm ${
                open ? "" : "hidden print:block"
              }`}
              role="region"
              aria-label="Explicación del paso"
            >
              <div className="why-label hidden print:block font-sans text-[0.65rem] uppercase tracking-wider text-accent-700 mb-1.5">
                ¿Por qué?
              </div>
              {whys}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
