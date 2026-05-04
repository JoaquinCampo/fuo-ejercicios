# Print y PDF export

## Estrategia

- **Playwright headless server-side** para PDFs distribuibles.
- **Print CSS bien hecho** como base.
- `window.print()` opcional como botón de "imprimir" para el usuario final, pero NO es la fuente de verdad.

Vetado: `@react-pdf/renderer` (no soporta KaTeX), `wkhtmltopdf` (legacy, sin CSS moderno).

## Print CSS

`styles/print.css`, importado en root layout:

```css
@media print {
  @page { size: A4; margin: 22mm 18mm; }
  html { font-size: 11pt; }
  body { background: white; color: black; }

  nav, aside, .no-print, button, [data-no-print] {
    display: none !important;
  }

  a[href]::after {
    content: " (" attr(href) ")";
    font-size: 0.85em;
    color: #555;
  }

  h1, h2, h3 { break-after: avoid; }
  h2 { break-before: page; }

  figure, pre, table, .callout, .katex-display {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  p { orphans: 3; widows: 3; }

  * {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  img, svg { max-width: 100% !important; }

  /* plots interactivos: ocultar y mostrar fallback estático */
  .figure-interactive { display: none; }
  .figure-static { display: block; }
}
@media screen { .figure-static { display: none; } }
```

## Reglas

- Usar `break-*` (moderno), no `page-break-*` (legacy).
- Reemplazar `vh/vw` por `mm/cm/%` en print rules.
- **Probar con contenido de 3+ páginas.** Bugs de orphans/widows aparecen ahí.
- Por cada plot interactivo, exportar fallback estático (SVG o PNG) marcado con `data-print-fallback`.
- En `?print=1`, React también debe esconder el interactivo a nivel componente, no solo CSS.
- Server-side PDF: Playwright `page.pdf({ printBackground: true, preferCSSPageSize: true })`. KaTeX renderiza correcto, CSS moderno soportado.

## Fallback de plots para print

Componente wrapper:

```tsx
"use client";
import { useSearchParams } from "next/navigation";

export function FigureSwitch({
  interactive,
  staticFallback,
}: {
  interactive: React.ReactNode;
  staticFallback: React.ReactNode;
}) {
  const params = useSearchParams();
  const print = params.get("print") === "1";
  if (print) return <div className="figure-static">{staticFallback}</div>;
  return (
    <>
      <div className="figure-interactive">{interactive}</div>
      <div className="figure-static" aria-hidden>{staticFallback}</div>
    </>
  );
}
```

`figure-static` puede ser un `<picture>` con SVG/PNG generado en build (snapshotear el plot con Mafs `Plot.OfX` exportado a SVG, o con un script Playwright auxiliar).

Para Mafs/SVG nativo, podés simplemente reusar el componente del plot: ya genera SVG estático, no hace falta snapshot.

## Script `pdf:build` con Playwright

`scripts/build-pdfs.ts`:

```ts
import { chromium } from "playwright";
import { allFichas } from "@/lib/content/fichas";
import { mkdirSync } from "node:fs";

const BASE = process.env.PDF_BASE_URL ?? "http://localhost:3000";
const OUT = "out/pdf";

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ colorScheme: "light" });

for (const ficha of allFichas) {
  const page = await ctx.newPage();
  await page.goto(`${BASE}/${ficha.slug}?print=1`, { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "print" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => !document.querySelector("[data-loading]"));
  await page.pdf({
    path: `${OUT}/${ficha.slug}.pdf`,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "22mm", bottom: "22mm", left: "18mm", right: "18mm" },
    displayHeaderFooter: true,
    footerTemplate: `<div style="font-size:9px;width:100%;text-align:center;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>`,
    headerTemplate: `<div></div>`,
  });
  await page.close();
}

await browser.close();
```

Script en `package.json`:

```json
{
  "scripts": {
    "pdf:build": "concurrently -k -s first 'next start' 'wait-on http://localhost:3000 && tsx scripts/build-pdfs.ts'"
  }
}
```

CI: usar `microsoft/playwright-github-action` o image `mcr.microsoft.com/playwright`.

## Tip

`?print=1` query param para forzar print mode en el cliente (esconder controles interactivos vía React, no solo CSS) y disparar render de fallbacks estáticos.
