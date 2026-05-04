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

export function ConvexityChordDemo() {
  const a = useMovablePoint([-1, f(-1)], {
    constrain: ([x]) => [Math.max(-3, Math.min(3.5, x ?? -1)), f(x ?? -1)],
    color: Theme.blue,
  });
  const b = useMovablePoint([3, f(3)], {
    constrain: ([x]) => [Math.max(-3, Math.min(3.5, x ?? 3)), f(x ?? 3)],
    color: Theme.blue,
  });

  // ordenamos para que ax sea siempre el menor: el "a" matemático
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
      return [clamped, 0];
    },
    color: Theme.orange,
  });

  const xv = xMid.point[0];
  const fa = f(ax);
  const fb = f(bx);
  const fx = f(xv);
  const t = (bx - xv) / (bx - ax);
  const chordAtX = t * fa + (1 - t) * fb;

  const inequalityTex = useMemo(
    () =>
      `f(x) = ${fx.toFixed(2)} \\;\\leq\\; ${chordAtX.toFixed(2)} = \\frac{b - x}{b - a}\\,f(a) + \\frac{x - a}{b - a}\\,f(b)`,
    [fx, chordAtX],
  );

  const valuesTex = useMemo(
    () =>
      `a = ${ax.toFixed(2)}, \\quad b = ${bx.toFixed(2)}, \\quad x = ${xv.toFixed(2)}, \\quad t = \\tfrac{b-x}{b-a} = ${t.toFixed(3)}`,
    [ax, bx, xv, t],
  );

  return (
    <div className="figure-interactive my-8">
      <div className="border border-ink-100 rounded-md overflow-hidden bg-paper">
        <Mafs viewBox={{ x: [-3.2, 3.7], y: [-1.5, 6] }} height={420}>
          <Coordinates.Cartesian xAxis={{ lines: 1 }} yAxis={{ lines: 1 }} />

          {/* curva */}
          <Plot.OfX y={f} color={Theme.indigo} weight={2.5} />

          {/* cuerda */}
          <Line.Segment
            point1={[ax, fa]}
            point2={[bx, fb]}
            color={Theme.red}
            weight={2.5}
          />

          {/* gap: doble flecha gruesa naranja */}
          <Line.Segment
            point1={[xv, fx]}
            point2={[xv, chordAtX]}
            color={Theme.orange}
            weight={5}
          />

          {/* punto sobre la cuerda (círculo abierto) */}
          <Point x={xv} y={chordAtX} color={Theme.orange} svgCircleProps={{ fill: "white", strokeWidth: 2 }} />

          {/* punto sobre la curva en x */}
          <Point x={xv} y={fx} color={Theme.indigo} />

          {/* etiqueta del gap */}
          <Text
            x={xv + 0.15}
            y={(fx + chordAtX) / 2}
            attach="e"
            size={14}
            color="var(--color-warning)"
          >
            {`gap = ${(chordAtX - fx).toFixed(2)}`}
          </Text>

          {/* etiquetas a y b en eje */}
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

      <div className="mt-4 px-4 py-3 bg-ink-100/40 rounded-md font-sans text-sm space-y-2">
        <div className="text-ink-700 text-xs uppercase tracking-wider">
          Valores actuales
        </div>
        <div className="text-base">
          <Tex tex={valuesTex} />
        </div>
        <div className="text-base">
          <Tex tex={inequalityTex} />
        </div>
        <div className="text-xs text-ink-500 mt-2">
          Arrastrá <span className="text-accent-700 font-medium">A</span> y{" "}
          <span className="text-accent-700 font-medium">B</span> sobre la curva,
          y <span style={{ color: "var(--color-warning)" }} className="font-medium">x</span>{" "}
          en el eje horizontal entre ellos. Si invertís A y B, los rótulos se
          reordenan automáticamente.
        </div>
      </div>
    </div>
  );
}
