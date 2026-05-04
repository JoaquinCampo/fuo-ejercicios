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

          {/* Línea vertical guía en xbar (de eje x al punto más alto) */}
          <Line.Segment
            point1={[xbar, 0]}
            point2={[xbar, ybar]}
            color={Theme.indigo}
            opacity={0.25}
            weight={1}
            style="dashed"
          />

          {/* Gap entre f(xbar) y ybar (la barra naranja) */}
          <Line.Segment
            point1={[xbar, fxbar]}
            point2={[xbar, ybar]}
            color={Theme.orange}
            weight={5}
          />

          {/* Punto sobre la curva: f(Σλᵢxᵢ) - lado izquierdo de Jensen */}
          <Point x={xbar} y={fxbar} color={Theme.indigo} />

          {/* Punto Σλᵢf(xᵢ) - lado derecho de Jensen */}
          <Point x={xbar} y={ybar} color={Theme.orange} />

          {/* Etiquetas xi pegadas a los puntos en la curva */}
          <Text x={x1} y={f1 + 0.35} attach="n" size={14}>
            {`x_1`}
          </Text>
          <Text x={x2} y={f2 + 0.35} attach="n" size={14}>
            {`x_2`}
          </Text>
          <Text x={x3} y={f3 + 0.35} attach="n" size={14}>
            {`x_3`}
          </Text>

          {/* Etiqueta del lado derecho de Jensen (Σλᵢf(xᵢ)) */}
          <Text
            x={xbar + 0.18}
            y={ybar}
            attach="e"
            size={13}
            color="var(--color-warning)"
          >
            {`Σ λᵢ f(xᵢ) = ${ybar.toFixed(2)}`}
          </Text>

          {/* Etiqueta del lado izquierdo de Jensen (f(Σλᵢxᵢ)) */}
          <Text
            x={xbar + 0.18}
            y={fxbar}
            attach="e"
            size={13}
            color={Theme.indigo}
          >
            {`f(Σ λᵢ xᵢ) = ${fxbar.toFixed(2)}`}
          </Text>

          {/* Etiqueta de xbar en el eje */}
          <Text x={xbar} y={-0.15} attach="s" size={12}>
            {`x̄ = ${xbar.toFixed(2)}`}
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
          Los dos puntos están alineados verticalmente en x̄ = Σλᵢxᵢ. El{" "}
          <span style={{ color: "var(--color-indigo, #6359e9)" }}>
            azul
          </span>{" "}
          es f(x̄), el lado izquierdo de Jensen. El{" "}
          <span style={{ color: "var(--color-warning)" }}>naranja</span> es
          Σλᵢf(xᵢ), el lado derecho. La barra mide el gap entre ellos. Para f
          convexa, el naranja siempre queda arriba del azul (gap ≥ 0).
          Movés los puntos sobre la curva o cambiás los pesos λᵢ y ves el gap
          en vivo.
        </div>
      </div>
    </div>
  );
}
