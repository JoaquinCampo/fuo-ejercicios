"use client";

import { useMemo, useState } from "react";
import { Tex } from "@/components/math/Tex";

// Pequeño LASSO con A diagonal para tener fórmula cerrada.
// min ½ ‖A x − b‖² + λ ‖x‖₁  con A = diag(d₁,…,d_n) → x_i* = soft_{λ/d_i²}(b_i/d_i)
// Aquí elegimos d_i = 1, así x_i* = soft_λ(b_i).
const B = [2.0, -1.5, 0.8, -0.3, 0.05, 1.2, -0.6];

function softThreshold(w: number, kappa: number): number {
  if (w > kappa) return w - kappa;
  if (w < -kappa) return w + kappa;
  return 0;
}

export function LASSOPathDemo() {
  const [lambda, setLambda] = useState(0.4);

  const lambdaMax = Math.max(...B.map(Math.abs));
  const xs = B.map((b) => softThreshold(b, lambda));
  const nonzero = xs.filter((x) => Math.abs(x) > 1e-9).length;
  const l1 = xs.reduce((acc, x) => acc + Math.abs(x), 0);
  const fitErr = B.reduce((acc, b, i) => acc + (b - (xs[i] as number)) ** 2, 0) / 2;

  // Path: para cada λ en una grilla, calcular x*(λ) por coordenada
  const lambdaGrid = useMemo(() => {
    const arr: number[] = [];
    const N = 80;
    for (let i = 0; i <= N; i += 1) arr.push((i / N) * lambdaMax * 1.05);
    return arr;
  }, [lambdaMax]);

  const W = 600;
  const H = 320;
  const padL = 50;
  const padR = 30;
  const padT = 25;
  const padB = 35;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const yMax = Math.max(...B.map(Math.abs)) * 1.15;
  const yToPx = (y: number) =>
    padT + ((yMax - y) / (2 * yMax)) * innerH;
  const lambdaToPx = (l: number) =>
    padL + (l / (lambdaMax * 1.05)) * innerW;

  const colors = [
    "#6359e9",
    "#16a34a",
    "#d97706",
    "#dc2626",
    "#0ea5e9",
    "#9333ea",
    "#65a30d",
  ];

  const linePathFor = (idx: number) =>
    lambdaGrid
      .map((lg, i) => {
        const xi = softThreshold(B[idx] as number, lg);
        return `${i === 0 ? "M" : "L"} ${lambdaToPx(lg)} ${yToPx(xi)}`;
      })
      .join(" ");

  return (
    <div className="figure-interactive my-8">
      <div className="border border-ink-100 rounded-md overflow-hidden bg-paper">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height="auto"
          style={{ display: "block" }}
        >
          {/* y = 0 */}
          <line
            x1={padL}
            y1={yToPx(0)}
            x2={padL + innerW}
            y2={yToPx(0)}
            stroke="currentColor"
            strokeOpacity={0.3}
          />
          {/* eje y */}
          <line
            x1={padL}
            y1={padT}
            x2={padL}
            y2={padT + innerH}
            stroke="currentColor"
            strokeOpacity={0.2}
          />
          {/* λ vertical actual */}
          <line
            x1={lambdaToPx(lambda)}
            y1={padT}
            x2={lambdaToPx(lambda)}
            y2={padT + innerH}
            stroke="var(--color-warning, #d97706)"
            strokeWidth={1.5}
            strokeDasharray="3 3"
          />

          {/* curvas */}
          {B.map((_b, i) => (
            <g key={`path-${i}`}>
              <path
                d={linePathFor(i)}
                stroke={colors[i % colors.length]}
                strokeWidth={2}
                fill="none"
                opacity={0.85}
              />
              <text
                x={lambdaToPx(0) - 6}
                y={yToPx(B[i] as number) + 3}
                textAnchor="end"
                fontSize={10}
                fontFamily="ui-monospace"
                fill={colors[i % colors.length] ?? "currentColor"}
              >
                x{i + 1}
              </text>
            </g>
          ))}

          {/* puntos en λ actual */}
          {xs.map((xi, i) => (
            <circle
              key={`pt-${i}`}
              cx={lambdaToPx(lambda)}
              cy={yToPx(xi)}
              r={4}
              fill={colors[i % colors.length] ?? "currentColor"}
              stroke="white"
              strokeWidth={1.2}
            />
          ))}

          {/* ticks x */}
          {[0, lambdaMax * 0.5, lambdaMax].map((lv, idx) => (
            <g key={`xt-${idx}`}>
              <text
                x={lambdaToPx(lv)}
                y={padT + innerH + 16}
                textAnchor="middle"
                fontSize={10}
                fontFamily="ui-monospace"
                fill="currentColor"
                fillOpacity={0.6}
              >
                {idx === 2 ? "λ_max" : lv.toFixed(2)}
              </text>
            </g>
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
            λ
          </text>
        </svg>
      </div>

      <div className="mt-4 px-4 py-3 bg-ink-100/40 rounded-md font-sans text-sm space-y-3">
        <div className="text-ink-700 text-xs uppercase tracking-wider">
          Path de LASSO (A = I): cómo cambia x*(λ) al variar λ
        </div>
        <div className="text-base">
          <Tex
            tex={`x_i^*(\\lambda) = \\text{soft}_{\\lambda}(b_i),\\quad b = (${B.map((b) => b.toFixed(2)).join(",\\,")})`}
          />
        </div>
        <label className="block">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-mono">λ</span>
            <span className="font-mono text-ink-500">{lambda.toFixed(3)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={lambdaMax * 1.05}
            step={lambdaMax * 0.005}
            value={lambda}
            onChange={(e) => setLambda(Number(e.target.value))}
            className="w-full accent-accent-600"
          />
        </label>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="px-2 py-1.5 bg-paper rounded-sm">
            <div className="text-ink-500 uppercase tracking-wider">
              ‖x*‖₁
            </div>
            <div className="font-mono">{l1.toFixed(3)}</div>
          </div>
          <div className="px-2 py-1.5 bg-paper rounded-sm">
            <div className="text-ink-500 uppercase tracking-wider">
              ½‖Ax−b‖²
            </div>
            <div className="font-mono">{fitErr.toFixed(3)}</div>
          </div>
          <div className="px-2 py-1.5 bg-paper rounded-sm">
            <div className="text-ink-500 uppercase tracking-wider">
              soporte (no-cero)
            </div>
            <div className="font-mono">
              {nonzero}/{B.length}
            </div>
          </div>
        </div>
        <div className="text-xs text-ink-500">
          Cada curva es la trayectoria de una coordenada{" "}
          <code>x_i*(λ)</code> al barrer <code>λ</code>. Para <code>λ = 0</code>{" "}
          es la solución de mínimos cuadrados <code>x = b</code>; al aumentar{" "}
          <code>λ</code>, las coordenadas chicas <strong>desaparecen primero</strong>{" "}
          (cuando <code>|b_i| ≤ λ</code>); las grandes se "achican" linealmente
          y eventualmente también se anulan. Para <code>λ ≥ λ_max</code> la
          solución es 0. Esa estructura es lo que hace a LASSO un selector
          automático de variables.
        </div>
      </div>
    </div>
  );
}
