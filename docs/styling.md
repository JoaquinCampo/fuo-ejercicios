# Styling, design system, accesibilidad

## Tailwind v4 setup

`app/globals.css`:

```css
@import "tailwindcss";

@theme {
  /* paleta OKLCH para uniformidad perceptual y dark mode sin banding */
  --color-paper: oklch(0.99 0.005 90);
  --color-paper-dark: oklch(0.18 0.015 260);
  --color-ink-900: oklch(0.18 0.02 260);
  --color-ink-700: oklch(0.32 0.02 260);
  --color-ink-500: oklch(0.50 0.02 260);
  --color-ink-300: oklch(0.78 0.01 260);
  --color-ink-100: oklch(0.94 0.005 260);
  --color-accent-600: oklch(0.55 0.15 250);
  --color-theorem: oklch(0.55 0.12 260);
  --color-definition: oklch(0.50 0.03 250);
  --color-example: oklch(0.55 0.12 160);
  --color-warning: oklch(0.65 0.15 70);

  --font-sans: "Inter Variable", ui-sans-serif, system-ui, sans-serif;
  --font-serif: "IBM Plex Serif", Georgia, serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  /* escala modular 1.2, body 17px */
  --text-xs: 0.78rem;
  --text-sm: 0.875rem;
  --text-base: 1.0625rem;
  --text-lg: 1.25rem;
  --text-xl: 1.5rem;
  --text-2xl: 1.875rem;
  --text-3xl: 2.375rem;

  --leading-prose: 1.7;
  --leading-tight: 1.3;
}

@variant dark (&:where(.dark, .dark *));

html {
  font-family: var(--font-sans);
  background: var(--color-paper);
  color: var(--color-ink-900);
}

.prose {
  font-family: var(--font-serif);
  font-size: var(--text-base);
  line-height: var(--leading-prose);
  max-width: 68ch;
  margin-inline: auto;
  font-feature-settings: "ss01", "cv11";
  font-variant-numeric: lining-nums tabular-nums;
}

.katex { white-space: nowrap; }
```

## Tipografía

- **Body 17px (no 16px), line-height 1.7, max-width 68ch.** Hard rule.
- Sans (Inter Variable) para chrome/UI, serif (IBM Plex Serif) para prose. Texto matemático en serif crea autoridad de libro.
- KaTeX renderiza en Computer Modern por default. **No forzar fuente sans en math.**
- Mono: JetBrains Mono o IBM Plex Mono con `font-feature-settings: "ss02", "cv02"` para `0/O/1/l` inequívocos.
- Escala modular 1.2: 14 / 17 / 20 / 24 / 30 / 38 / 48.
- Headings line-height 1.3, math display blocks 1.5.
- Habilitar `font-variant-numeric: lining-nums tabular-nums` en contenido numérico.

## Color

- Background: warm off-white `oklch(0.99 0.005 90)`, no white puro. Dark: `oklch(0.18 0.015 260)`.
- Text: `oklch(0.22 0.02 260)`. Nunca black puro contra paper warm.
- **Una sola accent.** Sin arcoíris.
- Callouts con `border-left: 2px solid` + tinted bg, label small caps. Sin rounded corners, sin full fills.
  - Theorem: indigo `oklch(0.55 0.12 260)`
  - Definition: slate `oklch(0.50 0.03 250)`
  - Proof: neutral, italic, termina con `\square` (`∎`)
  - Example: emerald `oklch(0.55 0.12 160)`
  - Warning: amber `oklch(0.65 0.15 70)`

## Reglas Tailwind

- **Sin arbitrary values** (`w-[437px]`) salvo one-offs justificados. Si lo querés repetir, agregalo a `@theme`.
- Container queries (`@container`, `@sm:`) sobre media queries para layouts de fichas.
- Dark mode: ambas paletas como sets completos, no overrides por componente.
- Tailwind v4 breakers: `bg-gradient-to-*` → `bg-linear-to-*`; `!important` con suffix (`bg-red-500!`).

## shadcn/ui organization

- `components/ui/`: shadcn primitives sin tocar.
- `components/`: composiciones de la app (`TheoremCallout`, `FichaHeader`, `ProofToggle`).
- `components/blocks/`: page-level (`FichaLayout`, `TOCSidebar`).
- **Nunca editar `components/ui/*`** para añadir styling de producto. Wrappear y componer. Tokens manejan theming.
- Usar Radix Tooltip + Dialog para definition popovers y figure expansion.

## Accesibilidad

- WCAG AA mínimo: 4.5:1 body, 3:1 large text y UI.
- KaTeX con `output: "htmlAndMathml"`. NVDA + MathCAT navegan las fórmulas. `aria-label` en cada `katex-display` describiendo en prosa.
- Focus visible global: `focus-visible:ring-2 ring-accent-600 ring-offset-2 ring-offset-paper`. Nunca remover outlines sin reemplazo.
- Semantic HTML: `<article>` por ficha, `<section>` por bloque, `<h1>` único, headings monotónicos. `<figure><figcaption>` por figura.
- `prefers-reduced-motion`: gateá Framer Motion con `useReducedMotion()`. Si reduced motion, plot va al estado final sin animar.
- Keyboard: `[`/`]` para prev/next ficha, `/` para focus search, arrow keys en TOC.

## Reading UX

- Single-column prose, `max-w-[68ch] mx-auto`, gutters generosos para marginalia (Tufte sidenotes en `xl:`).
- Vertical rhythm: cada bloque múltiplo de `0.5rem`. `space-y-6` entre párrafos, `space-y-10` antes de H2.
- H2: serif, 30px, `mt-16 mb-4`, hairline `border-b border-ink-900/10`.
- Code/equation blocks: `bg-ink-900/[0.03]`, sin border, `px-4 py-3`, copy button on hover.
- Inline math nunca rompe línea (`white-space: nowrap` en `.katex`).
- Numerar theorems con CSS counters, no manualmente.

## Anti-AI / personalidad

- Single-column con TOC marginal en `xl:`. **No** centered card on gradient hero.
- **Sin emojis decorativos**, sin pills cluster, sin glassmorphism, sin gradient buttons, sin Lucide circle-check everywhere.
- Headers serif italic running con nombre del capítulo.
- Numeración de theorems via CSS counters, no a mano.
- Asimetría: TOC izquierda angosto, prose offset.
- Test del logo: tapá el wordmark. ¿Sigue sintiéndose como esta app? Si no, falta personalidad.
