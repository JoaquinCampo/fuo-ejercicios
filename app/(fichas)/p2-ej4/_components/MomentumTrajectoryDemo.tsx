"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Tex } from "@/components/math/Tex";
import type { Trajectory, Vec2 } from "@/components/viz/Descent3D";

const Descent3D = dynamic(
  () => import("@/components/viz/Descent3D").then((m) => m.Descent3D),
  { ssr: false, loading: () => <Descent3DSkeleton /> },
);

function Descent3DSkeleton() {
  return (
    <div className="not-prose">
      <div
        className="border border-ink-100 rounded-md bg-paper-soft animate-pulse"
        style={{ height: 460 }}
      />
    </div>
  );
}

const N_STEPS = 60;
const L1 = 1;
const L2 = 25;
const X0: Vec2 = [4, 1.2];

type Method = "gd" | "hb" | "nesterov";

function gradQuadratic(x: Vec2): [number, number] {
  return [L1 * x[0], L2 * x[1]];
}

function runMethod(
  method: Method,
  alpha: number,
  beta: number,
  steps: number,
): Vec2[] {
  const traj: Vec2[] = [X0];
  let x: [number, number] = [X0[0], X0[1]];
  let xPrev: [number, number] = [X0[0], X0[1]];
  for (let k = 0; k < steps; k += 1) {
    if (method === "gd") {
      const g = gradQuadratic(x);
      const xNext: [number, number] = [x[0] - alpha * g[0], x[1] - alpha * g[1]];
      xPrev = x;
      x = xNext;
    } else if (method === "hb") {
      const g = gradQuadratic(x);
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
      const g = gradQuadratic(y);
      const xNext: [number, number] = [y[0] - alpha * g[0], y[1] - alpha * g[1]];
      xPrev = x;
      x = xNext;
    }
    // Guard against numerical blow-up so the visualization stays in frame.
    const xClamped: [number, number] = [
      Math.max(-12, Math.min(12, x[0])),
      Math.max(-6, Math.min(6, x[1])),
    ];
    traj.push(xClamped);
    x = xClamped;
  }
  return traj;
}

function fOfVec(p: Vec2): number {
  return 0.5 * (L1 * p[0] * p[0] + L2 * p[1] * p[1]);
}

function f(x: number, y: number): number {
  return 0.5 * (L1 * x * x + L2 * y * y);
}

// Three distinct, color-vision-friendly hues that pop against the warm bowl
// gradient (greens/ambers): cool blue for GD, warm orange for HB, magenta-pink
// for Nesterov. All three remain distinguishable in greyscale.
const COLOR_GD = "#0ea5e9"; // sky-500
const COLOR_HB = "#ea580c"; // orange-600
const COLOR_NES = "#c026d3"; // fuchsia-600

export function MomentumTrajectoryDemo() {
  const [alpha, setAlpha] = useState(0.04);
  const [beta, setBeta] = useState(0.85);

  const trajGD = useMemo(() => runMethod("gd", alpha, beta, N_STEPS), [alpha, beta]);
  const trajHB = useMemo(() => runMethod("hb", alpha, beta, N_STEPS), [alpha, beta]);
  const trajNes = useMemo(() => runMethod("nesterov", alpha, beta, N_STEPS), [alpha, beta]);

  const trajectories: Trajectory[] = useMemo(
    () => [
      { label: "Gradiente", color: COLOR_GD, points: trajGD },
      { label: "Heavy Ball", color: COLOR_HB, points: trajHB },
      { label: "Nesterov", color: COLOR_NES, points: trajNes },
    ],
    [trajGD, trajHB, trajNes],
  );

  const finalGap = (t: Vec2[]) => fOfVec(t[t.length - 1] as Vec2);

  // f peak at corners ≈ 0.5*1*25 + 0.5*25*1.5² = 40. Scale so bowl is ~5
  // units tall: this dramatizes the steep y-direction wall while keeping
  // the visualization readable from the default camera angle.
  const heightScale = 5 / 40;

  // f-levels chosen to span the bowl (clamped at 0 floor)
  const contourLevels = [0.5, 2, 6, 12, 20, 32];

  // f is symmetric around origin in [-5,5] x [-1.5,1.5].
  const xDomain = [-5, 5] as const;
  const yDomain = [-1.5, 1.5] as const;

  return (
    <div className="figure-interactive my-8">
      <Descent3D
        f={f}
        xDomain={xDomain}
        yDomain={yDomain}
        trajectories={trajectories}
        optimum={[0, 0]}
        contourLevels={contourLevels}
        heightScale={heightScale}
        durationSeconds={7}
        height={480}
        ariaLabel="Trayectorias 3D de gradiente, Heavy Ball y Nesterov en una cuadrática mal condicionada"
      />

      <div className="mt-4 px-4 py-3 bg-ink-100/40 rounded-md font-sans text-sm space-y-3">
        <div className="text-ink-700 text-xs uppercase tracking-wider">
          Cuadrática Q = diag(1, 25), x₀ = (4, 1.2). κ = 25 (mal condicionada)
        </div>
        <div className="text-base">
          <Tex
            tex={`f(x) = \\tfrac12 (x_1^2 + 25\\,x_2^2),\\quad x_{k+1} = x_k - \\alpha\\,\\nabla f(x_k) + \\beta\\,(x_k - x_{k-1})`}
          />
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
          <div
            className="px-2 py-1.5 bg-paper rounded-sm border-l-2"
            style={{ borderColor: COLOR_GD }}
          >
            <div className="text-ink-500 uppercase tracking-wider">GD</div>
            <div className="font-mono">{finalGap(trajGD).toExponential(2)}</div>
          </div>
          <div
            className="px-2 py-1.5 bg-paper rounded-sm border-l-2"
            style={{ borderColor: COLOR_HB }}
          >
            <div className="text-ink-500 uppercase tracking-wider">HB</div>
            <div className="font-mono">{finalGap(trajHB).toExponential(2)}</div>
          </div>
          <div
            className="px-2 py-1.5 bg-paper rounded-sm border-l-2"
            style={{ borderColor: COLOR_NES }}
          >
            <div className="text-ink-500 uppercase tracking-wider">Nesterov</div>
            <div className="font-mono">{finalGap(trajNes).toExponential(2)}</div>
          </div>
        </div>
        <div className="text-xs text-ink-500">
          Tres bolas bajan por el mismo bowl con la misma α, distinto método. La
          dirección y (eje vertical de la cuadrática) es 25 veces más empinada
          que la x: GD oscila transversalmente y avanza poco hacia el mínimo.
          Heavy Ball amortigua esa oscilación con la inercia. Nesterov evalúa
          el gradiente en el punto extrapolado yₖ, lo que típicamente lo hace
          más estable cuando β se acerca a 1. Subí β y mirá cómo HB se vuelve
          oscilatorio antes que Nesterov.
        </div>
      </div>
    </div>
  );
}
