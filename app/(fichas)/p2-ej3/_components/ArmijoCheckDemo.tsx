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

// Caso unidimensional: f(x) = (1/2) x^2, x_k = 1, gradiente = 1, ‖∇f‖² = 1.
// φ(α) = f(x_k - α∇f(x_k)) = (1/2)(1 - α)²
// L(α)  = f(x_k) − α·‖∇f‖² = 1/2 − α  (tangente, σ=1)
// Lσ(α) = f(x_k) − σ·α·‖∇f‖² = 1/2 − σα  (línea de Armijo)
// U(α)  = f(x_k) − α·‖∇f‖² + (M/2)·α²·‖∇f‖² (cota cuadrática de la parte (a))
// Armijo se satisface cuando φ(α) ≤ Lσ(α). Por la cota (a),
// si U(α) ≤ Lσ(α) (cruce en α = 2(1−σ)/M) entonces φ(α) ≤ Lσ(α) también.

const phi = (alpha: number) => 0.5 * (1 - alpha) * (1 - alpha);

export function ArmijoCheckDemo() {
  const [sigma, setSigma] = useState(0.3);
  const [M, setM] = useState(1.5);

  const Lsigma = (a: number) => 0.5 - sigma * a;
  const U = (a: number) => 0.5 - a + (M / 2) * a * a;

  const aMax = (2 * (1 - sigma)) / M; // donde U cruza Lσ
  const aArmijoActual = Math.min(2 * (1 - sigma), 2.5); // φ ≤ Lσ se da en (0, 2(1-σ)) para esta φ
  // ya que para f = x²/2 (M_f = 1), Armijo se cumple para α ≤ 2(1−σ)/1 = 2(1−σ)
  // Aquí dejamos M de la cota (a) variable y mostramos cómo el bound 2(1−σ)/M es conservador
  // si M > 1 (o sea sobre-estimamos la curvatura).

  const valuesTex = useMemo(
    () =>
      `\\sigma = ${sigma.toFixed(2)},\\quad M = ${M.toFixed(2)},\\quad \\tfrac{2(1-\\sigma)}{M} = ${aMax.toFixed(2)},\\quad \\text{verdadero rango Armijo: } \\alpha \\in (0,\\, ${(2 * (1 - sigma)).toFixed(2)})`,
    [sigma, M, aMax],
  );

  const tex = useMemo(
    () =>
      `\\varphi(\\alpha) := f(x_k - \\alpha\\nabla f(x_k)) \\;\\overset{\\text{Armijo}}{\\leq}\\; \\underbrace{f(x_k) - \\sigma\\,\\alpha\\,\\|\\nabla f(x_k)\\|^2}_{L_\\sigma(\\alpha)}`,
    [],
  );

  return (
    <div className="figure-interactive my-8">
      <div className="border border-ink-100 rounded-md overflow-hidden bg-paper">
        <Mafs viewBox={{ x: [-0.2, 2.5], y: [-0.4, 0.7] }} height={380}>
          <Coordinates.Cartesian xAxis={{ lines: 0.5 }} yAxis={{ lines: 0.25 }} />

          {/* φ(α) — el objetivo a lo largo del rayo */}
          <Plot.OfX y={phi} color={Theme.indigo} weight={2.5} domain={[0, 2.5]} />

          {/* Lσ(α) — línea de Armijo */}
          <Plot.OfX y={Lsigma} color={Theme.green} weight={2} domain={[0, 2.5]} />

          {/* U(α) — cota superior cuadrática de (a) */}
          <Plot.OfX y={U} color={Theme.orange} weight={2} domain={[0, 2.5]} />

          {/* Punto α = 0: f(x_k) */}
          <Point x={0} y={0.5} color={Theme.indigo} />

          {/* Punto donde U cruza Lσ */}
          <Line.Segment
            point1={[aMax, 0]}
            point2={[aMax, U(aMax)]}
            color={Theme.orange}
            weight={1}
            opacity={0.4}
            style="dashed"
          />
          <Point x={aMax} y={U(aMax)} color={Theme.orange} />

          {/* etiquetas */}
          <Text x={2.4} y={phi(2.4) + 0.05} attach="ne" size={13} color={Theme.indigo}>
            {`φ(α)`}
          </Text>
          <Text x={2.4} y={Lsigma(2.4) - 0.04} attach="se" size={13} color={Theme.green}>
            {`Lσ`}
          </Text>
          <Text x={2.0} y={U(2.0) + 0.08} attach="ne" size={13} color="var(--color-warning)">
            {`U (cota a)`}
          </Text>
          <Text x={aMax} y={-0.15} attach="s" size={11} color="var(--color-warning)">
            {`α = 2(1−σ)/M`}
          </Text>
        </Mafs>
      </div>

      <div className="mt-4 px-4 py-3 bg-ink-100/40 rounded-md font-sans text-sm space-y-3">
        <div className="text-ink-700 text-xs uppercase tracking-wider">
          Test de Armijo a lo largo del rayo (caso f(x) = x²/2, x_k = 1)
        </div>
        <div className="text-base">
          <Tex tex={tex} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-mono">σ</span>
              <span className="font-mono text-ink-500">{sigma.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.05}
              max={0.95}
              step={0.01}
              value={sigma}
              onChange={(e) => setSigma(Number(e.target.value))}
              className="w-full accent-accent-600"
            />
          </label>
          <label className="block">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-mono">M</span>
              <span className="font-mono text-ink-500">{M.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={1}
              max={4}
              step={0.05}
              value={M}
              onChange={(e) => setM(Number(e.target.value))}
              className="w-full accent-accent-600"
            />
          </label>
        </div>
        <div className="text-base">
          <Tex tex={valuesTex} />
        </div>
        <div className="text-xs text-ink-500">
          Tres curvas a lo largo del rayo de descenso:{" "}
          <span style={{ color: "var(--color-indigo, #6359e9)" }}>φ(α)</span>{" "}
          es el valor verdadero de f, {" "}
          <span style={{ color: "var(--color-success, #16a34a)" }}>Lσ</span>{" "}
          es la línea de Armijo (la cota objetivo) y la {" "}
          <span style={{ color: "var(--color-warning)" }}>parábola U</span>{" "}
          es la cota cuadrática de la parte (a). La parte (b) muestra que{" "}
          <span style={{ color: "var(--color-warning)" }}>U ≤ Lσ</span>{" "}
          para α ≤ 2(1−σ)/M, y por lo tanto{" "}
          φ ≤ U ≤ Lσ en ese rango: Armijo se cumple seguro. Bajá σ o subí M
          y vas a ver cómo la garantía conservadora se achica.
        </div>
      </div>
    </div>
  );
}
