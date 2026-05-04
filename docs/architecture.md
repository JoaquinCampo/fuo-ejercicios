# Architecture

## File structure

```
ejercicios/
├── app/                              # rutas únicamente
│   ├── layout.tsx                    # root layout, fuentes, Providers
│   ├── page.tsx                      # home con plan y links a fichas
│   ├── (fichas)/
│   │   ├── layout.tsx                # layout con sidebar
│   │   ├── p1-ej2/
│   │   │   ├── page.mdx
│   │   │   └── _components/          # privados de la ficha (_  = no route)
│   │   └── ...
│   └── globals.css
├── components/
│   ├── ui/                           # shadcn primitives, no editar
│   ├── math/                         # Tex, Theorem, Definition, Proof, etc.
│   ├── viz/                          # Mafs2D, R3FCanvas, primitives/
│   ├── exercise/                     # FichaHeader, FichaLayout, Flashcard
│   ├── layout/                       # Sidebar, TOC, PrintButton
│   └── providers/                    # Providers.tsx (único cliente global)
├── content/fichas/                   # MDX de cada ficha (Fumadocs)
├── lib/
│   ├── math/                         # solvers puros y testeables (gd, hb, etc)
│   └── content/                      # registry tipado
├── styles/print.css
├── public/
│   ├── figures/                      # PNGs/SVGs estáticos
│   └── manim/                        # MP4/WebM
├── scripts/build-pdfs.ts
├── mdx-components.tsx                # registro global de componentes MDX
├── source.config.ts                  # config Fumadocs
├── next.config.ts
└── tsconfig.json
```

**Reglas duras:**

- `app/` solo rutas. Componentes privados van en `app/.../route/_components/`.
- Single alias: `"@/*": ["./*"]`.
- Sin barrel files. Importar paths directos.
- Naming: `kebab-case` archivos, `PascalCase` exports, `camelCase` vars.

## App Router patterns

- **Server Component por default. `"use client"` solo en hojas.** Cada KB cliente es JS desperdiciado en una clase de matemática estática.
- **Pushear `"use client"` hacia abajo, no arriba.** Boundary cliente en `layout.tsx` envenena todo el árbol.
- **Datos del server por props, no context.** Context no cruza la boundary.
- **`params` / `searchParams` son `Promise`:**
  ```ts
  export default async function Page({
    params,
  }: {
    params: Promise<{ slug: string }>;
  }) {
    const { slug } = await params;
  }
  ```
- **`generateStaticParams` para todas las fichas conocidas.** Son finitas.
- Co-locar `loading.tsx`, `error.tsx`, `not-found.tsx`. No reinventar Suspense/ErrorBoundary.
- **PPR incremental** (`experimental.ppr = "incremental"`) para rutas mixtas estática + dinámica.
- **Mutations: Server Actions.** Cerrar con `revalidatePath` o `revalidateTag`. Nunca envolver `redirect()` en try/catch.

## `next.config.ts` mínimo

```ts
import type { NextConfig } from "next";
import { withFumadocsMDX } from "fumadocs-mdx/next";

const config: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  experimental: { ppr: "incremental" },
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },
};

export default withFumadocsMDX()(config);
```

## Performance

- `next/font` con `display: "swap"`, un solo weight subset. Self-hosted.
- `next/image` para todo raster. SVGs como React inline.
- Plots y demos: `dynamic(..., { ssr: false })`.
- Memoizar data de plots con `useMemo` keyed en parámetros.
- Throttle de slider: `requestAnimationFrame` coalescing, no `lodash.debounce`.
- Field denso (level sets, vector fields): canvas/WebGL, no SVG.

## Anti-patterns

- `"use client"` en `app/layout.tsx`. Hacé un `<Providers>` cliente hijo.
- React Context para pasar data del server.
- `useEffect` para fetchear cuando un Server Component puede en render.
- Catch de `redirect()` en try/catch.
- Llamar Route Handlers propios desde Server Components (importá directo).
- Olvidar `revalidatePath` después de Server Action.
- `dynamic(..., { ssr: false })` adentro de un Server Component (prohibido en 15+).
- Re-runs del optimizador en el render loop.
- `setState` por iteración en plots animados.
- Mezclar Plotly con Mafs.
