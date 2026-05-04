"use client";

import { useMemo, useState } from "react";
import { Tex } from "@/components/math/Tex";

const N_STEPS = 60;

// f(x) = (1/2)·(λ1·x1² + λ2·x2²)
// ∇f(x) = (λ1·x1, λ2·x2)
function gradQuadratic(
  x: readonly [number, number],
  l1: number,
  l2: number,
): [number, number] {
  return [l1 * x[0], l2 * x[1]];
}

type Method = "gd" | "hb" | "nesterov";

function runMethod(
  method: Method,
  x0: [number, number],
  l1: number,
  l2: number,
  alpha: number,
  beta: number,
  steps: number,
): Array<[number, number]> {
  const traj: Array<[number, number]> = [x0];
  let x: [number, number] = [...x0];
  let xPrev: [number, number] = [...x0];
  for (let k = 0; k < steps; k += 1) {
    if (method === "gd") {
      const g = gradQuadratic(x, l1, l2);
      const xNext: [number, number] = [x[0] - alpha * g[0], x[1] - alpha * g[1]];
      xPrev = x;
      x = xNext;
    } else if (method === "hb") {
      const g = gradQuadratic(x, l1, l2);
      const xNext: [number, number] = [
        x[0] - alpha * g[0] + beta * (x[0] - xPrev[0]),
        x[1] - alpha * g[1] + beta * (x[1] - xPrev[1]),
      ];
      xPrev = x;
      x = xNext;
    } else {
      const y: [number, number] = [
        x[0] + beta * (x[0] - xPrev[0]),
        x[1] + beta * (x[1] - xPrev[1]),
      ];
      const g = gradQuadratic(y, l1, l2);
      const xNext: [number, number] = [y[0] - alpha * g[0], y[1] - alpha * g[1]];
      xPrev = x;
      x = xNext;
    }
    traj.push(x);
  }
  return traj;
}

