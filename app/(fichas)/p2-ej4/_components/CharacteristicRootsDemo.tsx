"use client";

import { useMemo, useState } from "react";
import { Tex } from "@/components/math/Tex";

export function CharacteristicRootsDemo() {
  const [alpha, setAlpha] = useState(0.4);
  const [beta, setBeta] = useState(0.6);
  const lambda = 1;

  const roots = useMemo(() => {
    const a = 1 - alpha * lambda + beta;
    const disc = a * a - 4 * beta;
    if (disc >= 0) {
      const s = Math.sqrt(disc);
      return [
        { re: (a + s) / 2, im: 0 },
        { re: (a - s) / 2, im: 0 },
      ];
    }
    const s = Math.sqrt(-disc);
    return [
      { re: a / 2, im: s / 2 },
      { re: a / 2, im: -s / 2 },
    ];
  }, [alpha, beta]);

  const rho = Math.max(
    Math.sqrt(roots[0]!.re ** 2 + roots[0]!.im ** 2),
    Math.sqrt(roots[1]!.re ** 2 + roots[1]!.im ** 2),
  );

  const W = 360;
  const H = 360;
  const cx = W / 2;
  const cy = H / 2;
  const scale = 130; // 1 unidad = 130 px
  const reToPx = (re: number) => cx + re * scale;
  const imToPx = (im: number) => cy - im * scale;

  const stable = rho < 1;

  return (
    <div className="figure-interactive my-8">
      <div className="border border-ink-100 rounded-md overflow-hidden bg-paper flex justify-center">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          height={H}
          style={{ display: "block", maxWidth: "100%", height: "auto" }}
        >
          {/* círculo unidad */}
          <circle
            cx={cx}
            cy={cy}
            r={scale}
            stroke="currentColor"
            strokeOpacity={0.3}
            fill="none"
            strokeWidth={1.5}
          />
          {/* círculo de β (radio sqrt(β), porque |r1·r2| = β) */}
          <circle
            cx={cx}
            cy={cy}
            r={scale * Math.sqrt(Math.max(0, beta))}
            stroke="var(--color-warning, #d97706)"
            strokeOpacity={0.4}
            fill="none"
            strokeWidth={1}
            strokeDasharray="3 3"
          />

          {/* ejes */}
          <line
            x1={padR(0, scale, cx)}
            y1={padR(-1.5, scale, cy, true)}
            x2={padR(0, scale, cx)}
            y2={padR(1.5, scale, cy, true)}
            stroke="currentColor"
            strokeOpacity={0.15}
          />
          <line
            x1={padR(-1.5, scale, cx)}
            y1={padR(0, scale, cy, true)}
            x2={padR(1.5, scale, cx)}
            y2={padR(0, scale, cy, true)}
            stroke="currentColor"
            strokeOpacity={0.15}
          />

          {/* raíces */}
          {roots.map((r, i) => (
            <g key={`r-${i}`}>
              <circle
                cx={reToPx(r.re)}
                cy={imToPx(r.im)}
                r={6}
                fill="var(--color-accent-600, #6359e9)"
                stroke="white"
                strokeWidth={1.5}
              />
              <text
                x={reToPx(r.re) + 10}
                y={imToPx(r.im) - 8}
                fontSize={11}
                fontFamily="ui-monospace"
                fill="var(--color-accent-600, #6359e9)"
              >
                r{i + 1}
              </text>
            </g>
          ))}

          {/* etiquetas axes */}
          <text
            x={cx + scale + 8}
            y={cy + 4}
            fontSize={10}
            fontFamily="ui-monospace"
            fill="currentColor"
            fillOpacity={0.6}
          >
            Re = 1
          </text>
          <text
            x={cx + 6}
            y={cy - scale - 4}
            fontSize={10}
            fontFamily="ui-monospace"
            fill="currentColor"
            fillOpacity={0.6}
          >
            Im = 1
          </text>
          <text
            x={cx + 4}
            y={cy + scale + 16}
            fontSize={10}
            fontFamily="ui-monospace"
            fill="var(--color-warning, #d97706)"
            fillOpacity={0.7}
          >
            |r| = √β
          </text>
        </svg>
      </div>

      <div className="mt-4 px-4 py-3 bg-ink-100/40 rounded-md font-sans text-sm space-y-3">
        <div className="text-ink-700 text-xs uppercase tracking-wider">
          Raíces del polinomio característico (λ = 1)
        </div>
        <div className="text-base">
          <Tex
            tex={`r_{1,2} = \\tfrac{(1 - \\alpha\\lambda + \\beta) \\pm \\sqrt{(1 - \\alpha\\lambda + \\beta)^2 - 4\\beta}}{2}, \\quad |r_1 \\cdot r_2| = \\beta`}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-mono">α</span>
              <span className="font-mono text-ink-500">{alpha.toFixed(3)}</span>
            </div>
            <input
              type="range"
              min={0.05}
              max={2}
              step={0.01}
              value={alpha}
              onChange={(e) => setAlpha(Number(e.target.value))}
              className="w-full accent-accent-600"
            />
          </label>
          <label className="block">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-mono">β</span>
              <span className="font-mono text-ink-500">{beta.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={0.99}
              step={0.01}
              value={beta}
              onChange={(e) => setBeta(Number(e.target.value))}
              className="w-full accent-accent-600"
            />
          </label>
        </div>
        <div
          className="px-3 py-2 bg-paper rounded-sm text-center text-xs"
          style={{
            borderLeft: stable
              ? "3px solid var(--color-success, #16a34a)"
              : "3px solid var(--color-warning, #d97706)",
          }}
        >
          <span className="font-mono">
            radio espectral ρ = max|rᵢ| = {rho.toFixed(3)} →{" "}
            {stable ? "estable (raíces dentro del círculo unidad)" : "inestable"}
          </span>
        </div>
        <div className="text-xs text-ink-500">
          El producto de raíces es siempre β, así que ambas viven en el círculo
          de radio √β (línea punteada). Si el discriminante es negativo, las
          raíces son <strong>complejas conjugadas</strong> sobre ese círculo
          (oscilación amortiguada con tasa √β). Si es positivo, son reales y
          separadas. Estabilidad pide ρ &lt; 1: en el caso complejo eso es
          exactamente β &lt; 1; en el caso real, hay que cuidar también α.
        </div>
      </div>
    </div>
  );
}

function padR(value: number, scale: number, c: number, isY = false): number {
  return c + value * scale * (isY ? -1 : 1);
}
