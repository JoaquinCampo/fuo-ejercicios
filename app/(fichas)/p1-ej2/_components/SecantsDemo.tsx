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

const f = (x: number) => 0.5 * x * x;

export function SecantsDemo() {
  const a = useMovablePoint([-2, f(-2)], {
    constrain: ([x]) => [Math.max(-3, Math.min(3.5, x ?? -2)), f(x ?? -2)],
    color: Theme.blue,
  });
  const b = useMovablePoint([3, f(3)], {
    constrain: ([x]) => [Math.max(-3, Math.min(3.5, x ?? 3)), f(x ?? 3)],
    color: Theme.blue,
  });

  const [ax, bx] = useMemo(() => {
    const aX = a.point[0];
    const bX = b.point[0];
    return aX <= bX ? [aX, bX] : [bX, aX];
  }, [a.point, b.point]);

  const xMid = useMovablePoint([(ax + bx) / 2, 0], {
    constrain: ([x]) => {
      const lo = ax + 0.05;
      const hi = bx - 0.05;
      const clamped = Math.max(lo, Math.min(hi, x ?? lo));
      return [clamped, f(clamped)];
    },
    color: Theme.orange,
  });

  const xv = xMid.point[0];
  const fa = f(ax);
  const fb = f(bx);
  const fx = f(xv);

  const slopeAX = (fx - fa) / (xv - ax);
  const slopeAB = (fb - fa) / (bx - ax);
  const slopeXB = (fb - fx) / (bx - xv);

  const tex = useMemo(
    () =>
      `\\underbrace{\\frac{f(x)-f(a)}{x-a}}_{${slopeAX.toFixed(2)}} \\;\\leq\\; \\underbrace{\\frac{f(b)-f(a)}{b-a}}_{${slopeAB.toFixed(2)}} \\;\\leq\\; \\underbrace{\\frac{f(b)-f(x)}{b-x}}_{${slopeXB.toFixed(2)}}`,
    [slopeAX, slopeAB, slopeXB],
  );

  return (
    <div className="figure-interactive my-8">
      <div className="border border-ink-100 rounded-md overflow-hidden bg-paper">
        <Mafs viewBox={{ x: [-3.2, 3.7], y: [-1.5, 6] }} height={420}>
          <Coordinates.Cartesian xAxis={{ lines: 1 }} yAxis={{ lines: 1 }} />
          <Plot.OfX y={f} color={Theme.indigo} weight={2.5} />

          {/* secante a→x */}
          <Line.Segment
            point1={[ax, fa]}
            point2={[xv, fx]}
            color={Theme.green}
            weight={2}
          />
          {/* cuerda a→b */}
          <Line.Segment
            point1={[ax, fa]}
            point2={[bx, fb]}
            color={Theme.red}
            weight={2}
          />
          {/* secante x→b */}
          <Line.Segment
            point1={[xv, fx]}
            point2={[bx, fb]}
            color={Theme.violet}
            weight={2}
          />

          <Point x={xv} y={fx} color={Theme.indigo} />

          <Text x={ax} y={-0.5} attach="s" size={13}>
            {`a = ${ax.toFixed(2)}`}
          </Text>
          <Text x={bx} y={-0.5} attach="s" size={13}>
            {`b = ${bx.toFixed(2)}`}
          </Text>
          <Text x={xv} y={-1.0} attach="s" size={13} color="var(--color-warning)">
            {`x`}
          </Text>

          {a.element}
          {b.element}
          {xMid.element}
        </Mafs>
      </div>

      <div className="mt-4 px-4 py-3 bg-ink-100/40 rounded-md font-sans text-sm">
        <div className="text-ink-700 text-xs uppercase tracking-wider mb-2">
          Pendientes de las tres secantes
        </div>
        <div className="text-base">
          <Tex tex={tex} />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <div>
            <span
              className="inline-block w-3 h-0.5 align-middle mr-2"
              style={{ background: "#74b938" }}
            />
            <span>secante a→x</span>
          </div>
          <div>
            <span
              className="inline-block w-3 h-0.5 align-middle mr-2"
              style={{ background: "#dc2626" }}
            />
            <span>cuerda a→b</span>
          </div>
          <div>
            <span
              className="inline-block w-3 h-0.5 align-middle mr-2"
              style={{ background: "#a855f7" }}
            />
            <span>secante x→b</span>
          </div>
        </div>
      </div>
    </div>
  );
}
