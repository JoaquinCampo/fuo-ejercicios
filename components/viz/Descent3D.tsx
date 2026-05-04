"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState, type ComponentRef } from "react";
import * as THREE from "three";

type LineRef = ComponentRef<typeof Line>;

/**
 * Generic 3D landscape for visualizing iterative optimization on R²:
 * a smooth height-mapped surface, a grid floor with projected trails,
 * and animated balls following pre-computed trajectories.
 *
 * The animation runs entirely off refs (per project rules: never setState
 * inside useFrame). Trajectories must be pre-computed by the caller.
 */

export type Vec2 = readonly [number, number];

export type Trajectory = {
  /** Short label, e.g. "GD" or "Heavy Ball". */
  label: string;
  /** CSS color for ball, trail, and floor projection. */
  color: string;
  /** Pre-computed iterates in problem space (x, y). */
  points: ReadonlyArray<Vec2>;
};

export type FeasibleRegion =
  | {
      kind: "rect";
      /** [xMin, xMax] in problem space. */
      x: readonly [number, number];
      /** [yMin, yMax] in problem space. */
      y: readonly [number, number];
    }
  | {
      kind: "disk";
      center: Vec2;
      radius: number;
    };

export type Descent3DProps = {
  /** Height function f: R² → R. */
  f: (x: number, y: number) => number;
  /** Domain on x-axis (problem space). */
  xDomain: readonly [number, number];
  /** Domain on y-axis (problem space). */
  yDomain: readonly [number, number];
  /** Trajectories to animate. */
  trajectories: ReadonlyArray<Trajectory>;
  /** Optimum point in problem space, drawn as a green marker. */
  optimum?: Vec2;
  /** Optional feasible region drawn translucently on the floor. */
  feasible?: FeasibleRegion;
  /** Levels at which to draw contour curves on surface and floor. */
  contourLevels?: ReadonlyArray<number>;
  /** Visual height scaling. The surface is drawn with y = f * heightScale. */
  heightScale?: number;
  /** Total seconds for one full playback of the longest trajectory. */
  durationSeconds?: number;
  /** Whether to start playing on mount. */
  autoPlay?: boolean;
  /** Pixel height of the canvas at desktop sizes. */
  height?: number;
  /** Aria label for the figure. */
  ariaLabel?: string;
  /** Optional callback firing each frame with progress in [0,1]. */
  onProgress?: (t: number) => void;
  /** Camera override [x, y, z] in problem-space coordinates. */
  cameraPosition?: readonly [number, number, number];
  /** Camera target override. */
  cameraTarget?: readonly [number, number, number];
};

const FLOOR_OFFSET = -0.02; // small dip so trails on floor don't z-fight

/* ---------- math helpers ---------- */

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpVec3(a: THREE.Vector3, b: THREE.Vector3, t: number, out: THREE.Vector3) {
  out.set(lerp(a.x, b.x, t), lerp(a.y, b.y, t), lerp(a.z, b.z, t));
}

/** Map a height in [hMin, hMax] to an OKLCH-ish gradient color (blue→teal→green→amber). */
function heightColor(h: number, hMin: number, hMax: number, target: THREE.Color) {
  const t = THREE.MathUtils.clamp((h - hMin) / Math.max(1e-9, hMax - hMin), 0, 1);
  // 4-stop gradient: deep indigo → teal → green → amber → orange-red
  const stops = [
    [0.255, 0.298, 0.49], // ink-700-ish indigo
    [0.36, 0.6, 0.62], // teal
    [0.5, 0.72, 0.42], // green
    [0.86, 0.72, 0.36], // amber
    [0.86, 0.46, 0.32], // warm orange
  ];
  const seg = t * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(seg));
  const f = seg - i;
  const a = stops[i]!;
  const b = stops[i + 1]!;
  target.setRGB(lerp(a[0]!, b[0]!, f), lerp(a[1]!, b[1]!, f), lerp(a[2]!, b[2]!, f));
}

/* ---------- surface ---------- */

