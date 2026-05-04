"use client";

import { useMemo, useState } from "react";
import { Tex } from "@/components/math/Tex";

const A = [3, 1.5, 0.8, 0.5, 2.5];

function xOf(nu: number, a: number): number {
  return Math.max(0, 1 / nu - 1 / a);
}

// Dado P, encontrar ν tal que sum x_i(ν) = P (búsqueda monótona)
function solveNu(P: number): number {
  // sum x_i(ν) es decreciente en ν. Buscar ν > 0.
  // Para ν muy chico (ν → 0+) el agua sube infinito → suma → ∞.
  // Para ν grande la suma → 0.
  let lo = 1e-6;
  let hi = Math.max(...A) * 100;
  for (let i = 0; i < 80; i += 1) {
    const mid = (lo + hi) / 2;
    const sum = A.reduce((acc, a) => acc + xOf(mid, a), 0);
    if (sum > P) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export function WaterFillingDemo() {
  const [P, setP] = useState(2);
  const [nuManual, setNuManual] = useState<number | null>(null);

  const nuStar = useMemo(() => solveNu(P), [P]);
  const nu = nuManual ?? nuStar;

  const waterLevel = 1 / nu;
  const xs = A.map((a) => xOf(nu, a));
  const totalWater = xs.reduce((a, b) => a + b, 0);
  const utility = A.reduce(
    (acc, a, i) => acc + Math.log(1 + a * (xs[i] as number)),
    0,
  );

  const W = 600;
  const H = 320;
  const padX = 40;
  const padY = 30;
  const innerW = W - 2 * padX;
  const innerH = H - 2 * padY;
  const nBars = A.length;
  const barGap = 14;
  const barW = (innerW - (nBars - 1) * barGap) / nBars;

  const yMax = Math.max(...A.map((a) => 1 / a)) * 2.2;
  const yToPx = (y: number) =>
    padY + ((yMax - y) / yMax) * innerH;

  return (
    <div className="figure-interactive my-8">
      <div className="border border-ink-100 rounded-md overflow-hidden bg-paper">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height="auto"
          style={{ display: "block" }}
        >
          {/* nivel de agua 1/ν */}
          <line
            x1={padX}
            y1={yToPx(waterLevel)}
            x2={W - padX}
            y2={yToPx(waterLevel)}
            stroke="var(--color-blue, #2563eb)"
            strokeWidth={2}
            strokeDasharray="6 4"
          />
          <text
            x={padX + 6}
            y={yToPx(waterLevel) - 5}
            fontSize={11}
            fontFamily="ui-monospace"
            fill="var(--color-blue, #2563eb)"
          >
            nivel 1/ν = {waterLevel.toFixed(2)}
          </text>

          {/* eje x base */}
          <line
            x1={padX}
            y1={padY + innerH}
            x2={W - padX}
            y2={padY + innerH}
            stroke="currentColor"
            strokeOpacity={0.3}
          />

          {/* barras */}
          {A.map((a, i) => {
            const xPx = padX + i * (barW + barGap);
            const floorH = 1 / a;
            const xi = xs[i] as number;
            const y0 = padY + innerH; // base
            const yFloor = yToPx(floorH);
            const yTop = yToPx(floorH + xi);
            return (
              <g key={`bar-${i}`}>
                {/* "ruido del canal" 1/a_i (gris oscuro) */}
                <rect
                  x={xPx}
                  y={yFloor}
                  width={barW}
                  height={y0 - yFloor}
                  fill="var(--color-ink-500, #6b7280)"
                  fillOpacity={0.5}
                />
                {/* agua x_i (azul) */}
                {xi > 0 ? (
                  <rect
                    x={xPx}
                    y={yTop}
                    width={barW}
                    height={yFloor - yTop}
                    fill="var(--color-blue, #2563eb)"
                    fillOpacity={0.5}
                    stroke="var(--color-blue, #2563eb)"
                    strokeWidth={1}
                  />
                ) : null}
                {/* etiquetas */}
                <text
                  x={xPx + barW / 2}
                  y={y0 + 16}
                  textAnchor="middle"
                  fontSize={11}
                  fontFamily="ui-monospace"
                  fill="currentColor"
                  fillOpacity={0.7}
                >
                  ch {i + 1}
                </text>
                <text
                  x={xPx + barW / 2}
                  y={y0 + 28}
                  textAnchor="middle"
                  fontSize={9}
                  fontFamily="ui-monospace"
                  fill="currentColor"
                  fillOpacity={0.5}
                >
                  a={a}
                </text>
                <text
                  x={xPx + barW / 2}
                  y={yFloor - 4}
                  textAnchor="middle"
                  fontSize={9}
                  fontFamily="ui-monospace"
                  fill="currentColor"
                  fillOpacity={0.6}
                >
                  1/a={floorH.toFixed(2)}
                </text>
                {xi > 0 ? (
                  <text
                    x={xPx + barW / 2}
                    y={yTop + 12}
                    textAnchor="middle"
                    fontSize={10}
                    fontFamily="ui-monospace"
                    fill="var(--color-blue, #2563eb)"
                    fontWeight={600}
                  >
                    x={xi.toFixed(2)}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-4 px-4 py-3 bg-ink-100/40 rounded-md font-sans text-sm space-y-3">
        <div className="text-ink-700 text-xs uppercase tracking-wider">
          Water-filling: x_i = máx(0, 1/ν − 1/a_i), Σ x_i = P
        </div>
        <div className="text-base">
          <Tex
            tex={`\\sum_i x_i = ${totalWater.toFixed(3)},\\quad P = ${P.toFixed(2)},\\quad \\nu = ${nu.toFixed(3)}\\;\\;\\big(\\nu^* = ${nuStar.toFixed(3)}\\big)`}
          />
        </div>
        <label className="block">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-mono">P (potencia total)</span>
            <span className="font-mono text-ink-500">{P.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={6}
            step={0.05}
            value={P}
            onChange={(e) => {
              setP(Number(e.target.value));
              setNuManual(null);
            }}
            className="w-full accent-accent-600"
          />
        </label>
        <label className="block">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-mono">
              ν (manual; sin override = ν*)
            </span>
            <span className="font-mono text-ink-500">{nu.toFixed(3)}</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={3}
            step={0.01}
            value={nu}
            onChange={(e) => setNuManual(Number(e.target.value))}
            className="w-full accent-accent-600"
          />
          <button
            type="button"
            onClick={() => setNuManual(null)}
            className="text-[10px] mt-1 text-accent-600 hover:underline"
          >
            usar ν* (automático)
          </button>
        </label>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="px-2 py-1.5 bg-paper rounded-sm">
            <div className="text-ink-500 uppercase tracking-wider">
              utilidad Σ log(1+aᵢxᵢ)
            </div>
            <div className="font-mono">{utility.toFixed(3)}</div>
          </div>
          <div className="px-2 py-1.5 bg-paper rounded-sm">
            <div className="text-ink-500 uppercase tracking-wider">
              canales activos
            </div>
            <div className="font-mono">
              {xs.filter((x) => x > 1e-6).length}/{nBars}
            </div>
          </div>
          <div className="px-2 py-1.5 bg-paper rounded-sm">
            <div className="text-ink-500 uppercase tracking-wider">
              dV/dP = ν*
            </div>
            <div className="font-mono">{nuStar.toFixed(3)}</div>
          </div>
        </div>
        <div className="text-xs text-ink-500">
          Cada canal tiene "ruido" <code>1/aᵢ</code> (gris): canales con{" "}
          <code>aᵢ</code> grande (poco ruido) son baratos. El nivel de agua{" "}
          <code>1/ν</code> es <strong>común a todos</strong>; cada canal se
          llena con <code>xᵢ = máx(0, 1/ν − 1/aᵢ)</code>. Canales con
          ruido superior al nivel quedan en cero (bajo el nivel del agua).
          Movés <code>P</code>: el nivel se ajusta automáticamente para que
          la suma de potencia asignada sea exactamente <code>P</code>.
        </div>
      </div>
    </div>
  );
}
