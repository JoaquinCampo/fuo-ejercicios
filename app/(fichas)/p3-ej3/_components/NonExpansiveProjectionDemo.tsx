"use client";

import {
  Mafs,
  Coordinates,
  Circle,
  Line,
  Point,
  Text,
  useMovablePoint,
  Theme,
} from "mafs";
import { useMemo } from "react";
import { Tex } from "@/components/math/Tex";

const R = 1.2;

// Proyección sobre el disco cerrado de radio R centrado en el origen
function proj(p: readonly [number, number]): [number, number] {
  const n = Math.hypot(p[0], p[1]);
  if (n <= R) return [p[0], p[1]];
  return [(p[0] / n) * R, (p[1] / n) * R];
}

export function NonExpansiveProjectionDemo() {
  const x = useMovablePoint([2.4, 1.6], { color: Theme.indigo });
  const y = useMovablePoint([-1.4, 2.2], { color: Theme.green });

  const px = proj(x.point);
  const py = proj(y.point);

  const dxy = Math.hypot(x.point[0] - y.point[0], x.point[1] - y.point[1]);
  const dpxpy = Math.hypot(px[0] - py[0], px[1] - py[1]);
  const ratio = dxy > 1e-9 ? dpxpy / dxy : 1;

  const tex = useMemo(
    () =>
      `\\|P_{\\mathcal X}(x) - P_{\\mathcal X}(y)\\| = ${dpxpy.toFixed(3)} \\;\\leq\\; \\|x - y\\| = ${dxy.toFixed(3)},\\quad \\text{ratio} = ${ratio.toFixed(3)}`,
    [dpxpy, dxy, ratio],
  );

  return (
    <div className="figure-interactive my-8">
      <div className="border border-ink-100 rounded-md overflow-hidden bg-paper">
        <Mafs viewBox={{ x: [-3, 3], y: [-2, 2.6] }} height={360}>
          <Coordinates.Cartesian xAxis={{ lines: 1 }} yAxis={{ lines: 1 }} />

          {/* conjunto convexo: disco */}
          <Circle
            center={[0, 0]}
            radius={R}
            color={Theme.blue}
            fillOpacity={0.08}
            strokeOpacity={0.4}
            weight={1.5}
          />

          {/* segmentos x↔P(x), y↔P(y) (perpendiculares al borde) */}
          <Line.Segment
            point1={x.point}
            point2={px}
            color={Theme.indigo}
            weight={1.5}
            opacity={0.4}
          />
          <Line.Segment
            point1={y.point}
            point2={py}
            color={Theme.green}
            weight={1.5}
            opacity={0.4}
          />

          {/* segmento x-y y P(x)-P(y) */}
          <Line.Segment
            point1={x.point}
            point2={y.point}
            color={Theme.orange}
            weight={2}
            opacity={0.7}
          />
          <Line.Segment
            point1={px}
            point2={py}
            color={Theme.orange}
            weight={3}
          />

          <Point x={px[0]} y={px[1]} color={Theme.indigo} />
          <Point x={py[0]} y={py[1]} color={Theme.green} />

          <Text x={px[0] + 0.05} y={px[1] - 0.05} attach="se" size={12} color={Theme.indigo}>
            {`P(x)`}
          </Text>
          <Text x={py[0] - 0.05} y={py[1] - 0.05} attach="sw" size={12} color={Theme.green}>
            {`P(y)`}
          </Text>
          <Text x={x.point[0] + 0.08} y={x.point[1] + 0.08} attach="ne" size={12} color={Theme.indigo}>
            {`x`}
          </Text>
          <Text x={y.point[0] - 0.08} y={y.point[1] + 0.08} attach="nw" size={12} color={Theme.green}>
            {`y`}
          </Text>
          <Text x={0} y={0} attach="n" size={12} color={Theme.blue}>
            {`𝒳`}
          </Text>

          {x.element}
          {y.element}
        </Mafs>
      </div>

      <div className="mt-4 px-4 py-3 bg-ink-100/40 rounded-md font-sans text-sm space-y-3">
        <div className="text-ink-700 text-xs uppercase tracking-wider">
          Proyección sobre disco: ‖P(x) − P(y)‖ ≤ ‖x − y‖
        </div>
        <div className="text-base">
          <Tex tex={tex} />
        </div>
        <div className="text-xs text-ink-500">
          Movés <span style={{ color: "var(--mafs-color-indigo, #5e63d4)" }}>x</span>{" "}
          y <span style={{ color: "var(--mafs-color-green, #16a34a)" }}>y</span>:
          el segmento naranja claro es <code>x − y</code>, el oscuro es{" "}
          <code>P(x) − P(y)</code>. Al proyectar al disco convexo, la
          distancia <strong>nunca crece</strong>: la proyección "achica" la
          distancia o la deja igual. Eso es la <em>no expansividad</em> de la
          proyección sobre conjuntos convexos cerrados, y es la pieza clave
          para acotar el error de gradiente proyectado.
        </div>
      </div>
    </div>
  );
}
