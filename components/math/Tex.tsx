"use client";

import katex from "katex";
import { useMemo } from "react";

export function Tex({ tex, block = false }: { tex: string; block?: boolean }) {
  const html = useMemo(
    () =>
      katex.renderToString(tex, {
        displayMode: block,
        throwOnError: false,
        output: "htmlAndMathml",
      }),
    [tex, block],
  );

  if (block) {
    return (
      <span
        className="katex-display block"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
