# Content y MDX

## Stack

- **Fumadocs MDX** + Zod para frontmatter type-safe.
- Build-time compilation, TOC automático, search incluido.
- Vetado: Contentlayer (archivado mid-2024), `next-mdx-remote` para contenido del repo (runtime overhead).

## `source.config.ts`

```ts
import { defineDocs, defineConfig } from "fumadocs-mdx/config";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { z } from "zod";

const frontmatterSchema = z.object({
  title: z.string(),
  description: z.string(),
  slug: z.string(),
  order: z.number().default(999),
  type: z.enum(["lesson", "exercise", "theorem", "reference"]),
  practico: z.number().int().min(1).max(3),
  ejercicio: z.number().int().min(1),
  parts: z.array(z.string()).optional(),
  estimated_minutes: z.number().int().positive().optional(),
});

export const docs = defineDocs({
  dir: "content/fichas",
  schema: frontmatterSchema,
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkMath, remarkGfm],
    rehypePlugins: [
      [rehypeKatex, { strict: false, output: "htmlAndMathml" }],
      rehypePrettyCode,
      rehypeSlug,
      rehypeAutolinkHeadings,
    ],
  },
});
```

## `mdx-components.tsx` (root del proyecto)

```tsx
import type { MDXComponents } from "mdx/types";
import { Theorem } from "@/components/math/Theorem";
import { Definition } from "@/components/math/Definition";
import { Proof } from "@/components/math/Proof";
import { Example } from "@/components/math/Example";
import { Warning } from "@/components/math/Warning";
import { ControlQuestion } from "@/components/math/ControlQuestion";
import { Tex } from "@/components/math/Tex";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Theorem,
    Definition,
    Proof,
    Example,
    Warning,
    ControlQuestion,
    Tex,
  };
}
```

Componentes interactivos pesados (demos): import explícito en cada `.mdx`, envueltos en `<NoPrint>` wrapper para PDF.

## Frontmatter de cada ficha

```yaml
---
title: "Convexas en R: desigualdades de cuerdas"
description: "P1-Ej2: deducir las desigualdades de cuerda, secante y tangente para funciones convexas."
slug: p1-ej2
order: 1
type: exercise
practico: 1
ejercicio: 2
parts: ["a", "b", "c", "d"]
estimated_minutes: 90
---
```

## Plugins esenciales

- `remark-gfm`: tablas, task lists.
- `remark-math` + `rehype-katex`: LaTeX. KaTeX es el ganador (server-renderable, fuentes 50KB).
- `rehype-pretty-code` (Shiki-based): syntax highlighting con themes duales light/dark.
- `rehype-slug` + `rehype-autolink-headings`: ids y anchors.

## TOC automático

Fumadocs lo extrae del AST en build. Renderizar en sidebar con `IntersectionObserver` para active state.

## Estructura fija de cada ficha

1. **Motivación**: 1 párrafo + figura 3D si aplica.
2. **Definiciones y herramientas**: lo que se asume sabido.
3. **Enunciado y traducción**: enunciado tal cual del práctico + reformulado en plain text.
4. **Intuición geométrica**: figura 2D interactiva (Mafs).
5. **Demostración paso a paso**: cada paso justificado, sin saltos.
6. **Errores típicos**: 3-5 trampas concretas.
7. **Preguntas de control**: 3-5 preguntas con respuesta colapsada.
8. **Flashcard**: 1 carilla con hechos clave.

## Convenciones de escritura matemática

- **Demostraciones sin saltos.** Si decís "claramente", reescribí el paso.
- **Variables en cursiva** (KaTeX automático), constantes en redonda.
- Vectores: mantener consistencia con notas de Fiori (sin negrita por default).
- Subíndices para coordenadas: `x_1, x_2`. Supraíndices entre paréntesis para iterados: `x^{(k)}`.
- Norma euclídea: `\|x\|`. Norma 1: `\|x\|_1`.
- **`\square`** al final de cada Proof.
- Numerar theorems con CSS counters automáticos, no a mano.
- Display equations centrados con `$$ ... $$`. Inline con `$ ... $`.
- Código en Python, nunca R.
