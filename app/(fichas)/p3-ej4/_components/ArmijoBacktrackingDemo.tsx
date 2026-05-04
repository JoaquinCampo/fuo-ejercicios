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

// φ(α) = f(x + α d) modelado como cuadrática + perturbación pequeña
// φ(α) = ½ M α² + g0 α  (g0 < 0, M > 0)
export function ArmijoBacktrackingDemo() {
  const [g0, setG0] = useState(-1.2);
  const [M, setM] = useState(3);
  const [sigma, setSigma] = useState(0.3);
  const [beta, setBeta] = useState(0.5);

  const phi = (a: number) => 0.5 * M * a * a + g0 * a;
  const armijo = (a: number) => sigma * g0 * a; // f(x_k) = 0; cota = 0 + σ·α·g0

  // Backtracking: empezar con α = 1, multiplicar por β hasta cumplir Armijo
  const trail = useMemo(() => {
    const arr: { alpha: number; phiVal: number; armVal: number; ok: boolean }[] = [];
    let a = 1;
    for (let i = 0; i < 25; i += 1) {
      const pv = phi(a);
      const av = armijo(a);
      const ok = pv <= av + 1e-12;
      arr.push({ alpha: a, phiVal: pv, armVal: av, ok });
      if (ok) break;
      a *= beta;
    }
    return arr;
  }, [g0, M, sigma, beta]);

  const accepted = trail[trail.length - 1];
  const m_k = trail.length - 1;

  // Existencia teórica de bar α: tomamos el primer α tal que φ(α) - σ·α·g0 = 0
  // Como φ(α) - σ·α·g0 = ½ M α² + (1-σ) g0 α, raíces α = 0 y α = -2(1-σ)g0/M.
  // Para α en (0, ᾱ] se cumple Armijo. Aquí ᾱ = -2(1-σ)g0/M.
  const aBar = (-2 * (1 - sigma) * g0) / M;

  const tex = useMemo(
    () =>
      `\\bar\\alpha = \\frac{-2(1-\\sigma)\\,\\langle\\nabla f, d\\rangle}{M} = ${aBar.toFixed(3)},\\quad \\alpha_k = \\beta^{m_k} = ${(accepted?.alpha ?? 0).toFixed(3)},\\quad m_k = ${m_k}`,
    [aBar, accepted, m_k],
  );

  return (
    <div className="figure-interactive my-8">
      <div className="border border-ink-100 rounded-md overflow-hidden bg-paper">
        <Mafs viewBox={{ x: [-0.05, 1.2], y: [-1, 0.5] }} height={320}>
          <Coordinates.Cartesian xAxis={{ lines: 0.25 }} yAxis={{ lines: 0.25 }} />

          {/* φ(α) */}
          <Plot.OfX y={phi} color={Theme.indigo} weight={2.5} />
          {/* línea Armijo */}
          <Plot.OfX y={armijo} color={Theme.green} weight={2} opacity={0.85} />

          {/* α = ᾱ */}
          <Line.Segment
            point1={[aBar, -1]}
            point2={[aBar, 0.5]}
            color={Theme.orange}
            weight={1.2}
            opacity={0.5}
          />
          <Text x={aBar} y={0.4} attach="ne" size={11} color={Theme.orange}>
            {`ᾱ = ${aBar.toFixed(2)}`}
          </Text>

          {/* trail backtracking */}
          {trail.map((t, i) => (
            <g key={`t-${i}`}>
              <Point
                x={t.alpha}
                y={t.phiVal}
                color={t.ok ? Theme.green : Theme.orange}
              />
              <Line.Segment
                point1={[t.alpha, 0]}
                point2={[t.alpha, t.phiVal]}
                color={t.ok ? Theme.green : Theme.orange}
                weight={1}
                opacity={0.4}
              />
            </g>
          ))}

          <Text x={0.95} y={phi(0.95) - 0.08} attach="se" size={12} color={Theme.indigo}>
            {`φ(α)`}
          </Text>
          <Text x={0.7} y={armijo(0.7) + 0.08} attach="ne" size={12} color={Theme.green}>
            {`f + σα⟨∇f,d⟩`}
          </Text>
        </Mafs>
      </div>

      <div className="mt-4 px-4 py-3 bg-ink-100/40 rounded-md font-sans text-sm space-y-3">
        <div className="text-ink-700 text-xs uppercase tracking-wider">
          Backtracking de Armijo: α_k = β^{`{m_k}`}, primer m_k que cumple la cota
        </div>
        <div className="text-base">
          <Tex tex={tex} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <label className="block">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-mono">⟨∇f, d⟩</span>
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
              <span className="font-mono">M</span>
              <span className="font-mono text-ink-500">{M.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={10}
              step={0.1}
              value={M}
              onChange={(e) => setM(Number(e.target.value))}
              className="w-full accent-accent-600"
            />
          </label>
          <label className="block">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-mono">σ</span>
              <span className="font-mono text-ink-500">{sigma.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.05}
              max={0.95}
              step={0.05}
              value={sigma}
              onChange={(e) => setSigma(Number(e.target.value))}
              className="w-full accent-accent-600"
            />
          </label>
          <label className="block">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-mono">β</span>
              <span className="font-mono text-ink-500">{beta.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={0.95}
              step={0.05}
              value={beta}
              onChange={(e) => setBeta(Number(e.target.value))}
              className="w-full accent-accent-600"
            />
          </label>
        </div>
        <div className="text-xs text-ink-500">
          Empezamos con <code>α = 1</code> y multiplicamos por <code>β</code>{" "}
          hasta caer en la región donde <code>φ(α) ≤ σα⟨∇f, d⟩</code> (debajo
          de la línea verde). Las marcas naranjas son rechazos, la verde es la
          aceptación. Lo importante: para todo <code>α ∈ (0, ᾱ]</code> se
          cumple Armijo; el backtracking encuentra una <code>α_k</code> en
          ese intervalo en a lo sumo <code>O(log_β(ᾱ))</code> probaciones.
          La cota <code>α_k ≥ β·ᾱ</code> es uniforme: un mismo ᾱ sirve
          mientras la curvatura local se mantenga acotada.
        </div>
      </div>
    </div>
  );
}
