"use client";

import { useMemo, useState } from "react";
import { Tex } from "@/components/math/Tex";

const A = [3, 1.5, 0.8, 0.5, 2.5];

function xOf(nu: number, a: number): number {
  return Math.max(0, 1 / nu - 1 / a);
}

function dual(nu: number, P: number): number {
  // g(ν) = Σ_{i: ν < aᵢ} [log(ν/aᵢ) + 1 − ν/aᵢ] − P·ν, en la región ν > 0.
  // Canales activos (ν < aᵢ) aportan log(ν/aᵢ) + 1 − ν/aᵢ (≤ 0); los inactivos
  // (ν ≥ aᵢ) aportan 0.
  let s = 0;
  for (const a of A) {
    if (nu < a) {
      s += Math.log(nu / a) + 1 - nu / a;
    }
  }
  return s - P * nu;
}

function dualDeriv(nu: number, P: number): number {
  return A.reduce((acc, a) => acc + xOf(nu, a), 0) - P;
}

function solveNu(P: number): number {
  let lo = 1e-6;
  let hi = Math.max(...A) * 100;
  for (let i = 0; i < 80; i += 1) {
    const mid = (lo + hi) / 2;
    if (A.reduce((acc, a) => acc + xOf(mid, a), 0) > P) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export function DualFunctionDemo() {
  const [P, setP] = useState(2);

  const nuStar = useMemo(() => solveNu(P), [P]);
  const gStar = useMemo(() => dual(nuStar, P), [nuStar, P]);

  const nuMin = 0.1;
  const nuMax = Math.max(...A) * 1.2;

  const samples = useMemo(() => {
    const arr: { nu: number; g: number; gp: number }[] = [];
    const N = 200;
    for (let i = 0; i <= N; i += 1) {
      const nu = nuMin + (i / N) * (nuMax - nuMin);
      arr.push({ nu, g: dual(nu, P), gp: dualDeriv(nu, P) });
    }
    return arr;
  }, [P, nuMin, nuMax]);

  const W = 600;
  const H = 320;
  const padL = 50;
  const padR = 30;
  const padT = 25;
  const padB = 35;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  // Eje y para g
  const gMin = Math.min(...samples.map((s) => s.g));
  const gMax = Math.max(...samples.map((s) => s.g));
  const gPad = (gMax - gMin) * 0.1 || 1;
  const yToPx = (y: number) =>
    padT + ((gMax + gPad - y) / (gMax - gMin + 2 * gPad)) * innerH;
  const nuToPx = (nu: number) =>
    padL + ((nu - nuMin) / (nuMax - nuMin)) * innerW;

  const linePathG = samples
    .map(
      (s, i) =>
        `${i === 0 ? "M" : "L"} ${nuToPx(s.nu)} ${yToPx(s.g)}`,
    )
    .join(" ");

  // Eje y secundario para g'
  const gpMin = Math.min(...samples.map((s) => s.gp));
  const gpMax = Math.max(...samples.map((s) => s.gp));
  const gpPad = (gpMax - gpMin) * 0.1 || 1;
  const gpToPx = (yp: number) =>
    padT + ((gpMax + gpPad - yp) / (gpMax - gpMin + 2 * gpPad)) * innerH;

  const linePathGp = samples
    .map(
      (s, i) =>
        `${i === 0 ? "M" : "L"} ${nuToPx(s.nu)} ${gpToPx(s.gp)}`,
    )
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
          {/* g'(ν) = 0 línea */}
          <line
            x1={padL}
            y1={gpToPx(0)}
            x2={padL + innerW}
            y2={gpToPx(0)}
            stroke="var(--color-warning, #d97706)"
            strokeOpacity={0.4}
            strokeDasharray="3 3"
          />
          <text
            x={padL + innerW + 4}
            y={gpToPx(0) + 4}
            fontSize={10}
            fontFamily="ui-monospace"
            fill="var(--color-warning, #d97706)"
          >
            g' = 0
          </text>

          {/* eje x */}
          <line
            x1={padL}
            y1={padT + innerH}
            x2={padL + innerW}
            y2={padT + innerH}
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
            x={padL + innerW / 2}
            y={padT + innerH + 28}
            textAnchor="middle"
            fontSize={11}
            fontFamily="ui-monospace"
            fill="currentColor"
            fillOpacity={0.6}
          >
            ν
          </text>

          {/* g(ν) */}
          <path
            d={linePathG}
            stroke="var(--color-accent-600, #6359e9)"
            strokeWidth={2.4}
            fill="none"
          />

          {/* g'(ν) */}
          <path
            d={linePathGp}
            stroke="var(--color-success, #16a34a)"
            strokeWidth={1.8}
            fill="none"
            opacity={0.85}
          />

          {/* marcador ν* */}
          <line
            x1={nuToPx(nuStar)}
            y1={padT}
            x2={nuToPx(nuStar)}
            y2={padT + innerH}
            stroke="var(--color-warning, #d97706)"
            strokeWidth={1.4}
            strokeDasharray="2 3"
            opacity={0.7}
          />
          <circle
            cx={nuToPx(nuStar)}
            cy={yToPx(gStar)}
            r={5}
            fill="var(--color-accent-600, #6359e9)"
            stroke="white"
            strokeWidth={1.5}
          />
          <text
            x={nuToPx(nuStar) + 8}
            y={padT + 14}
            fontSize={11}
            fontFamily="ui-monospace"
            fill="var(--color-warning, #d97706)"
          >
            ν* = {nuStar.toFixed(3)}
          </text>

          {/* leyenda */}
          <text
            x={padL + 4}
            y={padT + 14}
            fontSize={11}
            fontFamily="ui-sans-serif"
            fill="var(--color-accent-600, #6359e9)"
          >
            g(ν) (cóncava)
          </text>
          <text
            x={padL + 4}
            y={padT + 28}
            fontSize={11}
            fontFamily="ui-sans-serif"
            fill="var(--color-success, #16a34a)"
          >
            g'(ν) = Σ xᵢ(ν) − P
          </text>
        </svg>
      </div>

      <div className="mt-4 px-4 py-3 bg-ink-100/40 rounded-md font-sans text-sm space-y-3">
        <div className="text-ink-700 text-xs uppercase tracking-wider">
          Función dual: máx_ν g(ν) ⇒ g'(ν*) = 0 ⇒ Σ xᵢ(ν*) = P
        </div>
        <div className="text-base">
          <Tex
            tex={`g(\\nu) = \\sum_{i:\\,\\nu < a_i} \\!\\Big[\\log\\tfrac{\\nu}{a_i} + 1 - \\tfrac{\\nu}{a_i}\\Big] - P\\,\\nu`}
          />
        </div>
        <label className="block">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-mono">P</span>
            <span className="font-mono text-ink-500">{P.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={6}
            step={0.05}
            value={P}
            onChange={(e) => setP(Number(e.target.value))}
            className="w-full accent-accent-600"
          />
        </label>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="px-2 py-1.5 bg-paper rounded-sm">
            <div className="text-ink-500 uppercase tracking-wider">ν*</div>
            <div className="font-mono">{nuStar.toFixed(4)}</div>
          </div>
          <div className="px-2 py-1.5 bg-paper rounded-sm">
            <div className="text-ink-500 uppercase tracking-wider">g(ν*)</div>
            <div className="font-mono">{gStar.toFixed(3)}</div>
          </div>
          <div className="px-2 py-1.5 bg-paper rounded-sm">
            <div className="text-ink-500 uppercase tracking-wider">g'(ν*)</div>
            <div className="font-mono">{dualDeriv(nuStar, P).toExponential(1)}</div>
          </div>
        </div>
        <div className="text-xs text-ink-500">
          La función dual <span style={{ color: "var(--color-accent-600, #6359e9)" }}>g(ν)</span>{" "}
          es <strong>cóncava</strong> en ν &gt; 0 (suma de funciones cóncavas
          + lineal). Su derivada{" "}
          <span style={{ color: "var(--color-success, #16a34a)" }}>g'(ν) = Σ xᵢ(ν) − P</span>{" "}
          es decreciente y cruza 0 en ν*. La condición KKT
          "viabilidad primal" Σ xᵢ = P es exactamente g'(ν*) = 0.
        </div>
      </div>
    </div>
  );
}
