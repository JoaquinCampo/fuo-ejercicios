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

// φ(α) = f(x + α d), modelamos como cuadrática en α con curvatura controlable
// φ(α) = ½ M α² + (∇f·d) α + f(x). Convención: f(x) = 0.
// Slider: pendiente inicial g0 = ∇f·d ≤ 0, curvatura M > 0.
export function ConstrainedLineSearchDemo() {
  const [g0, setG0] = useState(-1.4); // ∇f(x_k)·d_k
  const [M, setM] = useState(2.5); // curvatura local

  const phi = (a: number) => 0.5 * M * a * a + g0 * a;
  const phiP = (a: number) => M * a + g0;

  // Mínimo libre: α* = -g0/M. Restringido a [0,1]: α_constrained = clamp(α*, 0, 1).
  const aStarFree = -g0 / M;
  const aStar = Math.max(0, Math.min(1, aStarFree));
  const fStar = phi(aStar);

  const tex = useMemo(
    () =>
      `\\varphi(\\alpha) = \\tfrac{M}{2}\\alpha^2 + \\langle \\nabla f, d\\rangle\\,\\alpha,\\quad \\alpha_k = \\arg\\min_{\\alpha\\in[0,1]}\\varphi(\\alpha) = ${aStar.toFixed(3)}`,
    [aStar],
  );

  const reduction = -fStar;

  return (
    <div className="figure-interactive my-8">
      <div className="border border-ink-100 rounded-md overflow-hidden bg-paper">
        <Mafs viewBox={{ x: [-0.1, 1.4], y: [-1.5, 0.8] }} height={300}>
          <Coordinates.Cartesian
            xAxis={{ lines: 0.25 }}
            yAxis={{ lines: 0.25 }}
          />

          {/* φ(α) */}
          <Plot.OfX y={phi} color={Theme.indigo} weight={2.5} />

          {/* tangente en α=0 */}
          <Line.Segment
            point1={[0, 0]}
            point2={[1.2, 1.2 * g0]}
            color={Theme.blue}
            weight={1.4}
            opacity={0.5}
          />
          <Text x={0.85} y={0.85 * g0 + 0.05} attach="ne" size={12} color={Theme.blue}>
            {`pendiente φ'(0) = ⟨∇f,d⟩`}
          </Text>

          {/* línea α=1 */}
          <Line.Segment
            point1={[1, -1.5]}
            point2={[1, 0.8]}
            color={Theme.orange}
            weight={1.2}
            opacity={0.4}
          />
          <Text x={1} y={0.7} attach="se" size={11} color={Theme.orange}>
            {`α = 1 (borde factible)`}
          </Text>

          {/* punto óptimo */}
          <Point x={aStar} y={fStar} color={Theme.green} />
          <Line.Segment
            point1={[aStar, 0]}
            point2={[aStar, fStar]}
            color={Theme.green}
            weight={1.5}
            opacity={0.5}
          />
          <Text
            x={aStar}
            y={fStar - 0.05}
            attach="s"
            size={12}
            color={Theme.green}
          >
            {`α_k = ${aStar.toFixed(2)}`}
          </Text>

          <Point x={0} y={0} color={Theme.indigo} />
          <Text x={-0.05} y={0.05} attach="nw" size={11} color={Theme.indigo}>
            {`f(x_k)`}
          </Text>
        </Mafs>
      </div>

      <div className="mt-4 px-4 py-3 bg-ink-100/40 rounded-md font-sans text-sm space-y-3">
        <div className="text-ink-700 text-xs uppercase tracking-wider">
          Minimización limitada en la dirección factible
        </div>
        <div className="text-base">
          <Tex tex={tex} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-mono">⟨∇f, d⟩ = φ'(0)</span>
              <span className="font-mono text-ink-500">{g0.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={-3}
              max={-0.05}
              step={0.05}
              value={g0}
              onChange={(e) => setG0(Number(e.target.value))}
              className="w-full accent-accent-600"
            />
          </label>
          <label className="block">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-mono">M (curvatura)</span>
              <span className="font-mono text-ink-500">{M.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.3}
              max={6}
              step={0.1}
              value={M}
              onChange={(e) => setM(Number(e.target.value))}
              className="w-full accent-accent-600"
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <div className="px-2 py-1.5 bg-paper rounded-sm">
            <div className="text-ink-500 uppercase tracking-wider">
              α* libre = −g₀/M
            </div>
            <div className="font-mono">{aStarFree.toFixed(3)}</div>
          </div>
          <div className="px-2 py-1.5 bg-paper rounded-sm">
            <div className="text-ink-500 uppercase tracking-wider">
              reducción f(x) − f(x+α_k d)
            </div>
            <div className="font-mono">{reduction.toFixed(3)}</div>
          </div>
        </div>
        <div className="text-xs text-ink-500">
          La pendiente <code>φ'(0) = ⟨∇f, d⟩</code> es <strong>negativa</strong>{" "}
          (parte (a)): el descenso es seguro al inicio. Si <code>α* &lt; 1</code>{" "}
          el óptimo es interior; si <code>α* ≥ 1</code> el óptimo está en el
          borde factible <code>α = 1</code>. En ambos casos la reducción es
          positiva (siempre que <code>d</code> sea no nulo, i.e. <code>x</code>{" "}
          no estacionario), y eso impide que <code>f(x^k)</code> deje de
          decrecer si <code>x</code> no es estacionario en el límite.
        </div>
      </div>
    </div>
  );
}
