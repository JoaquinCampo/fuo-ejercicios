# CLAUDE.md

Webapp educativa para preparar la prueba escrita de Fundamentos de Optimización 2026 (IMERL, FIng) del 8 de mayo. Una ruta por ejercicio "en papel". Cada ficha es autocontenida con motivación, definiciones, intuición geométrica, demostración paso a paso, errores típicos, preguntas de control y flashcard.

El contenido es el protagonista. La interactividad se agrega solo cuando aporta a la comprensión, no como decoración. Cada ficha debe ser legible aunque la persona desactive JavaScript.

## Stack

| Capa | Herramienta |
|---|---|
| Framework | Next.js 16 App Router |
| Lenguaje | TypeScript estricto |
| Estilos | Tailwind v4 con `@theme` en CSS |
| UI primitives | shadcn/ui sobre Radix |
| Contenido | Fumadocs MDX + Zod |
| Math estático | `remark-math` + `rehype-katex` |
| Math dinámico | `katex.renderToString` wrapper |
| Plots 2D | Mafs (`mafs.dev`) |
| Plots 3D | `@react-three/fiber` + `@react-three/drei` |
| Sliders | Radix Slider (vía shadcn), mapeo log custom |
| Animaciones UI | Framer Motion (solo paneles/tooltips) |
| Cinemáticas | Manim pre-renderizado |
| PDF | Playwright headless + print CSS |
| Package manager | pnpm |

## Vetado

- MathJax, Plotly, Recharts, react-katex, Contentlayer, `next-mdx-remote`, `@react-pdf/renderer`, `wkhtmltopdf`, threlte.
- Barrel files (`index.ts` re-exports).
- Framer Motion para animar plots de algoritmos (usá `useFrame` + ref).
- `"use client"` en `app/layout.tsx`.
- `any`. `unknown` solo en boundaries con narrow inmediato vía Zod.

## Hard rules

- **Server Component por default.** `"use client"` solo en hojas, pushear hacia abajo.
- **Datos del server pasan por props, no por context** (no cruza la boundary).
- `params` y `searchParams` son `Promise` en Next 15+, siempre `await`.
- `generateStaticParams` para todas las fichas conocidas.
- **Sin barrel files.** Imports directos: `@/components/math/Theorem`.
- Single import alias `"@/*": ["./*"]`.
- **Body 17px, line-height 1.7, max-width 68ch** para prose. Hard rule.
- Sans (Inter) para chrome, serif (IBM Plex Serif) para prose.
- Una sola accent color, sin arcoíris.
- KaTeX configurado con `output: "htmlAndMathml"` para a11y.
- WCAG AA mínimo: 4.5:1 body, 3:1 large text.
- `prefers-reduced-motion`: gateá Framer Motion y animaciones de algoritmo.
- Nunca `setState` dentro de `useFrame` de R3F. Mutá refs.
- Pre-computar trayectorias de optimizadores con `useMemo`. Nunca correr el algoritmo en el render loop.
- `dynamic(..., { ssr: false })` para todo plot/demo pesado.
- `print-color-adjust: exact` siempre, hide nav/sidebar/buttons en print.
- **Código de ejemplo en Python**, nunca R. El curso usa Python (notas de Fiori, programa oficial). Bloques con `pretty-code` en lenguaje `python`.

## Naming

- Archivos y carpetas: `kebab-case`.
- Exports de componentes: `PascalCase`.
- Funciones y variables: `camelCase`.

## Estructura de cada ficha (orden fijo)

1. Motivación (figura 3D si aplica)
2. Definiciones y herramientas
3. Enunciado y traducción
4. Intuición geométrica (figura 2D interactiva)
5. Demostración paso a paso
6. Errores típicos
7. Preguntas de control (con respuesta colapsable)
8. Flashcard de cierre

## Documentación detallada

Antes de tocar un área, leé el doc correspondiente:

- [`docs/architecture.md`](./docs/architecture.md) — File structure, App Router patterns, performance, anti-patterns.
- [`docs/typescript.md`](./docs/typescript.md) — `tsconfig.json`, branded types, satisfies, Server Actions tipadas.
- [`docs/styling.md`](./docs/styling.md) — Tailwind v4 tokens (`@theme`), tipografía, paleta OKLCH, callouts, accesibilidad, anti-AI.
- [`docs/math-and-viz.md`](./docs/math-and-viz.md) — KaTeX setup, Mafs (2D), R3F (3D), sliders log, performance de viz.
- [`docs/content-mdx.md`](./docs/content-mdx.md) — Fumadocs MDX, frontmatter Zod, `mdx-components.tsx`, plugins remark/rehype, convenciones de escritura matemática.
- [`docs/print-pdf.md`](./docs/print-pdf.md) — Print CSS, fallbacks estáticos para plots, script `pdf:build` con Playwright.

## Comandos

```bash
pnpm dev             # next dev (Turbopack)
pnpm build           # next build
pnpm start           # next start (necesario antes de pdf:build)
pnpm lint            # eslint
pnpm typecheck       # tsc --noEmit
pnpm pdf:build       # genera PDFs en out/pdf/
```

## Decisiones abiertas

- Idioma: español rioplatense únicamente.
- Sin login, sin persistencia, sin comentarios de usuario en esta iteración.
- Si una decisión que vas a tomar contradice algo de este archivo o de `docs/`, pará y discutamos antes de implementar.
