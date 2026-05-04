"use client";

import { useMemo, useState } from "react";
import { Tex } from "@/components/math/Tex";

type Vec2 = [number, number];
type Mat2 = [[number, number], [number, number]];

const N_GD = 80;
const N_BFGS = 30;

function matVec(M: Mat2, v: Vec2): Vec2 {
  return [
    M[0][0] * v[0] + M[0][1] * v[1],
    M[1][0] * v[0] + M[1][1] * v[1],
  ];
}

function dot(u: Vec2, v: Vec2) {
  return u[0] * v[0] + u[1] * v[1];
}

function outer(u: Vec2, v: Vec2): Mat2 {
  return [
    [u[0] * v[0], u[0] * v[1]],
    [u[1] * v[0], u[1] * v[1]],
  ];
}

function matAdd(A: Mat2, B: Mat2): Mat2 {
  return [
    [A[0][0] + B[0][0], A[0][1] + B[0][1]],
    [A[1][0] + B[1][0], A[1][1] + B[1][1]],
  ];
}

function matSub(A: Mat2, B: Mat2): Mat2 {
  return [
    [A[0][0] - B[0][0], A[0][1] - B[0][1]],
    [A[1][0] - B[1][0], A[1][1] - B[1][1]],
  ];
}

function matMul(A: Mat2, B: Mat2): Mat2 {
  return [
    [
      A[0][0] * B[0][0] + A[0][1] * B[1][0],
      A[0][0] * B[0][1] + A[0][1] * B[1][1],
    ],
    [
      A[1][0] * B[0][0] + A[1][1] * B[1][0],
      A[1][0] * B[0][1] + A[1][1] * B[1][1],
    ],
  ];
}

function matScale(A: Mat2, c: number): Mat2 {
  return [
    [A[0][0] * c, A[0][1] * c],
    [A[1][0] * c, A[1][1] * c],
  ];
}

const I2: Mat2 = [
  [1, 0],
  [0, 1],
];

function gradQ(x: Vec2, l1: number, l2: number): Vec2 {
  return [l1 * x[0], l2 * x[1]];
}

function fOf(x: Vec2, l1: number, l2: number) {
  return 0.5 * (l1 * x[0] * x[0] + l2 * x[1] * x[1]);
}

// Línea exacta para cuadrática: α* = -(g·d)/(d·Qd)
function exactLineQuad(x: Vec2, d: Vec2, l1: number, l2: number): number {
  const g = gradQ(x, l1, l2);
  const Qd: Vec2 = [l1 * d[0], l2 * d[1]];
  const num = -dot(g, d);
  const den = dot(d, Qd);
  return Math.abs(den) < 1e-12 ? 0 : num / den;
}

function runGD(
  x0: Vec2,
  l1: number,
  l2: number,
  alpha: number,
  steps: number,
): Vec2[] {
  const traj: Vec2[] = [x0];
  let x: Vec2 = [...x0] as Vec2;
  for (let k = 0; k < steps; k += 1) {
    const g = gradQ(x, l1, l2);
    x = [x[0] - alpha * g[0], x[1] - alpha * g[1]];
    traj.push(x);
  }
  return traj;
}

function runBFGS(x0: Vec2, l1: number, l2: number, steps: number): Vec2[] {
  const traj: Vec2[] = [x0];
  let x: Vec2 = [...x0] as Vec2;
  let D: Mat2 = I2;
  for (let k = 0; k < steps; k += 1) {
    const g = gradQ(x, l1, l2);
    if (Math.hypot(g[0], g[1]) < 1e-12) {
      traj.push(x);
      continue;
    }
    const d: Vec2 = [
      -(D[0][0] * g[0] + D[0][1] * g[1]),
      -(D[1][0] * g[0] + D[1][1] * g[1]),
    ];
    const alpha = exactLineQuad(x, d, l1, l2);
    const xNew: Vec2 = [x[0] + alpha * d[0], x[1] + alpha * d[1]];
    const gNew = gradQ(xNew, l1, l2);
    const sk: Vec2 = [xNew[0] - x[0], xNew[1] - x[1]];
    const yk: Vec2 = [gNew[0] - g[0], gNew[1] - g[1]];
    const ys = dot(yk, sk);
    if (ys > 1e-12) {
      const ysInv = 1 / ys;
      // (I - s y^T / ys) D (I - y s^T / ys) + s s^T / ys
      const A: Mat2 = matSub(I2, matScale(outer(sk, yk), ysInv));
      const B: Mat2 = matSub(I2, matScale(outer(yk, sk), ysInv));
      D = matAdd(matMul(A, matMul(D, B)), matScale(outer(sk, sk), ysInv));
    }
    x = xNew;
    traj.push(x);
  }
  return traj;
}

