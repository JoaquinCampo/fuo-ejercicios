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

function softThreshold(w: number, kappa: number): number {
  if (w > kappa) return w - kappa;
  if (w < -kappa) return w + kappa;
  return 0;
}

export function SoftThresholdingDemo() {
  const [kappa, setKappa] = useState(0.6);

  const wPoint = useMovablePoint([1.4, 0], {
    constrain: ([x]) => [clamp(x ?? 1.4, -3, 3), 0],
    color: Theme.indigo,
  });
  const w = wPoint.point[0];
  const z = softThreshold(w, kappa);

  // φ(t) = κ |t| + ½ (t − w)². ϕ'(t) en t > 0: κ + t − w, en t < 0: −κ + t − w.
  // En 0 hay subdiferencial [−κ, κ]. Si |w| ≤ κ, óptimo es 0.
  const phi = (t: number) => kappa * Math.abs(t) + 0.5 * (t - w) ** 2;

  const valuesTex = useMemo(
    () =>
      `\\text{soft}_{\\kappa}(w) = \\begin{cases} w - \\kappa & w > \\kappa \\\\ 0 & |w| \\leq \\kappa \\\\ w + \\kappa & w < -\\kappa \\end{cases},\\quad w = ${w.toFixed(2)},\\;\\kappa = ${kappa.toFixed(2)},\\;z = ${z.toFixed(3)}`,
    [w, kappa, z],
  );

  return (
    <div className="figure-interactive my-8">
      <div className="border border-ink-100 rounded-md overflow-hidden bg-paper grid grid-cols-1 md:grid-cols-2">
        {/* Operador soft-threshold */}
        <Mafs viewBox={{ x: [-3, 3], y: [-2.4, 2.4] }} height={300}>
          <Coordinates.Cartesian
            xAxis={{ lines: 0.5 }}
            yAxis={{ lines: 0.5 }}
          />

          {/* identidad y = w */}
          <Plot.OfX y={(x) => x} color={Theme.blue} weight={1} opacity={0.4} />

          {/* soft-thresholding */}
          <Plot.OfX
            y={(x) => softThreshold(x, kappa)}
            color={Theme.indigo}
            weight={2.5}
          />

          {/* zona muerta */}
          <Line.Segment
            point1={[-kappa, 0]}
            point2={[kappa, 0]}
            color={Theme.orange}
            weight={5}
          />

          {/* punto actual */}
          <Point x={w} y={z} color={Theme.green} />
          <Line.Segment
            point1={[w, 0]}
            point2={[w, z]}
            color={Theme.green}
            weight={1.5}
            opacity={0.5}
          />

          <Text x={2.5} y={2.3} attach="ne" size={11} color={Theme.indigo}>
            {`soft_κ(w)`}
          </Text>
          <Text x={2.5} y={2.3} attach="se" size={11} color={Theme.blue}>
            {`y = w`}
          </Text>
          <Text
            x={0}
            y={-0.2}
            attach="s"
            size={11}
            color={Theme.orange}
          >
            {`zona muerta [−κ, κ]`}
          </Text>

          {wPoint.element}
        </Mafs>

        {/* φ(t) */}
        <Mafs viewBox={{ x: [-2.5, 2.5], y: [-0.4, 3] }} height={300}>
          <Coordinates.Cartesian
            xAxis={{ lines: 0.5 }}
            yAxis={{ lines: 0.5 }}
          />

          <Plot.OfX y={phi} color={Theme.indigo} weight={2.2} />

          {/* mínimo */}
          <Point x={z} y={phi(z)} color={Theme.green} />
          <Line.Segment
            point1={[z, 0]}
            point2={[z, phi(z)]}
            color={Theme.green}
            weight={1.4}
            opacity={0.5}
          />

          <Text x={z + 0.1} y={phi(z) + 0.1} attach="ne" size={12} color={Theme.green}>
            {`z* = soft_κ(w)`}
          </Text>
          <Text x={2} y={2.6} attach="ne" size={11} color={Theme.indigo}>
            {`φ(t) = κ|t| + ½(t−w)²`}
          </Text>
        </Mafs>
      </div>

      <div className="mt-4 px-4 py-3 bg-ink-100/40 rounded-md font-sans text-sm space-y-3">
        <div className="text-ink-700 text-xs uppercase tracking-wider">
          Soft-thresholding: argmin_t κ|t| + ½(t − w)²
        </div>
        <div className="text-base">
          <Tex tex={valuesTex} />
        </div>
        <label className="block">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-mono">κ = λ/ρ</span>
            <span className="font-mono text-ink-500">{kappa.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={0.05}
            max={2}
            step={0.05}
            value={kappa}
            onChange={(e) => setKappa(Number(e.target.value))}
            className="w-full accent-accent-600"
          />
        </label>
        <div className="text-xs text-ink-500">
          A la izquierda: el operador <code>soft_κ</code> "achica" la entrada
          en magnitud <code>κ</code> hacia 0, y manda a 0 cualquier <code>w</code>{" "}
          en la zona muerta <code>[−κ, κ]</code>. A la derecha: la función
          <code> φ(t) = κ|t| + ½(t−w)²</code> que se está minimizando. Tiene
          una "esquina" en 0 (no diferenciable) que es exactamente lo que
          permite que el mínimo "se quede pegado" en 0 cuando <code>|w| ≤ κ</code>.
          La sparsidad de LASSO sale de acá: aumentar <code>λ</code> aumenta
          <code>κ = λ/ρ</code> y manda más coordenadas a 0.
        </div>
      </div>
    </div>
  );
}