export function MomentumTrajectoryDemo() {
  const [alpha, setAlpha] = useState(0.04);
  const [beta, setBeta] = useState(0.85);
  const l1 = 1;
  const l2 = 25;
  const x0: [number, number] = [4, 1.2];

  const trajGD = useMemo(
    () => runMethod("gd", x0, l1, l2, alpha, beta, N_STEPS),
    [alpha, beta],
  );
  const trajHB = useMemo(
    () => runMethod("hb", x0, l1, l2, alpha, beta, N_STEPS),
    [alpha, beta],
  );
  const trajNes = useMemo(
    () => runMethod("nesterov", x0, l1, l2, alpha, beta, N_STEPS),
    [alpha, beta],
  );

  const W = 600;
  const H = 360;
  const padX = 40;
  const padY = 30;
  const xRange: [number, number] = [-5, 5];
  const yRange: [number, number] = [-2, 2];
  const innerW = W - 2 * padX;
  const innerH = H - 2 * padY;

  const xToPx = (x: number) =>
    padX + ((x - xRange[0]) / (xRange[1] - xRange[0])) * innerW;
  const yToPx = (y: number) =>
    padY + ((yRange[1] - y) / (yRange[1] - yRange[0])) * innerH;

  const buildPath = (traj: Array<[number, number]>) =>
    traj
      .map(
        ([px, py], i) =>
          `${i === 0 ? "M" : "L"} ${xToPx(px)} ${yToPx(py)}`,
      )
      .join(" ");

  // Curvas de nivel
  const levels = [0.5, 2, 8, 18, 32, 50];

  const fOf = (x: number, y: number) => 0.5 * (l1 * x * x + l2 * y * y);
  const finalGap = (traj: Array<[number, number]>) => {
    const last = traj[traj.length - 1] as [number, number];
    return fOf(last[0], last[1]);
  };

  return (
    <div className="figure-interactive my-8">
      <div className="border border-ink-100 rounded-md overflow-hidden bg-paper">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height="auto"
          style={{ display: "block" }}
        >
          {/* curvas de nivel: elipses de f = c, semi-eje x = sqrt(2c/l1), y = sqrt(2c/l2) */}
          {levels.map((c) => {
            const ax = Math.sqrt((2 * c) / l1);
            const ay = Math.sqrt((2 * c) / l2);
            return (
              <ellipse
                key={`lev-${c}`}
                cx={xToPx(0)}
                cy={yToPx(0)}
                rx={(ax / (xRange[1] - xRange[0])) * innerW}
                ry={(ay / (yRange[1] - yRange[0])) * innerH}
                stroke="currentColor"
                strokeOpacity={0.15}
                fill="none"
                strokeWidth={1}
              />
            );
          })}

          {/* ejes */}
          <line
            x1={padX}
            y1={yToPx(0)}
            x2={W - padX}
            y2={yToPx(0)}
            stroke="currentColor"
            strokeOpacity={0.15}
          />
          <line
            x1={xToPx(0)}
            y1={padY}
            x2={xToPx(0)}
            y2={H - padY}
            stroke="currentColor"
            strokeOpacity={0.15}
          />

          {/* trayectorias */}
          <path
            d={buildPath(trajGD)}
            stroke="var(--color-ink-500, #6b7280)"
            strokeWidth={1.5}
            fill="none"
            opacity={0.65}
          />
          <path
            d={buildPath(trajHB)}
            stroke="var(--color-warning, #d97706)"
            strokeWidth={1.5}
            fill="none"
          />
          <path
            d={buildPath(trajNes)}
            stroke="var(--color-accent-600, #6359e9)"
            strokeWidth={1.8}
            fill="none"
          />

          {/* puntos iniciales / finales */}
          {[
            { traj: trajGD, color: "var(--color-ink-500, #6b7280)" },
            { traj: trajHB, color: "var(--color-warning, #d97706)" },
            { traj: trajNes, color: "var(--color-accent-600, #6359e9)" },
          ].map(({ traj, color }, i) => {
            const start = traj[0] as [number, number];
            const end = traj[traj.length - 1] as [number, number];
            return (
              <g key={`pts-${i}`}>
                <circle cx={xToPx(start[0])} cy={yToPx(start[1])} r={3} fill={color} />
                <circle
                  cx={xToPx(end[0])}
                  cy={yToPx(end[1])}
                  r={4}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                />
              </g>
            );
          })}

          {/* punto óptimo */}
          <circle cx={xToPx(0)} cy={yToPx(0)} r={3} fill="var(--color-success, #16a34a)" />
        </svg>
      </div>

      <div className="mt-4 px-4 py-3 bg-ink-100/40 rounded-md font-sans text-sm space-y-3">
        <div className="text-ink-700 text-xs uppercase tracking-wider">
          Trayectorias en cuadrática Q = diag(1, 25), x₀ = (4, 1.2)
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-mono">α</span>
              <span className="font-mono text-ink-500">{alpha.toFixed(3)}</span>
            </div>
            <input
              type="range"
              min={0.001}
              max={0.08}
              step={0.001}
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
          <div className="px-2 py-1.5 bg-paper rounded-sm border-l-2" style={{ borderColor: "var(--color-ink-500, #6b7280)" }}>
            <div className="text-ink-500 uppercase tracking-wider">GD</div>
            <div className="font-mono">{finalGap(trajGD).toExponential(2)}</div>
          </div>
          <div className="px-2 py-1.5 bg-paper rounded-sm border-l-2" style={{ borderColor: "var(--color-warning)" }}>
            <div className="text-ink-500 uppercase tracking-wider">HB</div>
            <div className="font-mono">{finalGap(trajHB).toExponential(2)}</div>
          </div>
          <div className="px-2 py-1.5 bg-paper rounded-sm border-l-2" style={{ borderColor: "var(--color-accent-600, #6359e9)" }}>
            <div className="text-ink-500 uppercase tracking-wider">Nesterov</div>
            <div className="font-mono">{finalGap(trajNes).toExponential(2)}</div>
          </div>
        </div>
        <div className="text-xs text-ink-500">
          Tres trayectorias después de {N_STEPS} pasos: gris (GD),{" "}
          <span style={{ color: "var(--color-warning)" }}>naranja (Heavy Ball)</span>,{" "}
          <span style={{ color: "var(--color-accent-600, #6359e9)" }}>azul (Nesterov)</span>.
          GD oscila transversal por el condicionamiento (κ = 25). Con momentum,
          las oscilaciones se amortiguan y se gana progreso longitudinal. Si
          subís β cerca de 1 con α moderado, HB se vuelve oscilatorio (mucha
          inercia); Nesterov suele ser más estable porque evalúa el gradiente
          en el punto extrapolado yₖ.
        </div>
      </div>
    </div>
  );
}
