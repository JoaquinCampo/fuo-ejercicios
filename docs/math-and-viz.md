# Math rendering y visualizaciones

## KaTeX, formula rendering

### Estático (en MDX)

`source.config.ts`:

```ts
import { defineDocs, defineConfig } from "fumadocs-mdx/config";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

export const docs = defineDocs({ dir: "content/fichas" });

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

En `app/layout.tsx` importar `katex/dist/katex.min.css` una sola vez.

### Dinámico (depende de slider)

```tsx
// components/math/Tex.tsx
"use client";
import katex from "katex";

export function Tex({ tex, block = false }: { tex: string; block?: boolean }) {
  const html = katex.renderToString(tex, {
    displayMode: block,
    throwOnError: false,
    output: "htmlAndMathml",
  });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
```

Uso:
```tsx
<Tex tex={`f(${x.toFixed(2)}) = ${(x*x).toFixed(3)}`} />
```

**Vetado**: MathJax, `react-katex` (innecesario, mantenimiento dudoso).

## Plots 2D, regla: **Mafs**

```tsx
"use client";
import { Mafs, Coordinates, Plot, Line, useMovablePoint } from "mafs";
import "mafs/core.css";

export function ConvexityChordDemo() {
  const a = useMovablePoint([1, 1], { constrain: ([x]) => [x, x * x] });
  const b = useMovablePoint([4, 16], { constrain: ([x]) => [x, x * x] });
  return (
    <Mafs viewBox={{ x: [-1, 5], y: [-2, 18] }} preserveAspectRatio={false}>
      <Coordinates.Cartesian />
      <Plot.OfX y={(x) => x * x} />
      <Line.Segment point1={a.point} point2={b.point} color="red" />
      {a.element}
      {b.element}
    </Mafs>
  );
}
```

- Declarativo, hecho para math educativo, drag points nativos.
- `useMovablePoint([x, y], { constrain: "horizontal" | fn })` es el killer feature.
- Limitación: SVG, >5k puntos lagea. Para fields densos, abrí `<CustomGraphics>` con canvas overlay.
- **No usar Plotly** ni Recharts. Si Mafs no puede algo, abrí canvas escape hatch.

## Plots 3D, regla: **react-three-fiber + drei**

```tsx
"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Line } from "@react-three/drei";

export function ParaboloidWithChord() {
  return (
    <Canvas camera={{ position: [4, 4, 4], fov: 45 }} frameloop="demand">
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <Grid args={[10, 10]} cellColor="#cbd5e1" />
      <mesh geometry={paraboloidGeometry}>
        <meshStandardMaterial color="#3B82F6" transparent opacity={0.35} wireframe />
      </mesh>
      <Line
        points={[[-1.5, 3.25, -1], [1.5, 3.25, 1]]}
        color="red"
        lineWidth={3}
      />
      <OrbitControls />
    </Canvas>
  );
}
```

### Reglas duras de R3F

- **Nunca `setState` en `useFrame`.** Mutá refs (`pointRef.current.position.set(...)`).
- `frameloop="demand"` por default. Switch a `"always"` solo cuando hay animación corriendo.
- Pre-computar trayectorias del optimizador con `useMemo`. **Nunca** correr el algoritmo dentro del render loop.
- Heavy 3D montado con `next/dynamic` y `ssr: false`.
- Helpers de drei: `OrbitControls`, `Grid`, `Line`, `Text`, `Html`, `PerspectiveCamera`. `leva` solo para dev-time knobs.
- Drag de puntos: `@use-gesture/react` + raycaster, o `<PivotControls>` / `<DragControls>` de drei.

## Animación de algoritmos

```tsx
const trajectory = useMemo(
  () => runGD(f, grad, x0, lr, steps),
  [f, grad, x0, lr, steps],
);

const idx = useRef(0);
useFrame((_, dt) => {
  idx.current = Math.min(idx.current + dt * speed, trajectory.length - 1);
  pointRef.current.position.set(...trajectory[Math.floor(idx.current)]);
});
```

- Computar la secuencia ITERADA una sola vez (es determinística), animar playback indexando.
- **Nunca** llamar `setState` por frame.
- Skip Framer Motion para math; es para tweens de UI (paneles, tooltips).

## Sliders con escala log

```tsx
const toLog = (t: number, lo: number, hi: number) => lo * Math.pow(hi / lo, t);

// learning rate ∈ [1e-4, 10]:
//   slider.value = t ∈ [0,1]
//   actual = toLog(t, 1e-4, 10)

// momentum cerca de 1:
//   actual = 1 - Math.pow(10, -k * t)
//   da sensibilidad en la zona de β ~ 0.99
```

- Radix Slider vía shadcn para a11y, keyboard, multi-thumb.
- **Nunca bakear "log mode" dentro del componente del slider.** El slider expone `t ∈ [0, 1]`; el mapeo lo hacés afuera.

## Manim

- Pre-renderizar a MP4 + WebM, servir con `<video>` con poster.
- Usar para **conceptos pesados que se miran una vez** (proximal operator geometry, ADMM splitting, dualidad de Lagrange).
- **No usar** para algo donde el estudiante deba poder ajustar parámetros (eso es Mafs/R3F).
- Regla: Manim cinematic intro → KaTeX statement → Mafs/R3F sandbox.

## Performance de viz

- Memoizar plot data con `useMemo` keyed en parámetros.
- Throttle de slider: `requestAnimationFrame` coalescing, **no** `lodash.debounce` (agrega latencia).
- Field denso: canvas/WebGL + fragment shader sampling. R3F + shader es GPU-fast para heatmaps.
- `frameloop="demand"` en idle. Mount heavy 3D dentro de `dynamic(..., { ssr: false })`.
- Pre-computar trayectorias. **Nunca** correr el optimizador en el render loop.

## Código de ejemplo

Cuando una ficha incluya código, **siempre Python**, nunca R. Bloques con highlighting de `rehype-pretty-code`, language `python`.

```python
import numpy as np

def gradient_descent(grad, x0, lr=0.01, steps=100):
    x = np.asarray(x0, dtype=float)
    traj = [x.copy()]
    for _ in range(steps):
        x = x - lr * grad(x)
        traj.append(x.copy())
    return np.asarray(traj)
```

## TL;DR stack

- Static math: `remark-math` + `rehype-katex`
- Dynamic math: `katex.renderToString` wrapper
- 2D viz: `mafs`
- 3D viz: `@react-three/fiber` + `@react-three/drei` + `@use-gesture/react`
- Controls: Radix Slider vía shadcn, mapeo log custom
- Cinematics: Manim pre-renderizado MP4/WebM
- Avoid: Plotly, MathJax, react-katex, Framer Motion para plot animation, threlte