function Surface({
  f,
  xDomain,
  yDomain,
  heightScale,
  segments,
  hMinRef,
  hMaxRef,
}: {
  f: (x: number, y: number) => number;
  xDomain: readonly [number, number];
  yDomain: readonly [number, number];
  heightScale: number;
  segments: number;
  hMinRef: React.RefObject<number>;
  hMaxRef: React.RefObject<number>;
}) {
  const geometry = useMemo(() => {
    const xMin = xDomain[0];
    const xMax = xDomain[1];
    const yMin = yDomain[0];
    const yMax = yDomain[1];
    const w = xMax - xMin;
    const d = yMax - yMin;
    const geom = new THREE.PlaneGeometry(w, d, segments, segments);
    geom.rotateX(-Math.PI / 2);
    const pos = geom.attributes.position;
    if (!pos) return geom;
    const colors = new Float32Array(pos.count * 3);
    let hMin = Infinity;
    let hMax = -Infinity;
    const heights: number[] = new Array(pos.count);
    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      // map from plane coords (centered on origin) into problem space
      const xp = x + (xMin + xMax) / 2;
      const yp = z + (yMin + yMax) / 2;
      const h = f(xp, yp);
      heights[i] = h;
      if (h < hMin) hMin = h;
      if (h > hMax) hMax = h;
    }
    hMinRef.current = hMin;
    hMaxRef.current = hMax;
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i += 1) {
      const h = heights[i]!;
      pos.setY(i, h * heightScale);
      heightColor(h, hMin, hMax, c);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geom.computeVertexNormals();
    return geom;
  }, [f, xDomain, yDomain, heightScale, segments, hMinRef, hMaxRef]);

  const planeCenter: [number, number, number] = [
    (xDomain[0] + xDomain[1]) / 2,
    0,
    (yDomain[0] + yDomain[1]) / 2,
  ];

  return (
    <group position={planeCenter}>
      <mesh geometry={geometry}>
        <meshLambertMaterial
          vertexColors
          side={THREE.DoubleSide}
          transparent
          opacity={0.95}
        />
      </mesh>
      {/* faint wireframe overlay on top of the surface for depth cues */}
      <mesh geometry={geometry}>
        <meshBasicMaterial
          color="#1f2937"
          wireframe
          transparent
          opacity={0.06}
        />
      </mesh>
    </group>
  );
}

/* ---------- floor ---------- */

function Floor({
  xDomain,
  yDomain,
  contourPoints,
  feasible,
}: {
  xDomain: readonly [number, number];
  yDomain: readonly [number, number];
  contourPoints: ReadonlyArray<ReadonlyArray<[number, number, number]>>;
  feasible?: FeasibleRegion | undefined;
}) {
  const cx = (xDomain[0] + xDomain[1]) / 2;
  const cz = (yDomain[0] + yDomain[1]) / 2;
  const w = xDomain[1] - xDomain[0];
  const d = yDomain[1] - yDomain[0];

  return (
    <group position={[cx, FLOOR_OFFSET, cz]}>
      {/* Solid base */}
      <mesh position={[0, -0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w * 1.05, d * 1.05]} />
        <meshBasicMaterial color="#fafafa" />
      </mesh>
      {/* Grid of subtle lines */}
      <gridHelper
        args={[Math.max(w, d) * 1.02, Math.round(Math.max(w, d) * 2), "#d4d4d8", "#e4e4e7"]}
        position={[0, 0, 0]}
      />
      {/* Level curve projections */}
      {contourPoints.map((pts, i) => (
        <Line
          key={`floor-contour-${i}`}
          points={pts.map(([x, , z]) => [x - cx, 0.002, z - cz]) as [number, number, number][]}
          color="#94a3b8"
          lineWidth={1}
          transparent
          opacity={0.55}
        />
      ))}
      {/* Feasible region */}
      {feasible?.kind === "rect" ? (
        <mesh
          position={[
            (feasible.x[0] + feasible.x[1]) / 2 - cx,
            0.003,
            (feasible.y[0] + feasible.y[1]) / 2 - cz,
          ]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[feasible.x[1] - feasible.x[0], feasible.y[1] - feasible.y[0]]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.18} />
        </mesh>
      ) : null}
      {feasible?.kind === "rect" ? (
        <Line
          points={(() => {
            const x0 = feasible.x[0] - cx;
            const x1 = feasible.x[1] - cx;
            const z0 = feasible.y[0] - cz;
            const z1 = feasible.y[1] - cz;
            const y = 0.005;
            return [
              [x0, y, z0],
              [x1, y, z0],
              [x1, y, z1],
              [x0, y, z1],
              [x0, y, z0],
            ] as [number, number, number][];
          })()}
          color="#1d4ed8"
          lineWidth={1.5}
          transparent
          opacity={0.7}
        />
      ) : null}
    </group>
  );
}

