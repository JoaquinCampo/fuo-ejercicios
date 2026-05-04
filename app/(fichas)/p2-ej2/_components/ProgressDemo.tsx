"use client";

import {
  Mafs,
  Coordinates,
  Plot,
  Point,
  Line,
  Text,
  Theme,
} from "mafs";
import { useMemo, useState } from "react";
import { Tex } from "@/components/math/Tex";

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

export function ProgressDemo() {
  const [L, setL] = useState(1);
  const [alpha, setAlpha] = useState(1);

  const g = (a: number) => a - (L / 2) * a * a;

  const aMax = 2 / L;
  const aOpt = 1 / L;
  const gOpt = 1 / (2 * L);

  const aClamped = clamp(alpha, 0, aMax * 1.4);
  const gAtAlpha = g(aClamped);

  const tex = useMemo(
    () =>
      `f(x_{k+1}) - f(x_k) \\;\\leq\\; -\\,\\big(\\alpha - \\tfrac{L}{2}\\alpha^2\\big)\\,\\|\\nabla f(x_k)\\|^2`,
    [],
  );

  const valuesTex = useMemo(
    () =>
      `\\alpha = ${aClamped.toFixed(3)},\\quad \\alpha - \\tfrac{L}{2}\\alpha^2 = ${gAtAlpha.toFixed(3)},\\quad \\tfrac{2}{L} = ${aMax.toFixed(2)},\\quad \\tfrac{1}{L} = ${aOpt.toFixed(2)}`,
    [aClamped, gAtAlpha, aMax, aOpt],
  );

  const yMax = Math.max(0.7, 1.4 / L);
  const xMax = Math.max(2.6, aMax * 1.3);

  return (
    <div className="figure-interactive my-8">
      <div className="border border-ink-100 rounded-md overflow-hidden bg-paper">
        <Mafs
          viewBox={{ x: [-0.3, xMax], y: [-yMax * 0.6, yMax] }}
          height={360}
        >
          <Coordinates.Cartesian xAxis={{ lines: 1 }} yAxis={{ lines: 1 }} />

          <Plot.OfX y={g} color={Theme.indigo} weight={2.5} />

          {/* zona de descenso (0, 2/L) sombreada con segmento */}
          <Line.Segment
            point1={[0, 0]}
            point2={[aMax, 0]}
            color={Theme.green}
            weight={4}
          />

          {/* α óptimo y g_max */}
          <Line.Segment
            point1={[aOpt, 0]}
            point2={[aOpt, gOpt]}
            color={Theme.green}
            weight={1.5}
            opacity={0.6}
            style="dashed"
          />
          <Point x={aOpt} y={gOpt} color={Theme.green} />
          <Text
            x={aOpt}
            y={gOpt + 0.06}
            attach="n"
            size={13}
            color={Theme.green}
          >
            {`α* = 1/L,  máx = 1/(2L)`}
          </Text>

          {/* α actual */}
          <Line.Segment
            point1={[aClamped, 0]}
            point2={[aClamped, gAtAlpha]}
            color={Theme.orange}
            weight={3}
          />
          <Point x={aClamped} y={gAtAlpha} color={Theme.orange} />
          <Text
            x={aClamped + 0.08}
            y={gAtAlpha}
            attach="e"
            size={13}
            color="var(--color-warning)"
          >
            {`α = ${aClamped.toFixed(2)}`}
          </Text>

          {/* etiquetas eje */}
          <Text x={aMax} y={-0.05} attach="s" size={12} color={Theme.green}>
            {`2/L`}
          </Text>
        </Mafs>
      </div>

      <div className="mt-4 px-4 py-3 bg-ink-100/40 rounded-md font-sans text-sm space-y-3">
        <div className="text-ink-700 text-xs uppercase tracking-wider">
          Factor de progreso por iteración
        </div>
        <div className="text-base">
          <Tex tex={tex} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-mono">L</span>
              <span className="font-mono text-ink-500">{L.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.3}
              max={4}
              step={0.05}
              value={L}
              onChange={(e) => setL(Number(e.target.value))}
              className="w-full accent-accent-600"
            />
          </label>
          <label className="block">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-mono">α</span>
              <span className="font-mono text-ink-500">
                {aClamped.toFixed(3)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={xMax}
              step={0.01}
              value={aClamped}
              onChange={(e) => setAlpha(Number(e.target.value))}
              className="w-full accent-accent-600"
            />
          </label>
        </div>
        <div className="text-base">
          <Tex tex={valuesTex} />
        </div>
        <div className="text-xs text-ink-500">
          La curva es g(α) = α − (L/2)α². Es positiva en{" "}
          <span style={{ color: "var(--color-success, #16a34a)" }}>
            (0, 2/L)
          </span>{" "}
          (zona de descenso garantizado), se anula en α = 0 y α = 2/L, y se
          maximiza en α = 1/L con valor 1/(2L). Por eso el paso "óptimo" para
          la cota es α = 1/L. Tomar α &gt; 2/L hace g &lt; 0: la cota ya no
          garantiza descenso.
        </div>
      </div>
    </div>
  );
}
