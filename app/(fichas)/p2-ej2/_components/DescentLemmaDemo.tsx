"use client";

import {
  Mafs,
  Coordinates,
  Plot,
  Point,
  Text,
  useMovablePoint,
  Theme,
} from "mafs";
import { useMemo, useState } from "react";
import { Tex } from "@/components/math/Tex";

const f = (x: number) => 0.5 * x * x + 0.3 * Math.sin(x);
const fp = (x: number) => x + 0.3 * Math.cos(x);

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

export function DescentLemmaDemo() {
  const [L, setL] = useState(1.3);

  const center = useMovablePoint([-1.4, f(-1.4)], {
    constrain: ([x]) => {
      const c = clamp(x ?? -1.4, -3, 3);
      return [c, f(c)];
    },
    color: Theme.indigo,
  });

  const x0 = center.point[0];
  const fx0 = f(x0);
  const fpx0 = fp(x0);

  const q = (y: number) => fx0 + fpx0 * (y - x0) + (L / 2) * (y - x0) * (y - x0);
  const tangent = (y: number) => fx0 + fpx0 * (y - x0);

  const tex = useMemo(
    () =>
      `f(y) \\;\\leq\\; \\underbrace{f(x) + \\langle \\nabla f(x), y - x\\rangle}_{\\text{tangente}} + \\underbrace{\\tfrac{L}{2}\\,\\|y - x\\|^2}_{\\text{cuadr\\'atica}}`,
    [],
  );

  const minLValid = 1.3;

  return (
    <div className="figure-interactive my-8">
      <div className="border border-ink-100 rounded-md overflow-hidden bg-paper">
        <Mafs viewBox={{ x: [-3.4, 3.4], y: [-2, 6.5] }} height={420}>
          <Coordinates.Cartesian xAxis={{ lines: 1 }} yAxis={{ lines: 1 }} />

          <Plot.OfX y={f} color={Theme.indigo} weight={2.5} />
          <Plot.OfX y={tangent} color={Theme.blue} weight={1.5} opacity={0.5} />
          <Plot.OfX y={q} color={Theme.orange} weight={2.5} />

          <Point x={x0} y={fx0} color={Theme.indigo} />

          <Text x={x0} y={fx0 - 0.4} attach="s" size={13}>
            {`x`}
          </Text>

          <Text
            x={2.7}
            y={q(2.7) + 0.25}
            attach="n"
            size={13}
            color="var(--color-warning)"
          >
            {`cota cuadrática`}
          </Text>

          <Text x={2.7} y={f(2.7) - 0.3} attach="s" size={13} color={Theme.indigo}>
            {`f`}
          </Text>

          {center.element}
        </Mafs>
      </div>

      <div className="mt-4 px-4 py-3 bg-ink-100/40 rounded-md font-sans text-sm space-y-3">
        <div className="text-ink-700 text-xs uppercase tracking-wider">
          Cota cuadrática del lema de descenso
        </div>
        <div className="text-base">
          <Tex tex={tex} />
        </div>
        <label className="block">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-mono">L</span>
            <span className="font-mono text-ink-500">{L.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={0.4}
            max={3}
            step={0.05}
            value={L}
            onChange={(e) => setL(Number(e.target.value))}
            className="w-full accent-accent-600"
          />
        </label>
        <div className="text-xs text-ink-500">
          La curva{" "}
          <span style={{ color: "var(--color-indigo, #6359e9)" }}>indigo</span>{" "}
          es f(y), la línea azul tenue es la tangente en x, y la curva{" "}
          <span style={{ color: "var(--color-warning)" }}>naranja</span> es la
          cota cuadrática f(x) + f'(x)(y−x) + (L/2)(y−x)². Para esta f, el
          mínimo L válido es ≈ {minLValid.toFixed(2)} (el máximo de f''). Si
          bajás L por debajo, la cuadrática se cae bajo f en algún punto y la
          cota deja de ser válida. Movés x sobre la curva para ver cómo cambia
          la cota en cada punto.
        </div>
      </div>
    </div>
  );
}
