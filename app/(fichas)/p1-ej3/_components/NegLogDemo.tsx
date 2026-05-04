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

const g = (x: number) => -Math.log(x);
const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

export function NegLogDemo() {
  const a = useMovablePoint([0.5, g(0.5)], {
    constrain: ([x]) => {
      const c = clamp(x ?? 0.5, 0.15, 4.5);
      return [c, g(c)];
    },
    color: Theme.blue,
  });
  const b = useMovablePoint([3.5, g(3.5)], {
    constrain: ([x]) => {
      const c = clamp(x ?? 3.5, 0.15, 4.5);
      return [c, g(c)];
    },
    color: Theme.blue,
  });

  const ax = a.point[0];
  const bx = b.point[0];
  const [lo, hi] = ax <= bx ? [ax, bx] : [bx, ax];
  const ga = g(lo);
  const gb = g(hi);
  const xMid = (lo + hi) / 2;
  const gMid = g(xMid);
  const chordMid = (ga + gb) / 2;

  const tex = useMemo(
    () =>
      `g\\!\\left(\\tfrac{a+b}{2}\\right) = ${gMid.toFixed(2)} \\;\\leq\\; ${chordMid.toFixed(2)} = \\tfrac{g(a)+g(b)}{2}`,
    [gMid, chordMid],
  );

  return (
    <div className="figure-interactive my-8">
      <div className="border border-ink-100 rounded-md overflow-hidden bg-paper">
        <Mafs viewBox={{ x: [-0.3, 5], y: [-2, 3] }} height={360}>
          <Coordinates.Cartesian xAxis={{ lines: 1 }} yAxis={{ lines: 1 }} />

          <Plot.OfX y={g} color={Theme.indigo} weight={2.5} domain={[0.05, 5]} />

          <Line.Segment
            point1={[lo, ga]}
            point2={[hi, gb]}
            color={Theme.red}
            weight={2.5}
          />

          <Line.Segment
            point1={[xMid, gMid]}
            point2={[xMid, chordMid]}
            color={Theme.orange}
            weight={5}
          />

          <Point x={xMid} y={gMid} color={Theme.indigo} />
          <Point
            x={xMid}
            y={chordMid}
            color={Theme.orange}
            svgCircleProps={{ fill: "white", strokeWidth: 2 }}
          />

          <Text x={lo} y={ga + 0.25} attach="n" size={13}>
            {`a`}
          </Text>
          <Text x={hi} y={gb + 0.25} attach="n" size={13}>
            {`b`}
          </Text>

          {a.element}
          {b.element}
        </Mafs>
      </div>

      <div className="mt-4 px-4 py-3 bg-ink-100/40 rounded-md font-sans text-sm space-y-2">
        <div className="text-ink-700 text-xs uppercase tracking-wider">
          Cuerda en el punto medio (caso n = 2)
        </div>
        <div className="text-base">
          <Tex tex={tex} />
        </div>
        <div className="text-xs text-ink-500">
          La curva $g(x) = -\ln x$ se "abre hacia arriba" en todo $\mathbb{R}_{>0}$
          porque $g''(x) = 1/x^2 &gt; 0$. Visualmente: la cuerda nunca cae por
          debajo del gráfico.
        </div>
      </div>
    </div>
  );
}
