"use client";

import { useMemo, useState } from "react";
import { Tex } from "@/components/math/Tex";

// Pequeño LASSO 5-dim con A diagonal: A = diag(d) → x-update tiene cerrada por coordenada.
// (A^T A + ρ I) x = A^T b + ρ (z − u) con A diagonal:
// (d_i² + ρ) x_i = d_i b_i + ρ (z_i − u_i)
const D = [1.5, 1.0, 0.8, 0.6, 1.2];
const B = [3.0, -2.0, 1.5, -0.6, 0.4];
const N = D.length;

function softThreshold(w: number, kappa: number): number {
  if (w > kappa) return w - kappa;
  if (w < -kappa) return w + kappa;
  return 0;
}

type Iter = {
  x: number[];
  z: number[];
  u: number[];
  rPrim: number; // ‖x − z‖
  rDual: number; // ρ ‖z − z_prev‖
};

function runADMM(
  rho: number,
  lambda: number,
  steps: number,
): Iter[] {
  const arr: Iter[] = [];
  let x = Array.from({ length: N }, () => 0);
  let z = Array.from({ length: N }, () => 0);
  let u = Array.from({ length: N }, () => 0);
  let zPrev = z.slice();

  for (let k = 0; k < steps; k += 1) {
    // x-update: (D² + ρ) x_i = D_i b_i + ρ (z_i − u_i)
    x = x.map((_, i) => {
      const di = D[i] as number;
      const bi = B[i] as number;
      const zi = z[i] as number;
      const ui = u[i] as number;
      return (di * bi + rho * (zi - ui)) / (di * di + rho);
    });
    // z-update: soft-thresholding sobre x + u
    zPrev = z.slice();
    z = x.map((xi, i) => softThreshold(xi + (u[i] as number), lambda / rho));
    // u-update
    u = u.map((ui, i) => ui + (x[i] as number) - (z[i] as number));

    const rPrim = Math.sqrt(
      x.reduce((acc, xi, i) => acc + (xi - (z[i] as number)) ** 2, 0),
    );
    const rDual =
      rho *
      Math.sqrt(
        z.reduce((acc, zi, i) => acc + (zi - (zPrev[i] as number)) ** 2, 0),
      );

    arr.push({ x: x.slice(), z: z.slice(), u: u.slice(), rPrim, rDual });
  }

  return arr;
}

