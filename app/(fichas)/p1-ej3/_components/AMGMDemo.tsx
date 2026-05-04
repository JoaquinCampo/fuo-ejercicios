"use client";

import { useMemo, useState } from "react";
import { Tex } from "@/components/math/Tex";

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

export function AMGMDemo() {
  const [n, setN] = useState(4);
  const [values, setValues] = useState<number[]>([1, 2, 4, 8, 1, 1, 1, 1]);

  const xs = values.slice(0, n);
  const am = xs.reduce((s, x) => s + x, 0) / n;
  const gm = Math.exp(xs.reduce((s, x) => s + Math.log(x), 0) / n);
  const gap = am - gm;

  const setN_ = (newN: number) => {
    const clamped = clamp(Math.round(newN), 2, 8);
    setN(clamped);
  };
  const setVal = (i: number, v: number) => {
    const next = [...values];
    next[i] = clamp(v, 0.1, 10);
    setValues(next);
  };

  const tex = useMemo(() => {
    const xsList = xs.map((x) => x.toFixed(2)).join(" + ");
    return `\\underbrace{\\tfrac{${xsList}}{${n}}}_{\\text{AM} = ${am.toFixed(3)}} \\;\\geq\\; \\underbrace{\\sqrt[${n}]{${xs.map((x) => x.toFixed(2)).join(" \\cdot ")}}}_{\\text{GM} = ${gm.toFixed(3)}}`;
  }, [xs, n, am, gm]);

  return (
    <div className="figure-interactive my-8 px-3 py-4 sm:px-4 bg-ink-100/40 rounded-md font-sans text-sm space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="text-ink-700 text-xs uppercase tracking-wider mb-1">
            Cantidad de términos
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={2}
              max={8}
              step={1}
              value={n}
              onChange={(e) => setN_(Number(e.target.value))}
              className="w-32 sm:w-40 accent-accent-600"
            />
            <span className="font-mono text-base">n = {n}</span>
          </div>
        </div>
        <button
          type="button"
          className="no-print shrink-0 text-xs font-sans px-3 py-1.5 rounded-sm border border-ink-100 hover:border-accent-600 hover:text-accent-700 transition-colors"
          onClick={() => setValues(xs.map(() => 1))}
        >
          igualar todos a 1
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {xs.map((x, i) => (
          <label key={i} className="block">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-mono">x{i + 1}</span>
              <span className="font-mono text-ink-500">{x.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={10}
              step={0.05}
              value={x}
              onChange={(e) => setVal(i, Number(e.target.value))}
              className="w-full accent-accent-600"
            />
          </label>
        ))}
      </div>

      <div className="text-base">
        <Tex tex={tex} block />
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
        <div className="px-3 py-2 bg-paper rounded-sm">
          <div className="text-xs text-ink-500 uppercase tracking-wider">AM</div>
          <div className="font-mono text-lg">{am.toFixed(3)}</div>
        </div>
        <div className="px-3 py-2 bg-paper rounded-sm">
          <div className="text-xs text-ink-500 uppercase tracking-wider">GM</div>
          <div className="font-mono text-lg">{gm.toFixed(3)}</div>
        </div>
        <div
          className="px-3 py-2 bg-paper rounded-sm"
          style={{ borderLeft: "3px solid var(--color-warning)" }}
        >
          <div className="text-xs text-ink-500 uppercase tracking-wider">
            Gap
          </div>
          <div className="font-mono text-lg">{gap.toFixed(3)}</div>
        </div>
      </div>

      <div className="text-xs text-ink-500">
        El gap se anula cuando todos los xᵢ son iguales. Probá con un xⱼ muy
        chico: la GM colapsa hacia 0 mientras la AM apenas baja, y el gap
        explota.
      </div>
    </div>
  );
}
