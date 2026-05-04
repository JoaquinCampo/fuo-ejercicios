"use client";

import { useMemo, useState } from "react";
import { Tex } from "@/components/math/Tex";

const A = [3, 1.5, 0.8, 0.5, 2.5];

function xOf(nu: number, a: number): number {
  return Math.max(0, 1 / nu - 1 / a);
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

function valueOf(P: number): number {
  const nu = solveNu(P);
  let s = 0;
  for (const a of A) {
    const xi = xOf(nu, a);
    if (xi > 0) s += Math.log(1 + a * xi);
  }
  return s;
}

export function SensitivityDemo() {
  const [P, setP] = useState(2);

  const Pmin = 0.05;
  const Pmax = 8;

  const samples = useMemo(() => {
    const arr: { P: number; V: number; nuStar: number }[] = [];
    const N = 120;
    for (let i = 0; i <= N; i += 1) {
      const Pp = Pmin + (i / N) * (Pmax - Pmin);
      arr.push({ P: Pp, V: valueOf(Pp), nuStar: solveNu(Pp) });
    }
    return arr;
  }, []);

  const W = 600;
  const H = 320;
  const padL = 50;
  const padR = 30;
  const padT = 25;
  const padB = 35;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const Vmin = Math.min(...samples.map((s) => s.V));
  const Vmax = Math.max(...samples.map((s) => s.V));
  const Vpad = (Vmax - Vmin) * 0.1 || 0.5;

  const Pscale = (Pp: number) =>
    padL + ((Pp - Pmin) / (Pmax - Pmin)) * innerW;
  const Vscale = (v: number) =>
    padT + ((Vmax + Vpad - v) / (Vmax - Vmin + 2 * Vpad)) * innerH;

  const linePathV = samples
    .map((s, i) => `${i === 0 ? "M" : "L"} ${Pscale(s.P)} ${Vscale(s.V)}`)
    .join(" ");

  // tangente en P actual
  const nuStarAtP = solveNu(P);
  const Vp = valueOf(P);
  // tangente: y = V(P) + ν*·(p − P)
  const tan = (p: number) => Vp + nuStarAtP * (p - P);
  const tanLineX1 = Math.max(Pmin, P - 1.5);
  const tanLineX2 = Math.min(Pmax, P + 1.5);

  // verificación numérica: dV/dP por diferencias finitas
  const dP = 0.001;
  const numericalDeriv = (valueOf(P + dP) - valueOf(P - dP)) / (2 * dP);

  return (
    <div className="figure-interactive my-8">
      <div className="border border-ink-100 rounded-md overflow-hidden bg-paper">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height="auto"
          style={{ display: "block" }}
        >
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
            P
          </text>

          {/* V(P) */}
          <path
            d={linePathV}
            stroke="var(--color-accent-600, #6359e9)"
            strokeWidth={2.4}
            fill="none"
          />

          {/* tangente */}
          <line
            x1={Pscale(tanLineX1)}
            y1={Vscale(tan(tanLineX1))}
            x2={Pscale(tanLineX2)}
            y2={Vscale(tan(tanLineX2))}
            stroke="var(--color-warning, #d97706)"
            strokeWidth={2}
          />

          {/* punto P actual */}
          <circle
            cx={Pscale(P)}
            cy={Vscale(Vp)}
            r={5}
            fill="var(--color-warning, #d97706)"
            stroke="white"
            strokeWidth={1.5}
          />
          <text
            x={Pscale(P) + 8}
            y={Vscale(Vp) - 8}
            fontSize={11}
            fontFamily="ui-monospace"
            fill="var(--color-warning, #d97706)"
          >
            (P, V(P))
          </text>

          {/* leyenda */}
          <text
            x={padL + 4}
            y={padT + 14}
            fontSize={11}
            fontFamily="ui-sans-serif"
            fill="var(--color-accent-600, #6359e9)"
          >
            V(P) = óptimo primal
          </text>
          <text
            x={padL + 4}
            y={padT + 28}
            fontSize={11}
            fontFamily="ui-sans-serif"
            fill="var(--color-warning, #d97706)"
          >
            tangente con pendiente ν*
          </text>
        </svg>
      </div>

      <div className="mt-4 px-4 py-3 bg-ink-100/40 rounded-md font-sans text-sm space-y-3">
        <div className="text-ink-700 text-xs uppercase tracking-wider">
          Sensibilidad: dV/dP = ν* (precio sombra de la restricción de potencia)
        </div>
        <div className="text-base">
          <Tex tex={`\\frac{dV}{dP} = \\nu^*`} />
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
            <div className="font-mono">{nuStarAtP.toFixed(4)}</div>
          </div>
          <div className="px-2 py-1.5 bg-paper rounded-sm">
            <div className="text-ink-500 uppercase tracking-wider">
              dV/dP (numérico)
            </div>
            <div className="font-mono">{numericalDeriv.toFixed(4)}</div>
          </div>
          <div className="px-2 py-1.5 bg-paper rounded-sm">
            <div className="text-ink-500 uppercase tracking-wider">V(P)</div>
            <div className="font-mono">{Vp.toFixed(3)}</div>
          </div>
        </div>
        <div className="text-xs text-ink-500">
          La función valor <code>V(P)</code> es{" "}
          <strong>cóncava y creciente</strong>: agregar más potencia siempre
          ayuda, pero con rendimientos decrecientes (los primeros canales
          activos son los mejores). La pendiente de la tangente naranja es
          exactamente <code>ν*</code> (multiplicador óptimo). El "ν* numérico"
          coincide con el dV/dP por diferencias finitas: confirma la
          interpretación económica del multiplicador como{" "}
          <em>precio sombra</em>.
        </div>
      </div>
    </div>
  );
}