export function ADMMConvergenceDemo() {
  const [rho, setRho] = useState(1);
  const [lambda, setLambda] = useState(1);
  const STEPS = 60;

  const traj = useMemo(() => runADMM(rho, lambda, STEPS), [rho, lambda]);

  // Solución cerrada: para A diagonal, x_i* = soft_{λ/d_i²}(b_i/d_i)
  const xStar = D.map((d, i) => softThreshold((B[i] as number) / d, lambda / (d * d)));

  const W = 600;
  const H = 280;
  const padL = 50;
  const padR = 30;
  const padT = 25;
  const padB = 35;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  // log-y axis para residuos
  const logMin = -10;
  const logMax = 1;
  const yToPx = (eps: number) => {
    const log = Math.max(logMin, Math.log10(Math.max(eps, 1e-30)));
    return padT + ((logMax - log) / (logMax - logMin)) * innerH;
  };
  const kToPx = (k: number) => padL + (k / (STEPS - 1)) * innerW;

  const linePathPrim = traj
    .map((it, k) => `${k === 0 ? "M" : "L"} ${kToPx(k)} ${yToPx(it.rPrim)}`)
    .join(" ");
  const linePathDual = traj
    .map((it, k) => `${k === 0 ? "M" : "L"} ${kToPx(k)} ${yToPx(it.rDual)}`)
    .join(" ");

  const yTicks = [1, -2, -4, -6, -8];

  // Distancia final al óptimo
  const last = traj[traj.length - 1] as Iter;
  const distToStar = Math.sqrt(
    last.x.reduce((acc, xi, i) => acc + (xi - (xStar[i] as number)) ** 2, 0),
  );

  return (
    <div className="figure-interactive my-8">
      <div className="border border-ink-100 rounded-md overflow-hidden bg-paper">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height="auto"
          style={{ display: "block" }}
        >
          {yTicks.map((logEps) => {
            const eps = Math.pow(10, logEps);
            const y = yToPx(eps);
            return (
              <g key={`tick-${logEps}`}>
                <line
                  x1={padL}
                  y1={y}
                  x2={padL + innerW}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity={0.08}
                  strokeWidth={1}
                />
                <text
                  x={padL - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize={10}
                  fontFamily="ui-monospace"
                  fill="currentColor"
                  fillOpacity={0.6}
                >
                  10{logEps === 0 ? "⁰" : logEps > 0 ? `^${logEps}` : `⁻${-logEps}`}
                </text>
              </g>
            );
          })}

          <line
            x1={padL}
            y1={padT + innerH}
            x2={padL + innerW}
            y2={padT + innerH}
            stroke="currentColor"
            strokeOpacity={0.2}
          />
          {[0, 15, 30, 45, STEPS - 1].map((kv) => (
            <text
              key={`xtk-${kv}`}
              x={kToPx(kv)}
              y={padT + innerH + 16}
              textAnchor="middle"
              fontSize={10}
              fontFamily="ui-monospace"
              fill="currentColor"
              fillOpacity={0.6}
            >
              {kv}
            </text>
          ))}
          <text
            x={padL + innerW / 2}
            y={padT + innerH + 30}
            textAnchor="middle"
            fontSize={11}
            fontFamily="ui-monospace"
            fill="currentColor"
            fillOpacity={0.6}
          >
            iteración k
          </text>

          <path
            d={linePathPrim}
            stroke="var(--color-accent-600, #6359e9)"
            strokeWidth={2}
            fill="none"
          />
          <path
            d={linePathDual}
            stroke="var(--color-warning, #d97706)"
            strokeWidth={2}
            fill="none"
          />

          <text
            x={padL + 6}
            y={padT + 14}
            fontSize={11}
            fontFamily="ui-sans-serif"
            fill="var(--color-accent-600, #6359e9)"
          >
            ‖x − z‖ (residuo primal)
          </text>
          <text
            x={padL + 6}
            y={padT + 28}
            fontSize={11}
            fontFamily="ui-sans-serif"
            fill="var(--color-warning, #d97706)"
          >
            ρ‖Δz‖ (residuo dual)
          </text>
        </svg>
      </div>

      <div className="mt-4 px-4 py-3 bg-ink-100/40 rounded-md font-sans text-sm space-y-3">
        <div className="text-ink-700 text-xs uppercase tracking-wider">
          ADMM para LASSO: residuos primal y dual en escala log
        </div>
        <div className="text-base">
          <Tex
            tex={`(A^{\\top} A + \\rho I)x^{k+1} = A^{\\top} b + \\rho(z^k - u^k),\\quad z^{k+1} = \\text{soft}_{\\lambda/\\rho}(x^{k+1} + u^k),\\quad u^{k+1} = u^k + x^{k+1} - z^{k+1}`}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-mono">ρ (penalización aumentada)</span>
              <span className="font-mono text-ink-500">{rho.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.05}
              max={5}
              step={0.05}
              value={rho}
              onChange={(e) => setRho(Number(e.target.value))}
              className="w-full accent-accent-600"
            />
          </label>
          <label className="block">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-mono">λ (regularización ℓ₁)</span>
              <span className="font-mono text-ink-500">{lambda.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={3}
              step={0.05}
              value={lambda}
              onChange={(e) => setLambda(Number(e.target.value))}
              className="w-full accent-accent-600"
            />
          </label>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="px-2 py-1.5 bg-paper rounded-sm">
            <div className="text-ink-500 uppercase tracking-wider">
              ‖x − z‖ final
            </div>
            <div className="font-mono">{last.rPrim.toExponential(2)}</div>
          </div>
          <div className="px-2 py-1.5 bg-paper rounded-sm">
            <div className="text-ink-500 uppercase tracking-wider">
              ρ‖Δz‖ final
            </div>
            <div className="font-mono">{last.rDual.toExponential(2)}</div>
          </div>
          <div className="px-2 py-1.5 bg-paper rounded-sm">
            <div className="text-ink-500 uppercase tracking-wider">
              ‖x_N − x*‖
            </div>
            <div className="font-mono">{distToStar.toExponential(2)}</div>
          </div>
        </div>
        <div className="text-xs text-ink-500">
          ADMM combina x-update tipo regresión Tikhonov (cuadrático con
          penalización <code>ρ</code>) con z-update por soft-thresholding y
          un dual-update aditivo en <code>u</code>. Ambos residuos bajan a
          cero (escala log): la convergencia depende de <code>ρ</code> (no
          afecta el límite, pero sí la velocidad). <code>ρ</code> chico:
          x-update barato, residuo dual rápido. <code>ρ</code> grande:
          fuerza más rápido <code>x ≈ z</code>, residuo primal rápido.
          Hay heurísticas adaptativas para balancear.
        </div>
      </div>
    </div>
  );
}
