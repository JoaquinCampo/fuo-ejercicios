"use client";

import { useMemo, useState } from "react";
import { Tex } from "@/components/math/Tex";

export function ContractionFactorDemo() {
  const [m, setM] = useState(1);
  const [M, setM_] = useState(5);
  const [s, setS] = useState(0.3);

  const sStarOpt = 2 / (m + M);
  const sUpperBound = 2 / M;
  const rhoOpt = (M - m) / (M + m);
  const rhoCurrent = Math.max(Math.abs(1 - s * m), Math.abs(1 - s * M));
  const stable = rhoCurrent < 1;

  const W = 600;
  const H = 280;
  const padL = 50;
  const padR = 30;
  const padT = 20;
  const padB = 35;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const sMaxAxis = Math.max(2 / m + 0.2, 1.5);
  const yMaxAxis = Math.max(1.4, m * sMaxAxis - 1, M * sMaxAxis - 1);

  const sToPx = (sv: number) => padL + (sv / sMaxAxis) * innerW;
  const yToPx = (yv: number) =>
    padT + ((yMaxAxis - yv) / (yMaxAxis + 0.2)) * innerH;

  const samples = useMemo(() => {
    const arr: number[] = [];
    const N = 200;
    for (let i = 0; i <= N; i += 1) arr.push((i / N) * sMaxAxis);
    return arr;
  }, [sMaxAxis]);

  const linePathFor = (fn: (sv: number) => number) =>
    samples
      .map((sv, i) => `${i === 0 ? "M" : "L"} ${sToPx(sv)} ${yToPx(fn(sv))}`)
      .join(" ");

  const pathSm = linePathFor((sv) => Math.abs(1 - sv * m));
  const pathSM = linePathFor((sv) => Math.abs(1 - sv * M));
  const pathRho = linePathFor((sv) =>
    Math.max(Math.abs(1 - sv * m), Math.abs(1 - sv * M)),
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
          {/* y=1 línea (umbral de estabilidad) */}
          <line
            x1={padL}
            y1={yToPx(1)}
            x2={padL + innerW}
            y2={yToPx(1)}
            stroke="var(--color-warning, #d97706)"
            strokeOpacity={0.4}
            strokeDasharray="4 4"
          />
          <text
            x={padL + 6}
            y={yToPx(1) - 4}
            fontSize={10}
            fontFamily="ui-monospace"
            fill="var(--color-warning, #d97706)"
          >
            ρ = 1
          </text>

          {/* área de estabilidad: 0 < s < 2/M */}
          <rect
            x={sToPx(0)}
            y={padT}
            width={sToPx(sUpperBound) - sToPx(0)}
            height={innerH}
            fill="var(--color-success, #16a34a)"
            opacity={0.08}
          />

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

          {/* ticks x */}
          {[0, sStarOpt, sUpperBound, sMaxAxis].map((sv, idx) => (
            <g key={`xtick-${idx}`}>
              <line
                x1={sToPx(sv)}
                y1={padT + innerH}
                x2={sToPx(sv)}
                y2={padT + innerH + 4}
                stroke="currentColor"
                strokeOpacity={0.4}
              />
              <text
                x={sToPx(sv)}
                y={padT + innerH + 16}
                textAnchor="middle"
                fontSize={10}
                fontFamily="ui-monospace"
                fill="currentColor"
                fillOpacity={0.6}
              >
                {idx === 0 ? "0" : idx === 1 ? "s*" : idx === 2 ? "2/M" : sv.toFixed(2)}
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
            s
          </text>

          {/* curvas |1 − sm| y |1 − sM| en gris finas */}
          <path
            d={pathSm}
            stroke="var(--color-ink-500, #6b7280)"
            strokeWidth={1.2}
            fill="none"
            strokeDasharray="3 3"
            opacity={0.6}
          />
          <path
            d={pathSM}
            stroke="var(--color-ink-500, #6b7280)"
            strokeWidth={1.2}
            fill="none"
            strokeDasharray="3 3"
            opacity={0.6}
          />

          {/* envolvente máxima */}
          <path
            d={pathRho}
            stroke="var(--color-accent-600, #6359e9)"
            strokeWidth={2.5}
            fill="none"
          />

          {/* marcador de s actual */}
          <line
            x1={sToPx(s)}
            y1={padT}
            x2={sToPx(s)}
            y2={padT + innerH}
            stroke="var(--color-warning, #d97706)"
            strokeWidth={1.5}
            strokeDasharray="2 3"
          />
          <circle
            cx={sToPx(s)}
            cy={yToPx(rhoCurrent)}
            r={5}
            fill="var(--color-warning, #d97706)"
            stroke="white"
            strokeWidth={1.5}
          />

          {/* marcador de s* óptimo */}
          <circle
            cx={sToPx(sStarOpt)}
            cy={yToPx(rhoOpt)}
            r={4}
            fill="var(--color-success, #16a34a)"
            stroke="white"
            strokeWidth={1.5}
          />
          <text
            x={sToPx(sStarOpt) + 8}
            y={yToPx(rhoOpt) - 6}
            fontSize={10}
            fontFamily="ui-monospace"
            fill="var(--color-success, #16a34a)"
          >
            ρ* = {rhoOpt.toFixed(3)}
          </text>

          <text
            x={padL + 6}
            y={padT + 14}
            fontSize={11}
            fontFamily="ui-sans-serif"
            fill="var(--color-accent-600, #6359e9)"
          >
            ρ(s) = max(|1 − sm|, |1 − sM|)
          </text>
        </svg>
      </div>

      <div className="mt-4 px-4 py-3 bg-ink-100/40 rounded-md font-sans text-sm space-y-3">
        <div className="text-ink-700 text-xs uppercase tracking-wider">
          Factor de contracción óptimo: s* = 2/(m+M), ρ* = (M−m)/(M+m)
        </div>
        <div className="text-base">
          <Tex
            tex={`\\rho(s) = \\max(|1 - sm|, |1 - sM|),\\quad s^* = \\frac{2}{m+M},\\quad \\rho^* = \\frac{M-m}{M+m} = \\frac{\\kappa-1}{\\kappa+1}`}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <label className="block">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-mono">m</span>
              <span className="font-mono text-ink-500">{m.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={3}
              step={0.05}
              value={m}
              onChange={(e) => setM(Number(e.target.value))}
              className="w-full accent-accent-600"
            />
          </label>
          <label className="block">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-mono">M</span>
              <span className="font-mono text-ink-500">{M.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={Math.max(m + 0.1, 0.5)}
              max={20}
              step={0.1}
              value={M}
              onChange={(e) => setM_(Number(e.target.value))}
              className="w-full accent-accent-600"
            />
          </label>
          <label className="block">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-mono">s</span>
              <span className="font-mono text-ink-500">{s.toFixed(3)}</span>
            </div>
            <input
              type="range"
              min={0.001}
              max={Math.max(0.001, sMaxAxis)}
              step={0.005}
              value={s}
              onChange={(e) => setS(Number(e.target.value))}
              className="w-full accent-accent-600"
            />
          </label>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="px-2 py-1.5 bg-paper rounded-sm">
            <div className="text-ink-500 uppercase tracking-wider">κ = M/m</div>
            <div className="font-mono">{(M / m).toFixed(2)}</div>
          </div>
          <div
            className="px-2 py-1.5 bg-paper rounded-sm border-l-2"
            style={{
              borderColor: stable
                ? "var(--color-success, #16a34a)"
                : "var(--color-warning, #d97706)",
            }}
          >
            <div className="text-ink-500 uppercase tracking-wider">ρ(s) actual</div>
            <div className="font-mono">{rhoCurrent.toFixed(3)}</div>
          </div>
          <div className="px-2 py-1.5 bg-paper rounded-sm border-l-2 border-success">
            <div className="text-ink-500 uppercase tracking-wider">ρ* óptimo</div>
            <div className="font-mono">{rhoOpt.toFixed(3)}</div>
          </div>
        </div>
        <div className="text-xs text-ink-500">
          La banda verde clara es el intervalo de estabilidad{" "}
          <code>0 &lt; s &lt; 2/M</code>: ahí <code>ρ(s) &lt; 1</code> y el método
          contrae. La envolvente azul es el peor de los dos modos extremos
          (<code>m</code> y <code>M</code>); las dos rectas grises punteadas
          son <code>|1 − sm|</code> y <code>|1 − sM|</code> por separado. El
          mínimo de la envolvente está donde se cruzan: <code>1 − sm = sM − 1</code>,
          es decir <code>s* = 2/(m+M)</code>.
        </div>
      </div>
    </div>
  );
}
