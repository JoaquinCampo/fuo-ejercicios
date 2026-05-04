"use client";

import { useMemo, useState } from "react";
import { Tex } from "@/components/math/Tex";

const N_STEPS = 200;

export function LinearRateDemo() {
  const [m, setM] = useState(0.3);
  const [M, setM_] = useState(2);
  const [beta, setBeta] = useState(0.5);
  const [sigma, setSigma] = useState(0.3);

  const r = 1 - (4 * m * beta * sigma * (1 - sigma)) / M;
  const rClamped = Math.max(1e-9, Math.min(0.9999, r));

  // ε_k = r^k (lineal/geométrica)
  // ε_k^{1/k} = 1/k (sub-lineal, comparación P2-Ej2)
  // log10 escala
  const logEpsLinear = useMemo(() => {
    const arr: number[] = [];
    let val = 1;
    for (let k = 0; k <= N_STEPS; k += 1) {
      arr.push(val);
      val *= rClamped;
    }
    return arr;
  }, [rClamped]);

  const logEpsSubLinear = useMemo(() => {
    const arr: number[] = [];
    for (let k = 0; k <= N_STEPS; k += 1) {
      arr.push(k === 0 ? 1 : 1 / k);
    }
    return arr;
  }, []);

  const W = 600;
  const H = 280;
  const padL = 50;
  const padR = 20;
  const padT = 20;
  const padB = 35;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  // log10 axis: y desde 1 (top) hasta 1e-10 (bottom)
  const logMin = -10;
  const logMax = 0;
  const yToPx = (eps: number) => {
    const log = Math.max(logMin, Math.log10(Math.max(eps, 1e-30)));
    return padT + ((logMax - log) / (logMax - logMin)) * innerH;
  };
  const kToPx = (k: number) => padL + (k / N_STEPS) * innerW;

  const linePathLinear = logEpsLinear
    .map((eps, k) => `${k === 0 ? "M" : "L"} ${kToPx(k)} ${yToPx(eps)}`)
    .join(" ");

  const linePathSubLinear = logEpsSubLinear
    .map((eps, k) => `${k === 0 ? "M" : "L"} ${kToPx(k)} ${yToPx(eps)}`)
    .join(" ");

  // Gridlines log-y
  const yTicks = [0, -2, -4, -6, -8, -10];

  // Iteraciones para llegar a ε = 1e-6
  const kForLinear = Math.ceil(Math.log(1e-6) / Math.log(rClamped));
  const kForSubLinear = Math.ceil(1e6);

  const tex = useMemo(
    () =>
      `r = 1 - \\frac{4\\,m\\,\\beta\\,\\sigma(1-\\sigma)}{M} = ${r.toFixed(4)}`,
    [r],
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
          {/* gridlines */}
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
                  10{logEps === 0 ? "⁰" : `⁻${-logEps}`}
                </text>
              </g>
            );
          })}

          {/* eje x */}
          <line
            x1={padL}
            y1={padT + innerH}
            x2={padL + innerW}
            y2={padT + innerH}
            stroke="currentColor"
            strokeOpacity={0.2}
          />
          {[0, 50, 100, 150, 200].map((k) => (
            <g key={`xtick-${k}`}>
              <text
                x={kToPx(k)}
                y={padT + innerH + 16}
                textAnchor="middle"
                fontSize={10}
                fontFamily="ui-monospace"
                fill="currentColor"
                fillOpacity={0.6}
              >
                {k}
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
            k
          </text>

          {/* sub-lineal 1/k */}
          <path
            d={linePathSubLinear}
            stroke="var(--color-ink-500, #6b7280)"
            strokeWidth={1.8}
            fill="none"
            strokeDasharray="4 3"
            opacity={0.7}
          />
          <text
            x={kToPx(80)}
            y={yToPx(1 / 80) - 6}
            fontSize={11}
            fontFamily="ui-sans-serif"
            fill="var(--color-ink-500, #6b7280)"
          >
            1/k (sub-lineal)
          </text>

          {/* lineal r^k */}
          <path
            d={linePathLinear}
            stroke="var(--color-accent-600, #6359e9)"
            strokeWidth={2.2}
            fill="none"
          />
          <text
            x={kToPx(40)}
            y={yToPx(Math.pow(rClamped, 40)) - 6}
            fontSize={11}
            fontFamily="ui-sans-serif"
            fill="var(--color-accent-600, #6359e9)"
          >
            r^k (lineal)
          </text>
        </svg>
      </div>

      <div className="mt-4 px-4 py-3 bg-ink-100/40 rounded-md font-sans text-sm space-y-3">
        <div className="text-ink-700 text-xs uppercase tracking-wider">
          Tasa de convergencia: lineal vs sub-lineal (eje y log)
        </div>
        <div className="text-base">
          <Tex tex={tex} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "m", value: m, set: setM, min: 0.05, max: 1.5, step: 0.05 },
            { label: "M", value: M, set: setM_, min: 0.5, max: 5, step: 0.1 },
            { label: "β", value: beta, set: setBeta, min: 0.1, max: 0.9, step: 0.05 },
            { label: "σ", value: sigma, set: setSigma, min: 0.05, max: 0.95, step: 0.05 },
          ].map(({ label, value, set, min, max, step }) => (
            <label key={label} className="block">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-mono">{label}</span>
                <span className="font-mono text-ink-500">{value.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => set(Number(e.target.value))}
                className="w-full accent-accent-600"
              />
            </label>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <div className="px-2 py-1.5 bg-paper rounded-sm">
            <div className="text-ink-500 uppercase tracking-wider">
              k para gap = 10⁻⁶ (lineal)
            </div>
            <div className="font-mono">
              {Number.isFinite(kForLinear) && kForLinear > 0
                ? kForLinear.toLocaleString()
                : "∞"}
            </div>
          </div>
          <div className="px-2 py-1.5 bg-paper rounded-sm">
            <div className="text-ink-500 uppercase tracking-wider">
              k para gap = 10⁻⁶ (1/k)
            </div>
            <div className="font-mono">{kForSubLinear.toLocaleString()}</div>
          </div>
        </div>
        <div className="text-xs text-ink-500">
          La línea sólida es la cota e_k ≤ r^k de Armijo + fuerte convexidad,
          la línea punteada es la cota O(1/k) del P2-Ej2 (solo convexa). En
          escala log la lineal es <strong>una recta</strong>, la sub-lineal
          es <strong>logarítmica</strong>. Para gap 10⁻⁶: lineal pide ~
          log(1/ε)/log(1/r) iteraciones, sub-lineal pide ~ 1/ε ≈ un millón.
          La diferencia es el motivo por el que pelear por fuerte convexidad
          vale la pena.
        </div>
      </div>
    </div>
  );
}