/* ---------- contour generation ---------- */

/** Build closed contour polylines on the floor by sampling f along level sets.
 * For axis-aligned quadratics this is exact (an ellipse); for general f, we
 * fall back to a marching-squares pass at coarse resolution. We attempt the
 * fast path for ax² + by² + linear. */
function buildContoursFloor(
  f: (x: number, y: number) => number,
  xDomain: readonly [number, number],
  yDomain: readonly [number, number],
  levels: ReadonlyArray<number>,
  heightScale: number,
): Array<Array<[number, number, number]>> {
  // Marching squares — robust fallback. Resolution moderate (60×60) for
  // smooth contours without blowing the budget.
  const NX = 80;
  const NY = 80;
  const xMin = xDomain[0];
  const xMax = xDomain[1];
  const yMin = yDomain[0];
  const yMax = yDomain[1];
  const dx = (xMax - xMin) / NX;
  const dy = (yMax - yMin) / NY;
  const grid: number[][] = [];
  for (let j = 0; j <= NY; j += 1) {
    const row: number[] = [];
    for (let i = 0; i <= NX; i += 1) {
      row.push(f(xMin + i * dx, yMin + j * dy));
    }
    grid.push(row);
  }
  const lerpEdge = (
    x1: number,
    y1: number,
    v1: number,
    x2: number,
    y2: number,
    v2: number,
    c: number,
  ): [number, number] => {
    const t = (c - v1) / (v2 - v1);
    return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)];
  };
  const result: Array<Array<[number, number, number]>> = [];
  for (const c of levels) {
    const segs: Array<[number, number, number, number]> = []; // x1, y1, x2, y2
    for (let j = 0; j < NY; j += 1) {
      for (let i = 0; i < NX; i += 1) {
        const x0 = xMin + i * dx;
        const x1 = xMin + (i + 1) * dx;
        const y0 = yMin + j * dy;
        const y1 = yMin + (j + 1) * dy;
        const v00 = grid[j]![i]!;
        const v10 = grid[j]![i + 1]!;
        const v01 = grid[j + 1]![i]!;
        const v11 = grid[j + 1]![i + 1]!;
        let idx = 0;
        if (v00 > c) idx |= 1;
        if (v10 > c) idx |= 2;
        if (v11 > c) idx |= 4;
        if (v01 > c) idx |= 8;
        const tops: Array<[number, number]> = [];
        // bottom edge
        if ((v00 > c) !== (v10 > c)) tops.push(lerpEdge(x0, y0, v00, x1, y0, v10, c));
        // right edge
        if ((v10 > c) !== (v11 > c)) tops.push(lerpEdge(x1, y0, v10, x1, y1, v11, c));
        // top edge
        if ((v11 > c) !== (v01 > c)) tops.push(lerpEdge(x1, y1, v11, x0, y1, v01, c));
        // left edge
        if ((v01 > c) !== (v00 > c)) tops.push(lerpEdge(x0, y1, v01, x0, y0, v00, c));
        if (tops.length === 2) {
          segs.push([tops[0]![0], tops[0]![1], tops[1]![0], tops[1]![1]]);
        } else if (tops.length === 4) {
          segs.push([tops[0]![0], tops[0]![1], tops[1]![0], tops[1]![1]]);
          segs.push([tops[2]![0], tops[2]![1], tops[3]![0], tops[3]![1]]);
        }
      }
    }
    // Don't bother stitching segments into polylines — drawing each segment
    // as its own 2-point line is fine for visual density.
    if (segs.length > 0) {
      const flattened: Array<[number, number, number]> = [];
      for (const s of segs) {
        flattened.push([s[0]!, 0, s[1]!]);
        flattened.push([s[2]!, 0, s[3]!]);
      }
      // Draw as one Line via degenerate moves: drei's Line draws a polyline,
      // so we draw segments by chaining (some flicker between segs is OK,
      // they'll show as discrete line bits which actually reads as contours).
      result.push(flattened);
    }
  }
  // Suppress unused-variable warning for heightScale (kept in signature for
  // future surface-overlay contours).
  void heightScale;
  return result;
}

