"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Tex } from "@/components/math/Tex";
import type { Trajectory, Vec2 } from "@/components/viz/Descent3D";

const Descent3D = dynamic(
  () => import("@/components/viz/Descent3D").then((m) => m.Descent3D),
  {
    ssr: false,
    loading: () => (
      <div className="not-prose">
        <div
          className="border border-ink-100 rounded-md bg-paper-soft animate-pulse"
          style={{ height: 460 }}
        />
      </div>
    ),
  },
);

type V2 = [number, number];

const N_STEPS = 40;
const L1 = 1;
const L2 = 6;
const B1 = 1.6;
const B2 = 0.2;

function projBox(x: V2): V2 {
  return [
    Math.max(-1, Math.min(1, x[0])),
    Math.max(-1, Math.min(1, x[1])),
  ];
}

function gradF(x: V2): V2 {
  return [L1 * x[0] - B1, L2 * x[1] - B2];
}

function fOfVec(p: Vec2): number {
  return 0.5 * (L1 * p[0] * p[0] + L2 * p[1] * p[1]) - (B1 * p[0] + B2 * p[1]);
}

// Unconstrained minimum value, used to shift the surface so its lowest
// point sits on (not below) the rendered floor.
const F_OFFSET = 0.5 * ((B1 * B1) / L1 + (B2 * B2) / L2);

function f(x: number, y: number): number {
  return 0.5 * (L1 * x * x + L2 * y * y) - (B1 * x + B2 * y) + F_OFFSET;
}

function runPG(x0: V2, s: number, steps: number): V2[] {
  const traj: V2[] = [x0];
  let x: V2 = [x0[0], x0[1]];
  for (let k = 0; k < steps; k += 1) {
    const g = gradF(x);
    const u: V2 = [x[0] - s * g[0], x[1] - s * g[1]];
    x = projBox(u);
    traj.push(x);
  }
  return traj;
}

const X_STAR: V2 = [Math.min(1, B1 / L1), Math.min(1, B2 / L2)];
const COLOR_TRAJ = "#0ea5e9";

export function PGTrajectoryDemo() {
  // s* = 2/(m+M)
  const [s, setS] = useState(2 / (L1 + L2));

  const traj = useMemo(() => runPG([-0.9, -0.9], s, N_STEPS), [s]);

  const trajectories: Trajectory[] = useMemo(
    () => [{ label: "P_X(x − s∇f)", color: COLOR_TRAJ, points: traj }],
    [traj],
  );

  const finalGap = fOfVec(traj[traj.length - 1] as Vec2) - fOfVec(X_STAR);
  const finalDist = Math.hypot(
    (traj[traj.length - 1] as Vec2)[0] - X_STAR[0],
    (traj[traj.length - 1] as Vec2)[1] - X_STAR[1],
  );
  const sUpper = 2 / L2;
  const stable = s > 0 && s < sUpper;

  // bowl spans the box plus margin (right side shows unconstrained min direction).
  const xDomain = [-1.3, 1.8] as const;
  const yDomain = [-1.3, 1.3] as const;

  // Keep the bowl modest so the camera can look down INTO it. Peak ≈ 1.8 units.
  const heightScale = 0.22;

  const contourLevels = [0.15, 0.4, 0.9, 1.8, 3.2, 5];

  return (
    <div className="figure-interactive my-8">
      <Descent3D
        f={f}
        xDomain={xDomain}
        yDomain={yDomain}
        trajectories={trajectories}
        optimum={X_STAR}
        feasible={{ kind: "rect", x: [-1, 1], y: [-1, 1] }}
        contourLevels={contourLevels}
        heightScale={heightScale}
        durationSeconds={9}
        height={460}
        ariaLabel="Trayectoria 3D de gradiente proyectado en una caja [-1,1]² sobre una cuadrática elíptica"
        cameraPosition={[2.6, 3.4, 2.8]}
        cameraTarget={[0.1, 0.2, 0]}
      />

      <div className="mt-4 px-4 py-3 bg-ink-100/40 rounded-md font-sans text-sm space-y-3">
        <div className="text-ink-700 text-xs uppercase tracking-wider">
          Gradiente proyectado en caja [−1, 1]², Q = diag(1, 6), b = (1.6, 0.2)
        </div>
        <div className="text-base">
          <Tex
            tex={`x^{k+1} = P_{\\mathcal X}(x^k - s\\,\\nabla f(x^k)),\\quad m = ${L1},\\quad M = ${L2},\\quad s^* = \\tfrac{2}{m+M} = ${(2 / (L1 + L2)).toFixed(3)}`}
          />
        </div>
        <label className="block">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-mono">s</span>
            <span className="font-mono text-ink-500">{s.toFixed(3)}</span>
          </div>
          <input
            type="range"
            min={0.01}
            max={0.45}
            step={0.005}
            value={s}
            onChange={(e) => setS(Number(e.target.value))}
            className="w-full accent-accent-600"
          />
        </label>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div
            className="px-2 py-1.5 bg-paper rounded-sm border-l-2"
            style={{
              borderColor: stable
                ? "var(--color-success, #16a34a)"
                : "var(--color-warning, #d97706)",
            }}
          >
            <div className="text-ink-500 uppercase tracking-wider">
              ¿s ∈ (0, 2/M)?
            </div>
            <div className="font-mono">{stable ? "sí" : "no"}</div>
          </div>
          <div className="px-2 py-1.5 bg-paper rounded-sm">
            <div className="text-ink-500 uppercase tracking-wider">
              gap final f − f*
            </div>
            <div className="font-mono">{finalGap.toExponential(2)}</div>
          </div>
          <div className="px-2 py-1.5 bg-paper rounded-sm">
            <div className="text-ink-500 uppercase tracking-wider">
              ‖x_N − x*‖
            </div>
            <div className="font-mono">{finalDist.toExponential(2)}</div>
          </div>
        </div>
        <div className="text-xs text-ink-500">
          Bowl elíptico (más empinado en x₂ que en x₁). El cuadrado azul sobre
          el piso es la caja factible <strong>[−1, 1]²</strong>. El óptimo sin
          restricciones cae afuera en (1.6, 0.033); el óptimo restringido x*
          cae sobre el lado derecho en (1, 0.033). La bola hace un paso de
          gradiente y luego se proyecta a la caja, lo que se ve en la
          trayectoria como segmentos rectos que se "pegan" al borde cuando el
          gradiente apuntaría afuera. Para s ∈ (0, 2/M = {sUpper.toFixed(3)})
          el método contrae; fuera de ese rango oscila o diverge.
        </div>
      </div>
    </div>
  );
}
