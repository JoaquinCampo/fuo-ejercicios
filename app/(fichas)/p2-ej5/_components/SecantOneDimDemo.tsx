"use client";

import {
  Mafs,
  Coordinates,
  Plot,
  Line,
  Point,
  Text,
  useMovablePoint,
  Theme,
} from "mafs";
import { useMemo } from "react";
import { Tex } from "@/components/math/Tex";

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

// f(x) = 0.5 x^2 + 0.3 sin(x)
// f'(x) = x + 0.3 cos(x)
// f''(x) = 1 - 0.3 sin(x)  (positivo, en [0.7, 1.3])
const fPrime = (x: number) => x + 0.3 * Math.cos(x);
const fDouble = (x: number) => 1 - 0.3 * Math.sin(x);

export function SecantOneDimDemo() {
  const xk = useMovablePoint([-1.4, fPrime(-1.4)], {
    constrain: ([x]) => {
      const c = clamp(x ?? -1.4, -3, 3);
      return [c, fPrime(c)];
    },
    color: Theme.indigo,
  });
  const xk1 = useMovablePoint([1.6, fPrime(1.6)], {
    constrain: ([x]) => {
      const c = clamp(x ?? 1.6, -3, 3);
      return [c, fPrime(c)];
    },
    color: Theme.green,
  });

  const a = xk.point[0];
  const b = xk1.point[0];
  const s = b - a;
  const y = fPrime(b) - fPrime(a);
  const Dk1 = Math.abs(y) > 1e-9 ? s / y : Number.POSITIVE_INFINITY;
  const mid = (a + b) / 2;
  const exactInv = 1 / fDouble(mid);

  const valuesTex = useMemo(
    () =>
      `s_k = ${s.toFixed(3)},\\quad y_k = ${y.toFixed(3)},\\quad D_{k+1} = \\tfrac{s_k}{y_k} = ${Number.isFinite(Dk1) ? Dk1.toFixed(3) : "\\infty"},\\quad 1/f''(\\text{medio}) = ${exactInv.toFixed(3)}`,
    [s, y, Dk1, exactInv],
  );

  return (
    <div className="figure-interactive my-8">
      <div className="border border-ink-100 rounded-md overflow-hidden bg-paper">
        <Mafs viewBox={{ x: [-3.4, 3.4], y: [-3.5, 3.5] }} height={360}>
          <Coordinates.Cartesian xAxis={{ lines: 1 }} yAxis={{ lines: 1 }} />

          {/* f'(x) */}
          <Plot.OfX y={fPrime} color={Theme.indigo} weight={2.5} />

          {/* secante */}
          <Line.Segment
            point1={[a, fPrime(a)]}
            point2={[b, fPrime(b)]}
            color={Theme.orange}
            weight={2.5}
          />

          {/* extender la secante para que sea visible */}
          <Line.Segment
            point1={[a - 0.6 * (b - a), fPrime(a) - 0.6 * y]}
            point2={[b + 0.6 * (b - a), fPrime(b) + 0.6 * y]}
            color={Theme.orange}
            weight={1.2}
            opacity={0.4}
          />

          {/* segmentos s y y */}
          <Line.Segment
            point1={[a, fPrime(a)]}
            point2={[b, fPrime(a)]}
            color={Theme.blue}
            weight={2}
          />
          <Line.Segment
            point1={[b, fPrime(a)]}
            point2={[b, fPrime(b)]}
            color={Theme.green}
            weight={2}
          />

          <Text
            x={(a + b) / 2}
            y={fPrime(a) - 0.25}
            attach="s"
            size={13}
            color={Theme.blue}
          >
            {`s_k`}
          </Text>
          <Text
            x={b + 0.18}
            y={(fPrime(a) + fPrime(b)) / 2}
            attach="e"
            size={13}
            color={Theme.green}
          >
            {`y_k`}
          </Text>

          <Point x={a} y={fPrime(a)} color={Theme.indigo} />
          <Point x={b} y={fPrime(b)} color={Theme.green} />

          <Text x={-3.1} y={3.1} attach="ne" size={12} color={Theme.indigo}>
            {`f'(x)`}
          </Text>

          {xk.element}
          {xk1.element}
        </Mafs>
      </div>

      <div className="mt-4 px-4 py-3 bg-ink-100/40 rounded-md font-sans text-sm space-y-3">
        <div className="text-ink-700 text-xs uppercase tracking-wider">
          Caso 1D: la condición secante es exactamente el método de la secante
        </div>
        <div className="text-base">
          <Tex
            tex={`D_{k+1}\\,y_k = s_k \\;\\Longleftrightarrow\\; D_{k+1} = \\frac{s_k}{y_k} = \\frac{x_{k+1} - x_k}{f'(x_{k+1}) - f'(x_k)} \\;\\approx\\; \\frac{1}{f''(\\xi)}`}
          />
        </div>
        <div className="text-base">
          <Tex tex={valuesTex} />
        </div>
        <div className="text-xs text-ink-500">
          La línea naranja es la <strong>secante</strong> al gráfico de{" "}
          <em>f'</em> entre <span style={{ color: "var(--mafs-color-indigo, #5e63d4)" }}>x_k</span>{" "}
          y <span style={{ color: "var(--mafs-color-green, #16a34a)" }}>x_{"{k+1}"}</span>.
          Su pendiente es <code>y_k / s_k</code>. La condición secante pide que{" "}
          <code>D_{"{k+1}"}</code> mande <em>y</em> a <em>s</em>: en 1D eso es
          <strong> exactamente la recíproca de la pendiente de la secante</strong>,
          que por TVM es <code>1/f''(ξ)</code> para algún ξ entre los dos puntos.
          BFGS es la generalización n-dimensional de esa idea.
        </div>
      </div>
    </div>
  );
}
