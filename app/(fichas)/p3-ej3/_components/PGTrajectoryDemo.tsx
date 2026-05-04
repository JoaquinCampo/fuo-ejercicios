"use client";

import { useMemo, useState } from "react";
import { Tex } from "@/components/math/Tex";

type Vec2 = [number, number];

const N_STEPS = 40;

// f(x) = ½ x^T Q x − b^T x con Q = diag(λ1, λ2), b = (b1, b2)
const L1 = 1;
const L2 = 6;
const B1 = 1.6;
const B2 = 0.2;

// Conjunto factible: caja [-1, 1] × [-1, 1] (proyección = clamp coordenada a coordenada)
function projBox(x: Vec2): Vec2 {
  return [
    Math.max(-1, Math.min(1, x[0])),
    Math.max(-1, Math.min(1, x[1])),
  ];
}

function gradF(x: Vec2): Vec2 {
  return [L1 * x[0] - B1, L2 * x[1] - B2];
}

function fOf(x: Vec2): number {
  return 0.5 * (L1 * x[0] * x[0] + L2 * x[1] * x[1]) - (B1 * x[0] + B2 * x[1]);
}

function runPG(x0: Vec2, s: number, steps: number): Vec2[] {
  const traj: Vec2[] = [x0];
  let x: Vec2 = [...x0] as Vec2;
  for (let k = 0; k < steps; k += 1) {
    const g = gradF(x);
    const u: Vec2 = [x[0] - s * g[0], x[1] - s * g[1]];
    x = projBox(u);
    traj.push(x);
  }
  return traj;
}

// Mínimo restringido: el unconstrained es (B1/L1, B2/L2) = (1.6, 0.033),
// proyectado al box: (1, 0.033). Como (1, 0.033) cumple gradiente
// activo, ése es x*.
const X_STAR: Vec2 = [Math.min(1, B1 / L1), Math.min(1, B2 / L2)];

export function PGTrajectoryDemo() {
  // s óptimo = 2/(m+M) con m = 1, M = 6 → s* = 2/7 ≈ 0.286
  const [s, setS] = useState(2 / (L1 + L2));

  const traj = useMemo(() => runPG([-0.9, -0.9], s, N_STEPS), [s]);

  const W = 600;
  const H = 360;
  const padX = 40;
  const padY = 30;
  const xRange: [number, number] = [-1.4, 1.8];
  const yRange: [number, number] = [-1.3, 1.3];
  const innerW = W - 2 * padX;
  const innerH = H - 2 * padY;

  const xToPx = (xv: number) =>
    padX + ((xv - xRange[0]) / (xRange[1] - xRange[0])) * innerW;
  const yToPx = (yv: number) =>
    padY + ((yRange[1] - yv) / (yRange[1] - yRange[0])) * innerH;

  const buildPath = (t: Vec2[]) =>
    t
      .map(([px, py], i) => `${i === 0 ? "M" : "L"} ${xToPx(px)} ${yToPx(py)}`)
      .join(" ");

  // Curvas de nivel del cuadrático f, recordando f - f* = ½(x − x_unc)^T Q (x − x_unc)
  // donde x_unc = (B1/L1, B2/L2). Más directo: graficar f(x) = c.
  const fStarUnc = -(0.5 * (B1 * B1) / L1 + 0.5 * (B2 * B2) / L2);
  const levels = [-0.5, -0.2, 0.5, 1.5, 3, 5];
  const ellipseFor = (c: number) => {
    // f(x) = c → (x1 − B1/L1)^2 / (2(c − fStarUnc)/L1) + (x2 − B2/L2)^2 / (2(c − fStarUnc)/L2) = 1
    const cShift = c - fStarUnc;
    if (cShift <= 0) return null;
    return {
      cx: B1 / L1,
      cy: B2 / L2,
      ax: Math.sqrt((2 * cShift) / L1),
      ay: Math.sqrt((2 * cShift) / L2),
    };
  };

  const finalGap = fOf(traj[traj.length - 1] as Vec2) - fOf(X_STAR);
  const finalDist = Math.hypot(
    (traj[traj.length - 1] as Vec2)[0] - X_STAR[0],
    (traj[traj.length - 1] as Vec2)[1] - X_STAR[1],
  );
  const sUpper = 2 / L2;
  const stable = s > 0 && s < sUpper;

  return (
    <div className="figure-interactive my-8">
      <div className="border border-ink-100 rounded-md overflow-hidden bg-paper">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height="auto"
          style={{ display: "block" }}
        >
          {/* curvas de nivel */}
          {levels.map((c) => {
            const e = ellipseFor(c);
            if (!e) return null;
            return (
              <ellipse
                key={`lev-${c}`}
                cx={xToPx(e.cx)}
                cy={yToPx(e.cy)}
                rx={(e.ax / (xRange[1] - xRange[0])) * innerW}
                ry={(e.ay / (yRange[1] - yRange[0])) * innerH}
                stroke="currentColor"
                strokeOpacity={0.15}
                fill="none"
                strokeWidth={1}
              />
            );
          })}

          {/* caja [-1,1]^2 */}
          <rect
            x={xToPx(-1)}
            y={yToPx(1)}
            width={xToPx(1) - xToPx(-1)}
            height={yToPx(-1) - yToPx(1)}
            stroke="var(--color-blue, #2563eb)"
            strokeOpacity={0.6}
            fill="var(--color-blue, #2563eb)"
            fillOpacity={0.05}
            strokeWidth={1.6}
          />

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

          {/* trayectoria */}
          <path
            d={buildPath(traj)}
            stroke="var(--color-accent-600, #6359e9)"
            strokeWidth={1.5}
            fill="none"
          />
          {traj.map((p, i) => (
            <circle
              key={`pt-${i}`}
              cx={xToPx(p[0])}
              cy={yToPx(p[1])}
              r={i === 0 ? 4 : 2.4}
              fill="var(--color-accent-600, #6359e9)"
              stroke="white"
              strokeWidth={1}
              opacity={i === 0 || i === traj.length - 1 ? 1 : 0.7}
            />
          ))}

          {/* x* */}
          <circle
            cx={xToPx(X_STAR[0])}
            cy={yToPx(X_STAR[1])}
            r={5}
            fill="var(--color-success, #16a34a)"
            stroke="white"
            strokeWidth={1.5}
          />
          <text
            x={xToPx(X_STAR[0]) + 8}
            y={yToPx(X_STAR[1]) - 8}
            fontSize={11}
            fontFamily="ui-monospace"
            fill="var(--color-success, #16a34a)"
          >
            x*
          </text>

          {/* unconstrained min (afuera de la caja) */}
          <circle
            cx={xToPx(B1 / L1)}
            cy={yToPx(B2 / L2)}
            r={4}
            fill="none"
            stroke="var(--color-ink-500, #6b7280)"
            strokeWidth={1.5}
            strokeDasharray="2 2"
          />
          <text
            x={xToPx(B1 / L1) + 8}
            y={yToPx(B2 / L2) - 8}
            fontSize={10}
            fontFamily="ui-monospace"
            fill="currentColor"
            fillOpacity={0.55}
          >
            min sin restr.
          </text>
        </svg>
      </div>

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
          El mínimo sin restricción cae fuera de la caja en (1.6, 0.033). El
          mínimo restringido es <strong>x* = (1, 0.033)</strong> sobre el lado
          derecho. Para s ∈ (0, 2/M = {sUpper.toFixed(3)}) el método contrae;
          fuera de ese intervalo oscila o diverge. El paso óptimo s* = 2/(m+M)
          minimiza la tasa.
        </div>
      </div>
    </div>
  );
}
