"use client";

import { useMemo, useState } from "react";
import { Tex } from "@/components/math/Tex";

const N_STEPS = 25;

export function StepSizeRegimesDemo() {
  const [alpha, setAlpha] = useState(1.7);
  const L = 1;
  const x0 = 1;

  const trajectory = useMemo(() => {
    const traj = [x0];
    let x = x0;
    for (let k = 1; k <= N_STEPS; k += 1) {
      x = x - alpha * L * x;
      traj.push(x);
    }
    return traj;
  }, [alpha]);

  const rate = 1 - alpha * L;
  const regime =
    alpha <= 0
      ? "sin paso"
      : alpha < 1 / L
        ? "monótono"
        : alpha === 1 / L
          ? "óptimo (un paso)"
          : alpha < 2 / L
            ? "oscilante decreciente"
            : alpha === 2 / L
              ? "frontera (oscila constante)"
              : "divergente";

  const tex = useMemo(
    () =>
      `x_{k+1} = (1 - \\alpha L)\\,x_k \\;\\Rightarrow\\; x_k = (1 - \\alpha L)^k\\,x_0`,
    [],
  );

  const W = 600;
  const H = 240;
  const padL = 40;
  const padR = 20;
  const padT = 20;
  const padB = 30;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const yAbsMaxRaw = Math.max(2, ...trajectory.map((v) => Math.abs(v)));
  const yAbsMax = Math.min(yAbsMaxRaw, 5);
  const yToPx = (y: number) => {
    const clampedY = Math.max(-yAbsMax, Math.min(yAbsMax, y));
    return padT + innerH / 2 - (clampedY / yAbsMax) * (innerH / 2 - 5);
  };
  const inRange = (y: number) => Math.abs(y) <= yAbsMax;
  const kToPx = (k: number) => padL + (k / N_STEPS) * innerW;

  return (
    <div className="figure-interactive my-8">
      <div className="border border-ink-100 rounded-md overflow-hidden bg-paper">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height="auto"
          style={{ display: "block" }}
        >
          {/* eje horizontal (k) */}
          <line
            x1={padL}
            y1={padT + innerH / 2}
            x2={padL + innerW}
            y2={padT + innerH / 2}
            stroke="currentColor"
            strokeOpacity={0.2}
            strokeWidth={1}
          />
          {/* eje vertical (x) */}
          <line
            x1={padL}
            y1={padT}
            x2={padL}
            y2={padT + innerH}
            stroke="currentColor"
            strokeOpacity={0.2}
            strokeWidth={1}
          />

          {/* labels eje y */}
          <text
            x={padL - 6}
            y={padT + 4}
            textAnchor="end"
            fontSize={11}
            fontFamily="ui-monospace"
            fill="currentColor"
            fillOpacity={0.6}
          >
            {yAbsMax.toFixed(1)}
          </text>
          <text
            x={padL - 6}
            y={padT + innerH / 2 + 4}
            textAnchor="end"
            fontSize={11}
            fontFamily="ui-monospace"
            fill="currentColor"
            fillOpacity={0.6}
          >
            0
          </text>
          <text
            x={padL - 6}
            y={padT + innerH + 4}
            textAnchor="end"
            fontSize={11}
            fontFamily="ui-monospace"
            fill="currentColor"
            fillOpacity={0.6}
          >
            −{yAbsMax.toFixed(1)}
          </text>

          {/* labels eje x */}
          <text
            x={padL + innerW}
            y={padT + innerH / 2 + 18}
            textAnchor="end"
            fontSize={11}
            fontFamily="ui-monospace"
            fill="currentColor"
            fillOpacity={0.6}
          >
            k = {N_STEPS}
          </text>

          {/* puntos y líneas */}
          {trajectory.map((v, k) => {
            if (k === 0) return null;
            const prev = trajectory[k - 1] ?? 0;
            return (
              <line
                key={`l-${k}`}
                x1={kToPx(k - 1)}
                y1={yToPx(prev)}
                x2={kToPx(k)}
                y2={yToPx(v)}
                stroke="var(--color-accent-600, #6359e9)"
                strokeWidth={1.5}
                strokeOpacity={0.6}
              />
            );
          })}
          {trajectory.map((v, k) => (
            <circle
              key={`p-${k}`}
              cx={kToPx(k)}
              cy={yToPx(v)}
              r={3}
              fill="var(--color-accent-600, #6359e9)"
              opacity={inRange(v) ? 1 : 0.3}
            />
          ))}
          {yAbsMaxRaw > yAbsMax ? (
            <text
              x={padL + innerW - 4}
              y={padT + 14}
              textAnchor="end"
              fontSize={11}
              fontFamily="ui-monospace"
              fill="var(--color-warning, #d97706)"
            >
              fuera de rango (diverge)
            </text>
          ) : null}
        </svg>
      </div>

      <div className="mt-4 px-4 py-3 bg-ink-100/40 rounded-md font-sans text-sm space-y-3">
        <div className="text-ink-700 text-xs uppercase tracking-wider">
          GD sobre f(x) = ½·L·x², L = 1, x₀ = 1
        </div>
        <div className="text-base">
          <Tex tex={tex} />
        </div>
        <label className="block">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-mono">α</span>
            <span className="font-mono text-ink-500">
              {alpha.toFixed(3)} &nbsp;|&nbsp; régimen: {regime}
            </span>
          </div>
          <input
            type="range"
            min={0.05}
            max={2.5}
            step={0.01}
            value={alpha}
            onChange={(e) => setAlpha(Number(e.target.value))}
            className="w-full accent-accent-600"
          />
          <div className="flex justify-between text-[10px] text-ink-500 mt-1 font-mono">
            <span>0</span>
            <span>1/L = 1</span>
            <span>2/L = 2</span>
            <span>2.5</span>
          </div>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="px-2 py-1.5 bg-paper rounded-sm">
            <div className="text-ink-500 uppercase tracking-wider">factor</div>
            <div className="font-mono">{rate.toFixed(3)}</div>
          </div>
          <div className="px-2 py-1.5 bg-paper rounded-sm">
            <div className="text-ink-500 uppercase tracking-wider">x₂₅</div>
            <div className="font-mono">
              {(trajectory[N_STEPS] ?? 0).toExponential(2)}
            </div>
          </div>
          <div className="px-2 py-1.5 bg-paper rounded-sm">
            <div className="text-ink-500 uppercase tracking-wider">|1−αL|</div>
            <div className="font-mono">{Math.abs(rate).toFixed(3)}</div>
          </div>
          <div className="px-2 py-1.5 bg-paper rounded-sm">
            <div className="text-ink-500 uppercase tracking-wider">α − Lα²/2</div>
            <div className="font-mono">
              {(alpha - (L / 2) * alpha * alpha).toFixed(3)}
            </div>
          </div>
        </div>
        <div className="text-xs text-ink-500">
          Probá α &lt; 1/L (decrece monótono), α = 1/L (cae a cero en un solo
          paso para esta cuadrática), 1/L &lt; α &lt; 2/L (oscilando pero
          decrece), α = 2/L (oscila con amplitud constante: frontera) y α &gt;
          2/L (diverge). El factor de descenso α − Lα²/2 controla la cota
          general; lo que ves arriba es el caso particular cuadrático, donde
          el factor exacto es (1 − αL)².
        </div>
      </div>
    </div>
  );
}
