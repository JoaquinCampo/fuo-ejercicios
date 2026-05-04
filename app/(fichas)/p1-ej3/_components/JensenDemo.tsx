"use client";

import {
  Mafs,
  Coordinates,
  Plot,
  Line,
  Point,
  Polygon,
  Text,
  useMovablePoint,
  Theme,
} from "mafs";
import { useMemo, useState } from "react";
import { Tex } from "@/components/math/Tex";

const f = (x: number) => 0.3 * x * x + 0.5;
const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

export function JensenDemo() {
  const p1 = useMovablePoint([-2.5, f(-2.5)], {
    constrain: ([x]) => {
      const c = clamp(x ?? -2.5, -3, 3.5);
      return [c, f(c)];
    },
    color: Theme.blue,
  });
  const p2 = useMovablePoint([0.3, f(0.3)], {
    constrain: ([x]) => {
      const c = clamp(x ?? 0.3, -3, 3.5);
      return [c, f(c)];
    },
    color: Theme.blue,
  });
  const p3 = useMovablePoint([2.7, f(2.7)], {
    constrain: ([x]) => {
      const c = clamp(x ?? 2.7, -3, 3.5);
      return [c, f(c)];
    },
    color: Theme.blue,
  });

  const [weights, setWeights] = useState<readonly [number, number, number]>([
    1 / 3,
    1 / 3,
    1 / 3,
  ]);

  const setWeight = (idx: 0 | 1 | 2, v: number) => {
    const clamped = clamp(v, 0, 1);
    const j = ((idx + 1) % 3) as 0 | 1 | 2;
    const k = ((idx + 2) % 3) as 0 | 1 | 2;
    const sumOthers = weights[j] + weights[k];
    const remaining = 1 - clamped;
    const next: [number, number, number] = [...weights] as [
      number,
      number,
      number,
    ];
    next[idx] = clamped;
    if (sumOthers > 1e-9) {
      next[j] = (weights[j] * remaining) / sumOthers;
      next[k] = (weights[k] * remaining) / sumOthers;
    } else {
      next[j] = remaining / 2;
      next[k] = remaining / 2;
    }
    setWeights(next);
  };

  const x1 = p1.point[0];
  const x2 = p2.point[0];
  const x3 = p3.point[0];
  const f1 = f(x1);
  const f2 = f(x2);
  const f3 = f(x3);

  const xbar = weights[0] * x1 + weights[1] * x2 + weights[2] * x3;
  const ybar = weights[0] * f1 + weights[1] * f2 + weights[2] * f3;
  const fxbar = f(xbar);
  const gap = ybar - fxbar;

  const inequalityTex = useMemo(
    () =>
      `f\\!\\left(\\textstyle\\sum \\lambda_i x_i\\right) = ${fxbar.toFixed(2)} \\;\\leq\\; ${ybar.toFixed(2)} = \\textstyle\\sum \\lambda_i f(x_i)`,
    [fxbar, ybar],
  );

  return (
    <div className="figure-interactive my-8">
      <div className="border border-ink-100 rounded-md overflow-hidden bg-paper">
        <Mafs viewBox={{ x: [-3.4, 3.7], y: [-0.5, 4.5] }} height={420}>
          <Coordinates.Cartesian xAxis={{ lines: 1 }} yAxis={{ lines: 1 }} />

          <Plot.OfX y={f} color={Theme.indigo} weight={2.5} />

          {/* Triángulo formado por los 3 puntos del gráfico */}
          <Polygon
            points={[
              [x1, f1],
              [x2, f2],
              [x3, f3],
            ]}
            color={Theme.red}
            fillOpacity={0.08}
            weight={1.5}
          />

          {/* Gap entre f(xbar) y ybar */}
          <Line.Segment
            point1={[xbar, fxbar]}
            point2={[xbar, ybar]}
            color={Theme.orange}
            weight={5}
          />

          {/* Punto sobre la curva en xbar */}
          <Point x={xbar} y={fxbar} color={Theme.indigo} />

          {/* Punto del lado derecho de Jensen */}
          <Point
            x={xbar}
            y={ybar}
            color={Theme.orange}
            svgCircleProps={{ fill: "white", strokeWidth: 2 }}
          />

          {/* Etiquetas xi en eje */}
          <Text x={x1} y={-0.25} attach="s" size={13}>
            {`x_1`}
          </Text>
          <Text x={x2} y={-0.25} attach="s" size={13}>
            {`x_2`}
          </Text>
          <Text x={x3} y={-0.25} attach="s" size={13}>
            {`x_3`}
          </Text>
          <Text
            x={xbar}
            y={-0.05}
            attach="n"
            size={12}
            color="var(--color-warning)"
          >
            {`x̄`}
          </Text>

          {/* Etiqueta del gap */}
          <Text
            x={xbar + 0.15}
            y={(fxbar + ybar) / 2}
            attach="e"
            size={13}
            color="var(--color-warning)"
          >
            {`gap = ${gap.toFixed(2)}`}
          </Text>

          {p1.element}
          {p2.element}
          {p3.element}
        </Mafs>
      </div>

      <div className="mt-4 px-4 py-3 bg-ink-100/40 rounded-md font-sans text-sm space-y-3">
        <div className="text-ink-700 text-xs uppercase tracking-wider">
          Pesos convexos (suman 1)
        </div>
        <div className="grid grid-cols-3 gap-4">
          {([0, 1, 2] as const).map((i) => (
            <label key={i} className="block">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-mono">λ{i + 1}</span>
                <span className="font-mono text-ink-500">
                  {weights[i].toFixed(3)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={weights[i]}
                onChange={(e) => setWeight(i, Number(e.target.value))}
                className="w-full accent-accent-600"
              />
            </label>
          ))}
        </div>
        <div className="text-base pt-1">
          <Tex tex={inequalityTex} />
        </div>
        <div className="text-xs text-ink-500">
          Arrastrá los puntos x₁, x₂, x₃ sobre la curva y movés los pesos λᵢ.
          El triángulo rojo es el casco convexo de los puntos imagen; el lado
          derecho de Jensen, Σλᵢ f(xᵢ), siempre cae <em>dentro</em> de él.
          El segmento naranja mide la separación con f(Σλᵢxᵢ), el lado
          izquierdo. Para f convexa, el gap es siempre ≥ 0.
        </div>
      </div>
    </div>
  );
}