/* ---------- animated trajectory ---------- */

function AnimatedTrajectory({
  points,
  color,
  heightScale,
  f,
  progress,
  ballSize,
  showFloorTrail,
}: {
  points: ReadonlyArray<Vec2>;
  color: string;
  heightScale: number;
  f: (x: number, y: number) => number;
  progress: React.RefObject<number>;
  ballSize: number;
  showFloorTrail: boolean;
}) {
  const iter3D = useMemo(
    () =>
      points.map(([x, y]) => {
        const h = f(x, y) * heightScale;
        // raise slightly so trails sit on the surface, not inside it
        return new THREE.Vector3(x, h + 0.04, y);
      }),
    [points, f, heightScale],
  );

  const ballRef = useRef<THREE.Group>(null);
  const floorBallRef = useRef<THREE.Mesh>(null);
  const dropPinRef = useRef<THREE.Mesh>(null);
  const scratch = useRef(new THREE.Vector3());

  // Build line points arrays once for drei <Line>; we'll re-render the line
  // with a different slice as progress advances. To avoid expensive re-mounts,
  // we render the full trail and animate via scale/clip indirectly: drei's
  // <Line> rebuilds geometry on points change, so we instead render the FULL
  // trail with a uniform colour then overlay a "head" line via setDrawRange.
  // Simpler path: split into "drawn so far" and "remaining (faint)".
  const headIdxRef = useRef(0);

  const surfacePoints = useMemo(
    () => iter3D.map((v) => [v.x, v.y, v.z]) as [number, number, number][],
    [iter3D],
  );
  const floorPoints = useMemo(
    () =>
      iter3D.map((v) => [v.x, FLOOR_OFFSET + 0.012, v.z]) as [
        number,
        number,
        number,
      ][],
    [iter3D],
  );

  // We'll render two Line passes — full faint base and a partial bright head.
  const headLineRef = useRef<LineRef>(null);
  const floorHeadLineRef = useRef<LineRef>(null);

  useFrame(() => {
    if (iter3D.length === 0) return;
    const p = THREE.MathUtils.clamp(progress.current ?? 0, 0, 1);
    const k = p * (iter3D.length - 1);
    const i = Math.floor(k);
    const t = k - i;
    const a = iter3D[i] ?? iter3D[0]!;
    const b = iter3D[Math.min(i + 1, iter3D.length - 1)] ?? a;
    lerpVec3(a, b, t, scratch.current);
    if (ballRef.current) {
      ballRef.current.position.copy(scratch.current);
      // Fade ball out near end so converged trajectories don't pile up at x*.
      const fadeStart = 0.85;
      const fadeOpacity = p > fadeStart ? Math.max(0, 1 - (p - fadeStart) / (1 - fadeStart)) : 1;
      ballRef.current.traverse((obj) => {
        const m = (obj as THREE.Mesh).material as THREE.Material | undefined;
        if (m && "opacity" in m) {
          (m as THREE.Material & { opacity: number; transparent: boolean }).transparent = true;
          (m as THREE.Material & { opacity: number; transparent: boolean }).opacity =
            fadeOpacity;
        }
      });
    }
    if (floorBallRef.current) {
      floorBallRef.current.position.set(
        scratch.current.x,
        FLOOR_OFFSET + 0.014,
        scratch.current.z,
      );
    }
    if (dropPinRef.current) {
      // cylinder centered at midpoint between ball y and floor y
      const yMid = (scratch.current.y + FLOOR_OFFSET) / 2;
      const yLen = Math.max(0.001, scratch.current.y - FLOOR_OFFSET);
      dropPinRef.current.position.set(scratch.current.x, yMid, scratch.current.z);
      dropPinRef.current.scale.y = yLen;
    }
    const drawCount = Math.max(2, Math.min(iter3D.length, i + 2));
    headIdxRef.current = drawCount;
    const headGeom = headLineRef.current?.geometry as
      | THREE.BufferGeometry
      | undefined;
    if (headGeom) headGeom.setDrawRange(0, drawCount);
    const floorGeom = floorHeadLineRef.current?.geometry as
      | THREE.BufferGeometry
      | undefined;
    if (floorGeom) floorGeom.setDrawRange(0, drawCount);
  });

  const start = iter3D[0] ?? new THREE.Vector3();

  // Brighter, contrasting outline color for the ball
  return (
    <group>
      {/* Faint full-trail underlay (so user sees the whole path even before play) */}
      <Line
        points={surfacePoints}
        color={color}
        lineWidth={2.5}
        transparent
        opacity={0.85}
        dashed={false}
      />
      {/* Bright head trail, draw range animated each frame */}
      <Line
        ref={headLineRef}
        points={surfacePoints}
        color={color}
        lineWidth={3.5}
      />
      {showFloorTrail ? (
        <>
          <Line
            points={floorPoints}
            color={color}
            lineWidth={1}
            transparent
            opacity={0.18}
          />
          <Line
            ref={floorHeadLineRef}
            points={floorPoints}
            color={color}
            lineWidth={1.5}
            transparent
            opacity={0.7}
          />
        </>
      ) : null}
      {/* Start marker */}
      <mesh position={[start.x, start.y, start.z]}>
        <sphereGeometry args={[ballSize * 0.7, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.45} />
      </mesh>
      {/* Thin drop pin from ball to floor; helps locate the ball against
         the colored bowl without dominating the scene. */}
      <mesh ref={dropPinRef}>
        <cylinderGeometry args={[ballSize * 0.08, ballSize * 0.08, 1, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.32} />
      </mesh>
      {/* Animated ball on surface */}
      <group ref={ballRef}>
        <mesh>
          <sphereGeometry args={[ballSize, 24, 24]} />
          <meshStandardMaterial
            color={color}
            roughness={0.25}
            metalness={0.25}
            emissive={color}
            emissiveIntensity={0.45}
          />
        </mesh>
      </group>
      {/* Floor shadow ball */}
      {showFloorTrail ? (
        <mesh ref={floorBallRef}>
          <sphereGeometry args={[ballSize * 0.55, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.85} />
        </mesh>
      ) : null}
    </group>
  );
}

/* ---------- camera framing helpers ---------- */

function defaultCameraFor(
  xDomain: readonly [number, number],
  yDomain: readonly [number, number],
): { position: [number, number, number]; target: [number, number, number] } {
  const cx = (xDomain[0] + xDomain[1]) / 2;
  const cz = (yDomain[0] + yDomain[1]) / 2;
  const w = xDomain[1] - xDomain[0];
  const d = yDomain[1] - yDomain[0];
  // Frame the bowl looking down the long axis (typical for ill-conditioned
  // canyons): camera placed off-axis on the long side, low elevation, so
  // the narrow direction reads left-to-right and oscillation across it
  // becomes visible. For roughly square domains the angle still works.
  const longAxis = Math.max(w, d);
  return {
    position: [cx + w * 0.85, longAxis * 0.4, cz + d * 0.7 + longAxis * 0.05],
    target: [cx, longAxis * 0.05, cz],
  };
}

/* ---------- main component ---------- */

export function Descent3D({
  f,
  xDomain,
  yDomain,
  trajectories,
  optimum,
  feasible,
  contourLevels,
  heightScale = 1,
  durationSeconds = 6,
  autoPlay = true,
  height = 460,
  ariaLabel,
  onProgress,
  cameraPosition,
  cameraTarget,
}: Descent3DProps) {
  const [playing, setPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState(1);
  const progressRef = useRef(0);
  const playingRef = useRef(autoPlay);
  const speedRef = useRef(1);
  const durationRef = useRef(durationSeconds);
  const [, force] = useState(0);

  // sync refs with state (refs are read inside useFrame, so we can't use state there)
  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);
  useEffect(() => {
    durationRef.current = durationSeconds;
  }, [durationSeconds]);

  // when trajectories change (e.g., user slid α/β), reset to start.
  useEffect(() => {
    progressRef.current = 0;
    force((x) => x + 1);
  }, [trajectories]);

  const hMinRef = useRef(0);
  const hMaxRef = useRef(1);

  const camera = useMemo(() => {
    const def = defaultCameraFor(xDomain, yDomain);
    return {
      position: cameraPosition ?? def.position,
      target: cameraTarget ?? def.target,
    };
  }, [xDomain, yDomain, cameraPosition, cameraTarget]);

  // ball radius: visible against the bowl but small enough that 3 balls
  // together don't cover the optimum.
  const ballSize = useMemo(() => {
    const w = xDomain[1] - xDomain[0];
    const d = yDomain[1] - yDomain[0];
    const longSide = Math.max(w, d);
    return Math.max(0.09, longSide * 0.018);
  }, [xDomain, yDomain]);

  const contoursOnFloor = useMemo(() => {
    if (!contourLevels || contourLevels.length === 0) return [];
    return buildContoursFloor(f, xDomain, yDomain, contourLevels, heightScale);
  }, [f, xDomain, yDomain, contourLevels, heightScale]);

  const cx = (xDomain[0] + xDomain[1]) / 2;
  const cz = (yDomain[0] + yDomain[1]) / 2;

  return (
    <div className="not-prose">
      <div
        className="relative border border-ink-100 rounded-md overflow-hidden bg-paper"
        style={{ height }}
        aria-label={ariaLabel}
      >
        <Canvas
          camera={{ position: camera.position, fov: 38, near: 0.1, far: 200 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          frameloop="always"
        >
          <color attach="background" args={["#fafafa"]} />
          <ambientLight intensity={0.65} />
          <directionalLight position={[6, 10, 4]} intensity={0.85} />
          <directionalLight position={[-4, 6, -3]} intensity={0.25} />
          <Surface
            f={f}
            xDomain={xDomain}
            yDomain={yDomain}
            heightScale={heightScale}
            segments={64}
            hMinRef={hMinRef}
            hMaxRef={hMaxRef}
          />
          <Floor
            xDomain={xDomain}
            yDomain={yDomain}
            contourPoints={contoursOnFloor}
            feasible={feasible}
          />
          {/* Optimum marker (vertical pin on surface + green disc on floor) */}
          {optimum ? (
            <group>
              <mesh
                position={[
                  optimum[0],
                  f(optimum[0], optimum[1]) * heightScale + ballSize * 1.6,
                  optimum[1],
                ]}
              >
                <sphereGeometry args={[ballSize * 0.95, 16, 16]} />
                <meshStandardMaterial
                  color="#16a34a"
                  emissive="#16a34a"
                  emissiveIntensity={0.55}
                />
              </mesh>
              {/* small drop line from sphere to floor ring */}
              <mesh
                position={[
                  optimum[0],
                  (f(optimum[0], optimum[1]) * heightScale + FLOOR_OFFSET) / 2 +
                    ballSize * 0.5,
                  optimum[1],
                ]}
              >
                <cylinderGeometry
                  args={[
                    0.012,
                    0.012,
                    Math.max(
                      0.05,
                      f(optimum[0], optimum[1]) * heightScale -
                        FLOOR_OFFSET +
                        ballSize,
                    ),
                    8,
                  ]}
                />
                <meshBasicMaterial color="#16a34a" transparent opacity={0.6} />
              </mesh>
              <mesh
                position={[optimum[0], FLOOR_OFFSET + 0.012, optimum[1]]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <ringGeometry args={[ballSize * 0.9, ballSize * 1.4, 32]} />
                <meshBasicMaterial color="#16a34a" />
              </mesh>
            </group>
          ) : null}
          {trajectories.map((tr, i) => (
            <AnimatedTrajectory
              key={`${tr.label}-${i}`}
              points={tr.points}
              color={tr.color}
              heightScale={heightScale}
              f={f}
              progress={progressRef}
              ballSize={ballSize}
              showFloorTrail
            />
          ))}
          <ProgressDriver
            playingRef={playingRef}
            speedRef={speedRef}
            durationRef={durationRef}
            progressRef={progressRef}
            onProgress={onProgress}
          />
          <OrbitControls
            enableDamping
            dampingFactor={0.1}
            minDistance={1.5}
            maxDistance={Math.max(xDomain[1] - xDomain[0], yDomain[1] - yDomain[0]) * 3}
            target={camera.target}
            makeDefault
          />
        </Canvas>

        {/* Legend overlay */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-sans bg-paper/85 backdrop-blur px-2 py-1 rounded-sm border border-ink-100 max-w-[calc(100%-1rem)]">
          {trajectories.map((t) => (
            <span key={t.label} className="inline-flex items-center gap-1.5">
              <span
                aria-hidden
                className="inline-block size-2.5 rounded-full"
                style={{ background: t.color }}
              />
              <span className="text-ink-700">{t.label}</span>
            </span>
          ))}
          {optimum ? (
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden
                className="inline-block size-2.5 rounded-full"
                style={{ background: "#16a34a" }}
              />
              <span className="text-ink-700">x*</span>
            </span>
          ) : null}
        </div>

        {/* Hint */}
        <div className="absolute bottom-2 right-2 text-[10px] font-sans text-ink-500 bg-paper/70 backdrop-blur px-1.5 py-0.5 rounded-sm">
          arrastrá para rotar · scroll para zoom
        </div>
      </div>

      {/* Playback controls */}
      <div className="mt-3 flex flex-wrap items-center gap-3 px-1 font-sans text-xs">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="no-print inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-ink-100 hover:border-accent-600 hover:text-accent-700 transition-colors"
        >
          {playing ? (
            <>
              <span aria-hidden>❚❚</span> pausar
            </>
          ) : (
            <>
              <span aria-hidden>▶</span> reproducir
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            progressRef.current = 0;
            force((x) => x + 1);
          }}
          className="no-print inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-ink-100 hover:border-accent-600 hover:text-accent-700 transition-colors"
        >
          <span aria-hidden>↺</span> reiniciar
        </button>
        <label className="flex items-center gap-2 ml-auto">
          <span className="text-ink-500">velocidad</span>
          <input
            type="range"
            min={0.25}
            max={3}
            step={0.05}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-24 sm:w-32 accent-accent-600"
          />
          <span className="font-mono text-ink-500 w-10 text-right">
            {speed.toFixed(2)}×
          </span>
        </label>
      </div>
    </div>
  );
}

function ProgressDriver({
  playingRef,
  speedRef,
  durationRef,
  progressRef,
  onProgress,
}: {
  playingRef: React.RefObject<boolean>;
  speedRef: React.RefObject<number>;
  durationRef: React.RefObject<number>;
  progressRef: React.RefObject<number>;
  onProgress?: ((t: number) => void) | undefined;
}) {
  const holdRef = useRef(0);
  useFrame((_state, delta: number) => {
    if (!playingRef.current) return;
    const dur = durationRef.current ?? 6;
    const sp = speedRef.current ?? 1;
    const cur = progressRef.current ?? 0;
    if (cur >= 1) {
      // brief hold at end before looping
      holdRef.current += delta;
      if (holdRef.current > 1.2) {
        holdRef.current = 0;
        progressRef.current = 0;
      }
      return;
    }
    const next = cur + (delta * sp) / Math.max(0.1, dur);
    progressRef.current = next > 1 ? 1 : next;
    if (onProgress) onProgress(progressRef.current);
  });
  return null;
}