export function BFGSTrajectoryDemo() {
  const [alphaGD, setAlphaGD] = useState(0.077); // 2/(L+m) con L=25,m=1
  const l1 = 1;
  const l2 = 25;
  const x0: Vec2 = [4, 1.2];

  const trajGD = useMemo(
    () => runGD(x0, l1, l2, alphaGD, N_GD),
    [alphaGD],
  );
  const trajBFGS = useMemo(() => runBFGS(x0, l1, l2, N_BFGS), []);

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

  const buildPath = (traj: Vec2[]) =>
    traj
      .map(
        ([px, py], i) =>
          `${i === 0 ? "M" : "L"} ${xToPx(px)} ${yToPx(py)}`,
      )
      .join(" ");

  const levels = [0.5, 2, 8, 18, 32, 50];

  const finalGap = (traj: Vec2[]) => {
    const last = traj[traj.length - 1] as Vec2;
    return fOf(last, l1, l2);
  };

  // Conteo de iteraciones para alcanzar gap < 1e-10
  const iterToTol = (traj: Vec2[], tol: number) => {
    for (let i = 0; i < traj.length; i += 1) {
      if (fOf(traj[i] as Vec2, l1, l2) < tol) return i;
    }
    return null;
  };
  const itGD = iterToTol(trajGD, 1e-10);
  const itBFGS = iterToTol(trajBFGS, 1e-10);

  return (
    <div className="figure-interactive my-8">
      <div className="border border-ink-100 rounded-md overflow-hidden bg-paper">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height="auto"
          style={{ display: "block" }}
        >
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

          {/* GD */}
          <path
            d={buildPath(trajGD)}
            stroke="var(--color-ink-500, #6b7280)"
            strokeWidth={1.5}
            fill="none"
            opacity={0.7}
          />
          {trajGD.map((p, i) =>
            i % 4 === 0 ? (
              <circle
                key={`gd-${i}`}
                cx={xToPx(p[0])}
                cy={yToPx(p[1])}
                r={2}
                fill="var(--color-ink-500, #6b7280)"
              />
            ) : null,
          )}

          {/* BFGS */}
          <path
            d={buildPath(trajBFGS)}
            stroke="var(--color-accent-600, #6359e9)"
            strokeWidth={2}
            fill="none"
          />
          {trajBFGS.map((p, i) => (
            <circle
              key={`bfgs-${i}`}
              cx={xToPx(p[0])}
              cy={yToPx(p[1])}
              r={i === 0 ? 4 : 3}
              fill="var(--color-accent-600, #6359e9)"
              stroke="white"
              strokeWidth={1}
            />
          ))}

          <circle
            cx={xToPx(0)}
            cy={yToPx(0)}
            r={4}
            fill="var(--color-success, #16a34a)"
          />
          <text
            x={xToPx(0) + 8}
            y={yToPx(0) - 8}
            fontSize={11}
            fontFamily="ui-monospace"
            fill="var(--color-success, #16a34a)"
          >
            x*
          </text>
        </svg>
      </div>

      <div className="mt-4 px-4 py-3 bg-ink-100/40 rounded-md font-sans text-sm space-y-3">
        <div className="text-ink-700 text-xs uppercase tracking-wider">
          BFGS vs GD en cuadrática Q = diag(1, 25), x₀ = (4, 1.2)
        </div>
        <div className="text-base">
          <Tex
            tex={`d_k = -D_k\\,\\nabla f(x_k),\\quad x_{k+1} = x_k + \\alpha_k\\,d_k\\quad (\\alpha_k\\text{ óptimo en cuadráticas})`}
          />
        </div>
        <label className="block">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-mono">α (paso GD)</span>
            <span className="font-mono text-ink-500">{alphaGD.toFixed(3)}</span>
          </div>
          <input
            type="range"
            min={0.01}
            max={0.079}
            step={0.001}
            value={alphaGD}
            onChange={(e) => setAlphaGD(Number(e.target.value))}
            className="w-full accent-accent-600"
          />
        </label>
        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <div
            className="px-2 py-1.5 bg-paper rounded-sm border-l-2"
            style={{ borderColor: "var(--color-ink-500, #6b7280)" }}
          >
            <div className="text-ink-500 uppercase tracking-wider">
              GD: gap final / iter ≤ 10⁻¹⁰
            </div>
            <div className="font-mono">
              {finalGap(trajGD).toExponential(2)} / {itGD ?? "—"}
            </div>
          </div>
          <div
            className="px-2 py-1.5 bg-paper rounded-sm border-l-2"
            style={{ borderColor: "var(--color-accent-600, #6359e9)" }}
          >
            <div className="text-ink-500 uppercase tracking-wider">
              BFGS: gap final / iter ≤ 10⁻¹⁰
            </div>
            <div className="font-mono">
              {finalGap(trajBFGS).toExponential(2)} / {itBFGS ?? "—"}
            </div>
          </div>
        </div>
        <div className="text-xs text-ink-500">
          Con búsqueda lineal exacta en cuadráticas, BFGS termina en{" "}
          <strong>n iteraciones</strong> (acá n = 2): los ejes de la
          actualización terminan alineados con los autovectores de Q. GD pelea
          contra el condicionamiento κ = 25 y necesita decenas de pasos. La
          ventaja se mantiene en problemas no cuadráticos (con line search
          adecuada): BFGS captura curvatura sin armar la Hessiana.
        </div>
      </div>
    </div>
  );
}
