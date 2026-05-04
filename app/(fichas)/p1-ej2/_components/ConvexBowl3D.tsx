"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Line, Html } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { Tex } from "@/components/math/Tex";

const A: [number, number, number] = [-1.5, 3.25, -1];
const B: [number, number, number] = [1.5, 3.25, 1];
const MID: [number, number, number] = [0, 3.25, 0];
const BOTTOM: [number, number, number] = [0, 0, 0];

function ParaboloidSurface() {
  const geom = useMemo(() => {
    const N = 48;
    const size = 4;
    const g = new THREE.PlaneGeometry(size, size, N, N);
    const pos = g.attributes.position;
    if (!pos) return g;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getY(i);
      const y = x * x + z * z;
      pos.setXYZ(i, x, y, z);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geom}>
      <meshStandardMaterial
        color="#3B82F6"
        wireframe
        transparent
        opacity={0.55}
      />
    </mesh>
  );
}

function Label({
  position,
  children,
}: {
  position: [number, number, number];
  children: React.ReactNode;
}) {
  return (
    <Html
      position={position}
      center
      distanceFactor={9}
      style={{
        background: "white",
        border: "1px solid #d4d4d8",
        borderRadius: "0.25rem",
        padding: "0.2rem 0.5rem",
        fontFamily: "var(--font-sans)",
        fontSize: "0.7rem",
        whiteSpace: "nowrap",
        pointerEvents: "none",
      }}
    >
      {children}
    </Html>
  );
}

export function ConvexBowl3D() {
  return (
    <figure data-no-print className="figure-interactive my-8 not-prose">
      <div className="border border-ink-100 rounded-md overflow-hidden bg-paper">
        <div className="h-[440px] w-full">
          <Canvas
            camera={{ position: [4.5, 4, 5], fov: 38 }}
            shadows={false}
            dpr={[1, 2]}
            frameloop="demand"
          >
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 8, 4]} intensity={0.9} />
            <Grid
              args={[10, 10]}
              cellColor="#e5e7eb"
              sectionColor="#cbd5e1"
              cellSize={0.5}
              sectionSize={1}
              fadeDistance={20}
              infiniteGrid
            />
            <ParaboloidSurface />
            {/* cuerda */}
            <Line points={[A, B]} color="#dc2626" lineWidth={3} />
            {/* gap vertical */}
            <Line points={[BOTTOM, MID]} color="#f59e0b" lineWidth={4} />
            {/* puntos */}
            <mesh position={A}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshStandardMaterial color="#111" />
            </mesh>
            <mesh position={B}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshStandardMaterial color="#111" />
            </mesh>
            <mesh position={MID}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshStandardMaterial color="#fff" />
            </mesh>
            <mesh position={BOTTOM}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshStandardMaterial color="#111" />
            </mesh>
            <Label position={[A[0] - 0.1, A[1] + 0.6, A[2] - 0.4]}>
              A = (a, f(a))
            </Label>
            <Label position={[B[0] + 0.5, B[1] + 0.5, B[2]]}>
              B = (b, f(b))
            </Label>
            <Label position={[MID[0] + 0.7, MID[1] + 0.2, MID[2]]}>
              punto medio de la cuerda
            </Label>
            <Label position={[BOTTOM[0] + 0.7, BOTTOM[1], BOTTOM[2] + 0.7]}>
              f(punto medio)
            </Label>
            <Label position={[0.5, 1.6, 0]}>gap = 3.25 (la cuerda está ARRIBA)</Label>
            <OrbitControls enableDamping dampingFactor={0.1} />
          </Canvas>
        </div>
      </div>
      <figcaption className="mt-3 px-2 font-sans text-xs text-ink-500">
        Paraboloide <Tex tex="f(x,y)=x^2+y^2" />. La cuerda entre dos puntos del
        gráfico (rojo) queda arriba de la superficie. La barra naranja mide el{" "}
        <em>gap</em> en el punto medio. Arrastrá para rotar.
      </figcaption>
    </figure>
  );
}
