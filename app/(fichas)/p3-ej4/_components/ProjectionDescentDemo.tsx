"use client";

import { useMemo, useState } from "react";
import { Tex } from "@/components/math/Tex";

type Vec2 = [number, number];

// f(x) = ½ ((x_1 - 1.6)² · 1 + x_2² · 6)  (cuadrática, gradiente lineal)
// ∇f(x) = ( (x_1 - 1.6),  6 x_2 )
const Q1 = 1;
const Q2 = 6;
const C1 = 1.6;
const C2 = 0;
const gradF = (x: Vec2): Vec2 => [Q1 * (x[0] - C1), Q2 * (x[1] - C2)];

// Caja [-1, 1]^2 (proyección coordenada a coordenada)
const projBox = (p: Vec2): Vec2 => [
  Math.max(-1, Math.min(1, p[0])),
  Math.max(-1, Math.min(1, p[1])),
];

export function ProjectionDescentDemo() {
  const [x0, setX0] = useState(-0.6);
  const [y0, setY0] = useState(0.7);
  const [s, setS] = useState(0.25);

  const x: Vec2 = [x0, y0];
  const g = gradF(x);
  const z: Vec2 = [x[0] - s * g[0], x[1] - s * g[1]];
  const xBar = projBox(z);
  const d: Vec2 = [xBar[0] - x[0], xBar[1] - x[1]];
  const dNormSq = d[0] * d[0] + d[1] * d[1];
  const innerGD = g[0] * d[0] + g[1] * d[1];
  const bound = -dNormSq / Math.max(s, 1e-9);

  const W = 600;
  const H = 360;
  const padX = 40;
  const padY = 30;
  const xRange: [number, number] = [-1.4, 2.2];
  const yRange: [number, number] = [-1.4, 1.4];
  const innerW = W - 2 * padX;
  const innerH = H - 2 * padY;

  const xToPx = (xv: number) =>
    padX + ((xv - xRange[0]) / (xRange[1] - xRange[0])) * innerW;
  const yToPx = (yv: number) =>
    padY + ((yRange[1] - yv) / (yRange[1] - yRange[0])) * innerH;

  // curvas de nivel (centradas en el unconstrained min (1.6, 0))
  const levels = [0.05, 0.3, 1, 2.5, 5];
  const ellipseFor = (c: number) => ({
    cx: C1,
    cy: C2,
    ax: Math.sqrt((2 * c) / Q1),
    ay: Math.sqrt((2 * c) / Q2),
  });

  // arrow
  const arrow = (
    p1: Vec2,
    p2: Vec2,
    color: string,
    label: string,
    key: string,
  ) => {
    const x1 = xToPx(p1[0]);
    const y1 = yToPx(p1[1]);
    const x2 = xToPx(p2[0]);
    const y2 = yToPx(p2[1]);
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const head = 8;
    return (
      <g key={key}>
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={color}
          strokeWidth={2}
        />
        <polygon
          points={`${x2},${y2} ${x2 - head * Math.cos(angle - Math.PI / 6)},${y2 - head * Math.sin(angle - Math.PI / 6)} ${x2 - head * Math.cos(angle + Math.PI / 6)},${y2 - head * Math.sin(angle + Math.PI / 6)}`}
          fill={color}
        />
        <text
          x={(x1 + x2) / 2 + 6}
          y={(y1 + y2) / 2 - 6}
          fontSize={11}
          fontFamily="ui-monospace"
          fill={color}
        >
          {label}
        </text>
      </g>
    );
  };

  const tex = useMemo(
    () =>
      `\\langle \\nabla f(x^k),\\, \\bar x^k - x^k \\rangle = ${innerGD.toFixed(3)} \\;\\leq\\; -\\tfrac{1}{s}\\|\\bar x^k - x^k\\|^2 = ${bound.toFixed(3)}`,
    [innerGD, bound],
  );

  const valid = innerGD <= bound + 1e-6;

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

          {/* caja */}
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

          {/* z = x - s ∇f (puede caer afuera) */}
          <line
            x1={xToPx(x[0])}
            y1={yToPx(x[1])}
            x2={xToPx(z[0])}
            y2={yToPx(z[1])}
            stroke="var(--color-ink-500, #6b7280)"
            strokeWidth={1.4}
            strokeDasharray="3 3"
            opacity={0.7}
          />
          <circle
            cx={xToPx(z[0])}
            cy={yToPx(z[1])}
            r={3}
            fill="none"
            stroke="var(--color-ink-500, #6b7280)"
            strokeWidth={1.5}
          />
          <text
            x={xToPx(z[0]) + 6}
            y={yToPx(z[1]) - 6}
            fontSize={10}
            fontFamily="ui-monospace"
            fill="currentColor"
            fillOpacity={0.55}
          >
            z = x − s∇f
          </text>

          {/* línea de proyección z → x̄ */}
          <line
            x1={xToPx(z[0])}
            y1={yToPx(z[1])}
            x2={xToPx(xBar[0])}
            y2={yToPx(xBar[1])}
            stroke="var(--color-ink-500, #6b7280)"
            strokeWidth={1.2}
            strokeDasharray="2 4"
            opacity={0.55}
          />

          {/* gradiente */}
          {arrow(
            x,
            [x[0] + g[0] * 0.15, x[1] + g[1] * 0.15],
            "var(--color-warning, #d97706)",
            "∇f",
            "grad",
          )}

          {/* dirección d = x̄ - x */}
          {arrow(
            x,
            xBar,
            "var(--color-accent-600, #6359e9)",
            "d = x̄ − x",
            "dir",
          )}

          {/* puntos */}
          <circle
            cx={xToPx(x[0])}
            cy={yToPx(x[1])}
            r={5}
            fill="var(--color-accent-600, #6359e9)"
            stroke="white"
            strokeWidth={1.5}
          />
          <text
            x={xToPx(x[0]) - 6}
            y={yToPx(x[1]) - 8}
            fontSize={11}
            fontFamily="ui-monospace"
            fill="var(--color-accent-600, #6359e9)"
            textAnchor="end"
          >
            x_k
          </text>

          <circle
            cx={xToPx(xBar[0])}
            cy={yToPx(xBar[1])}
            r={5}
            fill="var(--color-success, #16a34a)"
            stroke="white"
            strokeWidth={1.5}
          />
          <text
            x={xToPx(xBar[0]) + 8}
            y={yToPx(xBar[1]) + 14}
            fontSize={11}
            fontFamily="ui-monospace"
            fill="var(--color-success, #16a34a)"
          >
            x̄_k
          </text>
        </svg>
      </div>

      <div className="mt-4 px-4 py-3 bg-ink-100/40 rounded-md font-sans text-sm space-y-3">
        <div className="text-ink-700 text-xs uppercase tracking-wider">
          La dirección d = x̄ − x es de descenso, con cota −‖d‖²/s
        </div>
        <div className="text-base">
          <Tex tex={tex} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <label className="block">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-mono">x_1</span>
              <span className="font-mono text-ink-500">{x0.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={-1}
              max={1}
              step={0.05}
              value={x0}
              onChange={(e) => setX0(Number(e.target.value))}
              className="w-full accent-accent-600"
            />
          </label>
          <label className="block">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-mono">x_2</span>
              <span className="font-mono text-ink-500">{y0.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={-1}
              max={1}
              step={0.05}
              value={y0}
              onChange={(e) => setY0(Number(e.target.value))}
              className="w-full accent-accent-600"
            />
          </label>
          <label className="block">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-mono">s</span>
              <span className="font-mono text-ink-500">{s.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.05}
              max={0.5}
              step={0.01}
              value={s}
              onChange={(e) => setS(Number(e.target.value))}
              className="w-full accent-accent-600"
            />
          </label>
        </div>
        <div
          className="px-3 py-2 bg-paper rounded-sm text-center text-xs"
          style={{
            borderLeft: valid
              ? "3px solid var(--color-success, #16a34a)"
              : "3px solid var(--color-warning, #d97706)",
          }}
        >
          <span className="font-mono">
            ⟨∇f, d⟩ ≤ −‖d‖²/s: {valid ? "se cumple" : "violada (no debería)"}
          </span>
        </div>
        <div className="text-xs text-ink-500">
          Movés <code>x_k</code> dentro de la caja: el método propone <code>z = x_k − s∇f</code>{" "}
          (que puede caer afuera, gris punteado), y proyecta a{" "}
          <code>x̄_k</code> (verde). La dirección{" "}
          <span style={{ color: "var(--color-accent-600, #6359e9)" }}>
            d = x̄ − x
          </span>{" "}
          forma siempre ángulo obtuso con{" "}
          <span style={{ color: "var(--color-warning, #d97706)" }}>∇f</span>:
          eso es lo que dice ⟨∇f, d⟩ ≤ −‖d‖²/s, una cota de descenso{" "}
          <strong>cuantitativa</strong> (no solo signo, sino magnitud
          proporcional a ‖d‖²).
        </div>
      </div>
    </div>
  );
}
