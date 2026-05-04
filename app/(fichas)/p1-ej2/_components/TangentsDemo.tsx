"use client";

import {
  Mafs,
  Coordinates,
  Plot,
  Line,
  Text,
  useMovablePoint,
  Theme,
} from "mafs";
import { useMemo } from "react";
import { Tex } from "@/components/math/Tex";

const f = (x: number) => 0.5 * x * x;
const fp = (x: number) => x;

export function TangentsDemo() {
  const a = useMovablePoint([-1, f(-1)], {
    constrain: ([x]) => [Math.max(-3, Math.min(3.5, x ?? -1)), f(x ?? -1)],
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

  const fa = f(ax);
  const fb = f(bx);
  const slopeAB = (fb - fa) / (bx - ax);
  const fpA = fp(ax);
  const fpB = fp(bx);

  const tex = useMemo(
    () =>
      `f'(a) = ${fpA.toFixed(2)} \\;\\leq\\; \\frac{f(b)-f(a)}{b-a} = ${slopeAB.toFixed(2)} \\;\\leq\\; f'(b) = ${fpB.toFixed(2)}`,
    [fpA, slopeAB, fpB],
  );

  const tangentSpan = 1.4;

  return (
    <div className="figure-interactive my-8">
      <div className="border border-ink-100 rounded-md overflow-hidden bg-paper">
        <Mafs viewBox={{ x: [-3.2, 3.7], y: [-1.5, 6] }} height={420}>
          <Coordinates.Cartesian xAxis={{ lines: 1 }} yAxis={{ lines: 1 }} />
          <Plot.OfX y={f} color={Theme.indigo} weight={2.5} />

          {/* cuerda */}
          <Line.Segment
            point1={[ax, fa]}
            point2={[bx, fb]}
            color={Theme.red}
            weight={2}
            opacity={0.5}
          />
          {/* tangente en a */}
          <Line.Segment
            point1={[ax - tangentSpan, fa - fpA * tangentSpan]}
            point2={[ax + tangentSpan, fa + fpA * tangentSpan]}
            color={Theme.green}
            weight={2}
          />
          {/* tangente en b */}
          <Line.Segment
            point1={[bx - tangentSpan, fb - fpB * tangentSpan]}
            point2={[bx + tangentSpan, fb + fpB * tangentSpan]}
            color={Theme.violet}
            weight={2}
          />

          <Text x={ax} y={-0.5} attach="s" size={13}>
            {`a = ${ax.toFixed(2)}`}
          </Text>
          <Text x={bx} y={-0.5} attach="s" size={13}>
            {`b = ${bx.toFixed(2)}`}
          </Text>

          {a.element}
          {b.element}
        </Mafs>
      </div>

      <div className="mt-4 px-4 py-3 bg-ink-100/40 rounded-md font-sans text-sm">
        <div className="text-ink-700 text-xs uppercase tracking-wider mb-2">
          Tangentes y cuerda
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
            <span>tangente en a</span>
          </div>
          <div>
            <span
              className="inline-block w-3 h-0.5 align-middle mr-2 opacity-50"
              style={{ background: "#dc2626" }}
            />
            <span>cuerda a→b</span>
          </div>
          <div>
            <span
              className="inline-block w-3 h-0.5 align-middle mr-2"
              style={{ background: "#a855f7" }}
            />
            <span>tangente en b</span>
          </div>
        </div>
      </div>
    </div>
  );
}
