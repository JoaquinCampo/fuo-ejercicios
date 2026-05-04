"use client";

import {
  Mafs,
  Coordinates,
  Plot,
  Line,
  Point,
  Text,
  Theme,
} from "mafs";
import { useMemo, useState } from "react";
import { Tex } from "@/components/math/Tex";

// Modelo a lo largo de la dirección de búsqueda:
// φ(α) = f(x_k + α·d_k). La elegimos como una cuadrática suave + ruido
// suficientemente convexo: φ(α) = 0.4·α² − α + 0.3·sin(α)
// φ'(α) = 0.8·α − 1 + 0.3·cos(α)
const phi = (a: number) => 0.4 * a * a - a + 0.3 * Math.sin(a);
const phiP = (a: number) => 0.8 * a - 1 + 0.3 * Math.cos(a);

export function CurvatureConditionDemo() {
  const [alphaK, setAlphaK] = useState(1.6);

  const phi0 = phi(0);
  const phiPk0 = phiP(0); // ∇f(x_k)·d_k
  const phiPkAlpha = phiP(alphaK); // ∇f(x_{k+1})·d_k

  // y_k·s_k = (∇f(x_{k+1}) − ∇f(x_k))·d_k · α_k = (φ'(α_k) − φ'(0))·α_k
  const ysSignsPositive = (phiPkAlpha - phiPk0) * alphaK > 0;

  const tex = useMemo(
    () =>
      `\\nabla f(x_k)^{\\top} d_k = \\varphi'(0) = ${phiPk0.toFixed(3)},\\quad \\nabla f(x_{k+1})^{\\top} d_k = \\varphi'(\\alpha_k) = ${phiPkAlpha.toFixed(3)}`,
    [phiPk0, phiPkAlpha],
  );

  return (
    <div className="figure-interactive my-8">
      <div className="border border-ink-100 rounded-md overflow-hidden bg-paper">
        <Mafs viewBox={{ x: [-0.4, 3.4], y: [-1.6, 1.6] }} height={360}>
          <Coordinates.Cartesian
            xAxis={{ lines: 0.5 }}
            yAxis={{ lines: 0.5 }}
          />

          {/* φ(α) */}
          <Plot.OfX y={phi} color={Theme.indigo} weight={2.5} />
          {/* φ'(α) */}
          <Plot.OfX y={phiP} color={Theme.green} weight={2} opacity={0.85} />

          {/* tangente en α=0 (pendiente φ'(0)) */}
          <Line.Segment
            point1={[-0.3, phi0 - 0.3 * phiPk0]}
            point2={[2.5, phi0 + 2.5 * phiPk0]}
            color={Theme.blue}
            weight={1.4}
            opacity={0.5}
          />

          {/* tangente en α=α_k */}
          <Line.Segment
            point1={[alphaK - 0.7, phi(alphaK) - 0.7 * phiPkAlpha]}
            point2={[alphaK + 0.7, phi(alphaK) + 0.7 * phiPkAlpha]}
            color={Theme.orange}
            weight={1.6}
          />

          {/* puntos de φ */}
          <Point x={0} y={phi0} color={Theme.indigo} />
          <Point x={alphaK} y={phi(alphaK)} color={Theme.indigo} />

          {/* línea horizontal en φ'(0) y marca en α_k para φ' */}
          <Line.Segment
            point1={[0, phiPk0]}
            point2={[alphaK, phiPk0]}
            color={Theme.blue}
            weight={1}
            opacity={0.5}
          />
          <Point x={0} y={phiPk0} color={Theme.blue} />
          <Point x={alphaK} y={phiPkAlpha} color={Theme.green} />

          <Text x={2.4} y={phi(2.4) + 0.15} attach="ne" size={13} color={Theme.indigo}>
            {`φ(α) = f(x_k+α d_k)`}
          </Text>
          <Text x={2.4} y={phiP(2.4) - 0.15} attach="se" size={13} color={Theme.green}>
            {`φ'(α)`}
          </Text>
          <Text
            x={alphaK + 0.05}
            y={phiPkAlpha + 0.1}
            attach="ne"
            size={12}
            color={Theme.green}
          >
            {`φ'(α_k)`}
          </Text>
          <Text x={0.05} y={phiPk0 - 0.1} attach="se" size={12} color={Theme.blue}>
            {`φ'(0)`}
          </Text>
        </Mafs>
      </div>

      <div className="mt-4 px-4 py-3 bg-ink-100/40 rounded-md font-sans text-sm space-y-3">
        <div className="text-ink-700 text-xs uppercase tracking-wider">
          Condición de curvatura: ∇f(x_k)·d_k &lt; ∇f(x_{"{k+1}"})·d_k ⇔ y_k·s_k &gt; 0
        </div>
        <div className="text-base">
          <Tex tex={tex} />
        </div>
        <label className="block">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-mono">α_k</span>
            <span className="font-mono text-ink-500">{alphaK.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={0.05}
            max={3}
            step={0.05}
            value={alphaK}
            onChange={(e) => setAlphaK(Number(e.target.value))}
            className="w-full accent-accent-600"
          />
        </label>
        <div
          className="px-3 py-2 bg-paper rounded-sm text-center text-xs"
          style={{
            borderLeft: ysSignsPositive
              ? "3px solid var(--color-success, #16a34a)"
              : "3px solid var(--color-warning, #d97706)",
          }}
        >
          <span className="font-mono">
            y_k·s_k = (φ'(α_k) − φ'(0))·α_k ={" "}
            {((phiPkAlpha - phiPk0) * alphaK).toFixed(3)} →{" "}
            {ysSignsPositive ? "positivo (bien)" : "no positivo (BFGS no aplica)"}
          </span>
        </div>
        <div className="text-xs text-ink-500">
          Lo que importa para BFGS es que la pendiente de <em>φ</em> haya{" "}
          <strong>crecido</strong> al pasar de 0 a <code>α_k</code>: dejó de
          ser tan negativa o ya es positiva. Eso es exactamente lo que pide
          la condición de Wolfe de curvatura. Si elegís un <code>α_k</code>{" "}
          chiquito tal que <code>φ'(α_k)</code> sigue tan negativo como
          <code>φ'(0)</code>, la condición falla y la actualización BFGS
          podría perder positividad. Una búsqueda lineal con Wolfe garantiza
          este sub-producto.
        </div>
      </div>
    </div>
  );
}
