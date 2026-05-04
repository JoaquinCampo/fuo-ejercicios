"use client";

import { useMemo, useState } from "react";
import { Tex } from "@/components/math/Tex";

const N_STEPS = 80;

export function ScalarRecurrenceDemo() {
  const [alpha, setAlpha] = useState(0.4);
  const [beta, setBeta] = useState(0.6);
  const lambda = 1;

  // Recurrencia: x_{k+1} = (1 − αλ + β)·x_k − β·x_{k−1}, con x_0 = x_1 = 1
  const { trajectory, rootInfo } = useMemo(() => {
    const traj = [1, 1];
    const a = 1 - alpha * lambda + beta;
    const b = -beta;
    for (let k = 1; k < N_STEPS; k += 1) {
      const xk = traj[k] as number;
      const xkm1 = traj[k - 1] as number;
      traj.push(a * xk + b * xkm1);
    }

    // Polinomio característico: r² − (1 − αλ + β)·r + β = 0
    // r = (a ± sqrt(a² − 4β)) / 2
    const disc = a * a - 4 * beta;
    let r1Re: number;
    let r1Im: number;
    let r2Re: number;
    let r2Im: number;
    if (disc >= 0) {
      const s = Math.sqrt(disc);
      r1Re = (a + s) / 2;
      r1Im = 0;
      r2Re = (a - s) / 2;
      r2Im = 0;
    } else {
      const s = Math.sqrt(-disc);
      r1Re = a / 2;
      r1Im = s / 2;
      r2Re = a / 2;
      r2Im = -s / 2;
    }
    const r1Mag = Math.sqrt(r1Re * r1Re + r1Im * r1Im);
    const r2Mag = Math.sqrt(r2Re * r2Re + r2Im * r2Im);
    return {
      trajectory: traj,
      rootInfo: {
        r1Re,
        r1Im,
        r2Re,
        r2Im,
        r1Mag,
        r2Mag,
        disc,
        spectralRadius: Math.max(r1Mag, r2Mag),
      },
    };
  }, [alpha, beta]);

  const W = 600;
  const H = 280;
  const padL = 50;
  const padR = 20;
  const padT = 20;
  const padB = 35;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const yAbsMaxRaw = Math.max(2, ...trajectory.map((v) => Math.abs(v)));
  const yAbsMax = Math.min(yAbsMaxRaw, 5);
  const yToPx = (y: number) => {
    const c = Math.max(-yAbsMax, Math.min(yAbsMax, y));
    return padT + innerH / 2 - (c / yAbsMax) * (innerH / 2 - 5);
  };
  const kToPx = (k: number) => padL + (k / (N_STEPS - 1)) * innerW;

  const linePath = trajectory
    .map((v, k) => `${k === 0 ? "M" : "L"} ${kToPx(k)} ${yToPx(v)}`)
    .join(" ");

  const regime =
    rootInfo.disc < 0
      ? "complejas conjugadas → oscilación amortiguada"
      : rootInfo.disc < 1e-6
        ? "raíz doble → caso crítico"
        : "dos raíces reales → sobre-amortiguado";

  const stable = rootInfo.spectralRadius < 1;

  const tex = useMemo(
    () =>
      `x_{k+1} = (1 - \\alpha\\lambda + \\beta)\\,x_k - \\beta\\,x_{k-1}, \\qquad r^2 - (1 - \\alpha\\lambda + \\beta)\\,r + \\beta = 0`,
    [],
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
          {/* eje x */}
          <line
            x1={padL}
            y1={padT + innerH / 2}
            x2={padL + innerW}
            y2={padT + innerH / 2}
            stroke="currentColor"
            strokeOpacity={0.2}
          />
          <line
            x1={padL}
            y1={padT}
            x2={padL}
            y2={padT + innerH}
            stroke="currentColor"
            strokeOpacity={0.2}
          />

          <text
            x={padL - 6}
            y={padT + 4}
            textAnchor="end"
            fontSize={11}
            fontFamily="ui-monospace"
            fill="currentColor"
            fillOpacity={0.6}
          >
            {yAbsMax.toFixed(1)}
          </text>
          <text
            x={padL - 6}
            y={padT + innerH / 2 + 4}
            textAnchor="end"
            fontSize={11}
            fontFamily="ui-monospace"
            fill="currentColor"
            fillOpacity={0.6}
          >
            0
          </text>
          <text
            x={padL - 6}
            y={padT + innerH + 4}
            textAnchor="end"
            fontSize={11}
            fontFamily="ui-monospace"
            fill="currentColor"
            fillOpacity={0.6}
          >
            −{yAbsMax.toFixed(1)}
          </text>
          <text
            x={padL + innerW}
            y={padT + innerH + 18}
            textAnchor="end"
            fontSize={11}
            fontFamily="ui-monospace"
            fill="currentColor"
            fillOpacity={0.6}
          >
            k = {N_STEPS - 1}
          </text>

          <path
            d={linePath}
            stroke="var(--color-accent-600, #6359e9)"
            strokeWidth={1.6}
            fill="none"
            opacity={0.85}
          />
          {trajectory.map((v, k) => (
            <circle
              key={`p-${k}`}
              cx={kToPx(k)}
              cy={yToPx(v)}
              r={2.2}
              fill="var(--color-accent-600, #6359e9)"
            />
          ))}
          {yAbsMaxRaw > yAbsMax ? (
            <text
              x={padL + innerW - 4}
              y={padT + 14}
              textAnchor="end"
              fontSize={11}
              fontFamily="ui-monospace"
              fill="var(--color-warning, #d97706)"
            >
              fuera de rango (diverge)
            </text>
          ) : null}
        </svg>
      </div>

      <div className="mt-4 px-4 py-3 bg-ink-100/40 rounded-md font-sans text-sm space-y-3">
        <div className="text-ink-700 text-xs uppercase tracking-wider">
          Heavy Ball escalar: λ = 1, x₀ = x₁ = 1
        </div>
        <div className="text-base">
          <Tex tex={tex} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-mono">α</span>
              <span className="font-mono text-ink-500">{alpha.toFixed(3)}</span>
            </div>
            <input
              type="range"
              min={0.05}
              max={2}
              step={0.01}
              value={alpha}
              onChange={(e) => setAlpha(Number(e.target.value))}
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
              min={0}
              max={0.99}
              step={0.01}
              value={beta}
              onChange={(e) => setBeta(Number(e.target.value))}
              className="w-full accent-accent-600"
            />
          </label>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="px-2 py-1.5 bg-paper rounded-sm">
            <div className="text-ink-500 uppercase tracking-wider">disc.</div>
            <div className="font-mono">{rootInfo.disc.toFixed(3)}</div>
          </div>
          <div className="px-2 py-1.5 bg-paper rounded-sm">
            <div className="text-ink-500 uppercase tracking-wider">|r|max</div>
            <div className="font-mono">
              {rootInfo.spectralRadius.toFixed(3)}
            </div>
          </div>
          <div
            className="px-2 py-1.5 bg-paper rounded-sm"
            style={{
              borderLeft: stable
                ? "3px solid var(--color-success, #16a34a)"
                : "3px solid var(--color-warning, #d97706)",
            }}
          >
            <div className="text-ink-500 uppercase tracking-wider">estado</div>
            <div className="font-mono">{stable ? "estable" : "diverge"}</div>
          </div>
        </div>
        <div className="text-xs text-ink-500">
          Régimen actual: <strong>{regime}</strong>. La recurrencia de orden 2
          tiene polinomio característico <code>r² − (1 − αλ + β)r + β = 0</code>.
          Si las dos raíces son complejas (disc &lt; 0) la trayectoria oscila;
          si son reales positivas (disc &gt; 0) decrece monótona; el caso
          crítico (disc = 0) da el decaimiento más rápido entre los reales.
          β = 0 recupera GD (raíz r = 1 − αλ).
        </div>
      </div>
    </div>
  );
}
