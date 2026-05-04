"use client";

import {
  Mafs,
  Coordinates,
  Plot,
  Line,
  Point,
  Text,
  useMovablePoint,
  Theme,
} from "mafs";
import { useMemo, useState } from "react";
import { Tex } from "@/components/math/Tex";

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

export function PLInequalityDemo() {
  const [m, setM] = useState(0.4);

  // f(x) = (m/2) x² (mínimo en 0). f'(x) = m·x, ‖∇f‖² = m²x²
  // PL: ‖∇f(x)‖² ≥ 2m·(f(x) − f*) = 2m · (m/2)x² = m²·x². Igualdad exacta para cuadráticas.
  // Para que tenga gracia visual, usamos f(x) = (m/2) x² + (m/3)·sin(x)² o similar...
  // Más simple: cuadrática y discutir igualdad como caso límite.
  const f = (x: number) => 0.5 * m * x * x;
  const fp = (x: number) => m * x;
  const fmin = 0;

  const point = useMovablePoint([1.6, f(1.6)], {
    constrain: ([x]) => {
      const c = clamp(x ?? 1.6, -3, 3);
      return [c, f(c)];
    },
    color: Theme.indigo,
  });

  const x0 = point.point[0];
  const fx = f(x0);
  const gap = fx - fmin;
  const gradSq = fp(x0) * fp(x0);
  const ratio = gap > 1e-9 ? gradSq / (2 * m * gap) : 1;

  const tex = useMemo(
    () =>
      `\\|\\nabla f(x)\\|^2 \\;\\geq\\; 2m\\,\\big(f(x) - f(x^*)\\big)\\quad\\text{(desigualdad PL)}`,
    [],
  );

  const valuesTex = useMemo(
    () =>
      `\\|\\nabla f(x)\\|^2 = ${gradSq.toFixed(3)},\\quad 2m\\,(f(x)-f^*) = ${(2 * m * gap).toFixed(3)},\\quad \\text{ratio} = ${ratio.toFixed(2)}`,
    [gradSq, m, gap, ratio],
  );

  return (
    <div className="figure-interactive my-8">
      <div className="border border-ink-100 rounded-md overflow-hidden bg-paper">
        <Mafs viewBox={{ x: [-3.4, 3.4], y: [-1, 5] }} height={360}>
          <Coordinates.Cartesian xAxis={{ lines: 1 }} yAxis={{ lines: 1 }} />

          {/* f */}
          <Plot.OfX y={f} color={Theme.indigo} weight={2.5} />

          {/* gap vertical */}
          <Line.Segment
            point1={[x0, fmin]}
            point2={[x0, fx]}
            color={Theme.orange}
            weight={5}
          />
          <Point x={x0} y={fmin} color={Theme.green} />
          <Point x={x0} y={fx} color={Theme.indigo} />

          {/* etiqueta gap */}
          <Text
            x={x0 + 0.18}
            y={(fmin + fx) / 2}
            attach="e"
            size={13}
            color="var(--color-warning)"
          >
            {`gap = ${gap.toFixed(2)}`}
          </Text>

          {/* tangente para visualizar la pendiente */}
          <Line.Segment
            point1={[x0 - 1.2, fx - 1.2 * fp(x0)]}
            point2={[x0 + 1.2, fx + 1.2 * fp(x0)]}
            color={Theme.blue}
            weight={1.5}
            opacity={0.5}
          />
          <Text x={x0 + 1.4} y={fx + 1.4 * fp(x0)} attach="ne" size={12} color={Theme.blue}>
            {`pendiente = f'(x)`}
          </Text>

          {/* mínimo */}
          <Text x={0} y={-0.25} attach="s" size={12} color={Theme.green}>
            {`x*`}
          </Text>

          {point.element}
        </Mafs>
      </div>

      <div className="mt-4 px-4 py-3 bg-ink-100/40 rounded-md font-sans text-sm space-y-3">
        <div className="text-ink-700 text-xs uppercase tracking-wider">
          ‖∇f‖² controla el gap (caso m-fuertemente convexo)
        </div>
        <div className="text-base">
          <Tex tex={tex} />
        </div>
        <label className="block">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-mono">m</span>
            <span className="font-mono text-ink-500">{m.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={1.5}
            step={0.05}
            value={m}
            onChange={(e) => setM(Number(e.target.value))}
            className="w-full accent-accent-600"
          />
        </label>
        <div className="text-base">
          <Tex tex={valuesTex} />
        </div>
        <div className="text-xs text-ink-500">
          Para esta cuadrática f(x) = (m/2)x², la desigualdad PL es{" "}
          <em>igualdad</em> (ratio = 1): el cuadrado del gradiente es
          exactamente 2m veces el gap. Eso da la <strong>mejor</strong>{" "}
          constante posible. Para funciones más generales fuertemente
          convexas, vale la desigualdad pero la ratio puede ser &gt; 1 (la PL
          es conservadora). Movés x sobre la curva para ver cómo crece
          simultáneamente ‖∇f‖² y el gap, manteniendo la proporción.
        </div>
      </div>
    </div>
  );
}
