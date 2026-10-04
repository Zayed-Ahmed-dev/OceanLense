"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  Html,
  OrbitControls,
  Text,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";
import {
  useMemo,
  useRef,
  useState,
} from "react";

import type { TemperaturePoint } from "@/lib/temperature";

interface Props {
  points: TemperaturePoint[];
  showUncertainty?: boolean;
}

/* =========================================================
   SHARED WAVE FIELD
   Every wavy surface (ocean top, water layers, connectors,
   boat) samples this same function so motion reads as one
   continuous body of water instead of separate slices.
   `depthFactor` (1 = surface, ~0 = seabed) damps amplitude
   with depth.
   ========================================================= */

function waveHeight(
  x: number,
  z: number,
  time: number,
  depthFactor: number,
) {
  const amp = 0.02 + 0.075 * depthFactor;

  return (
    Math.sin(x * 1.4 + time * 1.2) * amp +
    Math.cos(z * 1.7 + time * 1.05) * amp * 0.75 +
    Math.sin((x + z) * 1.8 + time) * amp * 0.4
  );
}

/* =========================================================
   TEMPERATURE COLOR MAP
   ========================================================= */

function temperatureColor(
  temperature: number,
  min: number,
  max: number,
) {
  const t = THREE.MathUtils.clamp(
    (temperature - min) /
      Math.max(max - min, 0.001),
    0,
    1,
  );

  const stops = [
    { t: 0.0, color: new THREE.Color("#061633") },
    { t: 0.15, color: new THREE.Color("#0A2F68") },
    { t: 0.30, color: new THREE.Color("#075AA6") },
    { t: 0.45, color: new THREE.Color("#08A8C7") },
    { t: 0.60, color: new THREE.Color("#12C98B") },
    { t: 0.75, color: new THREE.Color("#D5E52C") },
    { t: 0.88, color: new THREE.Color("#FFB21A") },
    { t: 1.0, color: new THREE.Color("#EF4B16") },
  ];

  for (let i = 0; i < stops.length - 1; i += 1) {
    const a = stops[i];
    const b = stops[i + 1];

    if (t >= a.t && t <= b.t) {
      const localT =
        (t - a.t) / (b.t - a.t);

      return `#${a.color
        .clone()
        .lerp(b.color, localT)
        .getHexString()}`;
    }
  }

  return "#061633";
}

/* =========================================================
   OCEAN SURFACE
   ========================================================= */

function OceanSurface() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(
      7.8,
      7.8,
      55,
      55,
    );

    return geo;
  }, []);

  useFrame(({ clock }) => {
    const position =
      geometry.attributes.position;

    const time =
      clock.getElapsedTime();

    for (
      let i = 0;
      i < position.count;
      i += 1
    ) {
      const x = position.getX(i);
      const y = position.getY(i);

      position.setZ(
        i,
        waveHeight(x, y, time, 1),
      );
    }

    position.needsUpdate = true;
    geometry.computeVertexNormals();
  });

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 4.05, 0]}
    >
      <meshPhysicalMaterial
        color="#0B426B"
        transparent
        opacity={0.82}
        roughness={0.16}
        metalness={0.05}
        clearcoat={0.9}
        clearcoatRoughness={0.12}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/* =========================================================
   OCEAN FRAME — crisp white outline around the whole volume
   ========================================================= */

function OceanFrame() {
  const geometry = useMemo(
    () => new THREE.BoxGeometry(7.8, 8, 7.8),
    [],
  );

  const edges = useMemo(
    () => new THREE.EdgesGeometry(geometry),
    [geometry],
  );

  return (
    <lineSegments geometry={edges}>
      <lineBasicMaterial
        color="#ffffff"
        transparent
        opacity={0.6}
      />
    </lineSegments>
  );
}

/* =========================================================
   SUBSURFACE WATER LAYERS (now flowing, not flat cards)
   ========================================================= */

interface LayerProps {
  point: TemperaturePoint;
  minTemp: number;
  maxTemp: number;
  maxDepth: number;
  selected: boolean;
  hovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onSelect: () => void;
  showUncertainty: boolean;
}

function WaterLayer({
  point,
  minTemp,
  maxTemp,
  maxDepth,
  selected,
  hovered,
  onHover,
  onLeave,
  onSelect,
  showUncertainty,
}: LayerProps) {
  const normalizedDepth =
    point.depth / Math.max(maxDepth, 1);

  const y =
    4 -
    normalizedDepth * 8;

  const color = temperatureColor(
    point.temperature,
    minTemp,
    maxTemp,
  );

  /*
   * Waves get gentler the deeper the layer sits, but never
   * fully flatten out - that's what makes each layer read as
   * "the same body of water", just further down.
   */
  const depthFactor = Math.max(
    0.12,
    1 - normalizedDepth,
  );

  const size =
    selected || hovered ? 7.7 : 7.55;

  const geometry = useMemo(
    () => new THREE.PlaneGeometry(size, size, 18, 18),
    [size],
  );

  useFrame(({ clock }) => {
    const position =
      geometry.attributes.position;

    const time =
      clock.getElapsedTime();

    for (
      let i = 0;
      i < position.count;
      i += 1
    ) {
      const x = position.getX(i);
      const localY = position.getY(i);

      position.setZ(
        i,
        waveHeight(
          x,
          localY,
          time,
          depthFactor,
        ),
      );
    }

    position.needsUpdate = true;
    geometry.computeVertexNormals();
  });

  return (
    <group>
      <mesh
        geometry={geometry}
        position={[0, y, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerEnter={(event) => {
          event.stopPropagation();
          onHover();
        }}
        onPointerLeave={(event) => {
          event.stopPropagation();
          onLeave();
        }}
        onClick={(event) => {
          event.stopPropagation();
          onSelect();
        }}
      >
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={
            selected
              ? 0.78
              : hovered
                ? 0.64
                : 0.42
          }
          roughness={0.25}
          metalness={0.02}
          transmission={0.08}
          clearcoat={0.35}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* =====================================================
          SELECTED / HOVERED HIGHLIGHT
          ===================================================== */}

      {(selected || hovered) && (
        <mesh
          position={[0, y, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry
            args={[
              3.70,
              selected ? 3.76 : 3.74,
              64,
            ]}
          />

          <meshBasicMaterial
            color={
              selected
                ? "#102A43"
                : "#ffffff"
            }
            transparent
            opacity={
              selected
                ? 0.8
                : 0.5
            }
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* =====================================================
          SELECTED CENTER MARKER
          ===================================================== */}

      {selected && (
        <mesh
          position={[0, y + 0.015, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry
            args={[0.08, 0.13, 24]}
          />

          <meshBasicMaterial
            color="#102A43"
            transparent
            opacity={0.9}
          />
        </mesh>
      )}

      {/* =====================================================
          UNCERTAINTY
          ===================================================== */}

      {showUncertainty && (
        <mesh
          position={[0, y, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry
            args={[
              7.9 +
                Math.min(
                  point.std * 0.04,
                  0.25,
                ),
              7.9 +
                Math.min(
                  point.std * 0.04,
                  0.25,
                ),
            ]}
          />

          <meshBasicMaterial
            color="#E8FBFF"
            transparent
            opacity={0.035}
            wireframe
            depthWrite={false}
          />
        </mesh>
      )}

      {/* =====================================================
          HOVER INFORMATION
          ===================================================== */}

      {hovered && (
        <Html
          position={[
            3.8,
            y,
            0,
          ]}
          center
          distanceFactor={8}
          style={{
            pointerEvents: "none",
          }}
        >
          <div className="w-[150px] rounded-xl border border-slate-200/80 bg-white/95 px-3 py-2.5 shadow-xl backdrop-blur-md">
            <div className="mb-1 text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Depth layer
            </div>

            <div className="flex items-baseline justify-between gap-3">
              <span className="font-mono text-lg font-bold text-slate-800">
                {point.depth}
                <span className="ml-0.5 text-[10px] font-normal">
                  m
                </span>
              </span>

              <span
                className="text-sm font-bold"
                style={{
                  color,
                }}
              >
                {point.temperature.toFixed(
                  2,
                )}
                °C
              </span>
            </div>

            {showUncertainty && (
              <div className="mt-1.5 border-t border-slate-100 pt-1.5 text-[9px] text-slate-500">
                ± {point.std.toFixed(2)}°C
                <span className="ml-1 text-slate-400">
                  model std.
                </span>
              </div>
            )}

            <div className="mt-2 text-[8px] font-semibold text-slate-400">
              Click to inspect layer
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

/* =========================================================
   TEMPERATURE VOLUME
   ========================================================= */

function TemperatureVolume({
  points,
  selectedDepth,
  setSelectedDepth,
  showUncertainty,
}: {
  points: TemperaturePoint[];
  selectedDepth: number;
  setSelectedDepth: (
    depth: number,
  ) => void;
  showUncertainty: boolean;
}) {
  const [hoveredDepth, setHoveredDepth] =
    useState<number | null>(null);

  const minTemp = Math.min(
    ...points.map(
      (point) => point.temperature,
    ),
  );

  const maxTemp = Math.max(
    ...points.map(
      (point) => point.temperature,
    ),
  );

  const maxDepth = Math.max(
    ...points.map(
      (point) => point.depth,
    ),
  );

  return (
    <group>
      {points.map((point) => (
        <WaterLayer
          key={point.depth}
          point={point}
          minTemp={minTemp}
          maxTemp={maxTemp}
          maxDepth={maxDepth}
          selected={
            point.depth ===
            selectedDepth
          }
          hovered={
            point.depth ===
            hoveredDepth
          }
          onHover={() =>
            setHoveredDepth(
              point.depth,
            )
          }
          onLeave={() =>
            setHoveredDepth(null)
          }
          onSelect={() =>
            setSelectedDepth(
              point.depth,
            )
          }
          showUncertainty={
            showUncertainty
          }
        />
      ))}
    </group>
  );
}

/* =========================================================
   LAYER CONNECTORS
   Faint flowing strands that stitch each layer to the next,
   sampled at the same wave field as the layers themselves -
   this is what sells "one connected body of water" instead
   of stacked discs.
   ========================================================= */

function LayerConnectors({
  points,
  maxDepth,
}: {
  points: TemperaturePoint[];
  maxDepth: number;
}) {
  const sorted = useMemo(
    () =>
      [...points].sort(
        (a, b) => a.depth - b.depth,
      ),
    [points],
  );

  const angles = useMemo(
    () =>
      [0, 60, 120, 180, 240, 300].map(
        (deg) => (deg * Math.PI) / 180,
      ),
    [],
  );

  const radius = 2.4;

  const segments = useMemo(() => {
    const list: {
      x: number;
      z: number;
      y1: number;
      depth1: number;
      y2: number;
      depth2: number;
    }[] = [];

    for (let i = 0; i < sorted.length - 1; i += 1) {
      const a = sorted[i];
      const b = sorted[i + 1];

      angles.forEach((angle) => {
        list.push({
          x: Math.cos(angle) * radius,
          z: Math.sin(angle) * radius,
          y1: 4 - (a.depth / Math.max(maxDepth, 1)) * 8,
          depth1: a.depth,
          y2: 4 - (b.depth / Math.max(maxDepth, 1)) * 8,
          depth2: b.depth,
        });
      });
    }

    return list;
  }, [sorted, angles, maxDepth]);

  const lineRefs = useRef<
    (THREE.Line | null)[]
  >([]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    segments.forEach((segment, index) => {
      const line = lineRefs.current[index];
      if (!line) return;

      const factor1 = Math.max(
        0.12,
        1 - segment.depth1 / Math.max(maxDepth, 1),
      );
      const factor2 = Math.max(
        0.12,
        1 - segment.depth2 / Math.max(maxDepth, 1),
      );

      const wave1 = waveHeight(
        segment.x,
        segment.z,
        time,
        factor1,
      );
      const wave2 = waveHeight(
        segment.x,
        segment.z,
        time,
        factor2,
      );

      const position =
        line.geometry.attributes
          .position as THREE.BufferAttribute;

      position.setXYZ(
        0,
        segment.x,
        segment.y1 + wave1,
        segment.z,
      );
      position.setXYZ(
        1,
        segment.x,
        segment.y2 + wave2,
        segment.z,
      );

      position.needsUpdate = true;
    });
  });

  return (
    <group>
      {segments.map((segment, index) => (
        <line
          key={index}
          ref={(element) => {
            lineRefs.current[index] = element;
          }}
        >
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(6), 3]}
            />
          </bufferGeometry>

          <lineBasicMaterial
            color="#8fe3ff"
            transparent
            opacity={0.16}
          />
        </line>
      ))}
    </group>
  );
}

/* =========================================================
   REALISTIC MARINE ASSETS
   Uses real GLB models instead of primitive spheres/cones.

   Fish: Khronos Barramundi Fish — CC0.
   Boat: CC0 fishing boat from 3DAssets.dev.

   Both are loaded through drei's useGLTF, which wraps the
   Three.js GLTFLoader. The models are normalized at runtime so
   their source dimensions do not affect the scene scale.
   ========================================================= */

const FISH_MODEL_URL =
  "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/BarramundiFish/glTF-Binary/BarramundiFish.glb";

const BOAT_MODEL_URL =
  "https://cdn.3dassets.dev/assets/19553/v1/model.glb";

interface FishSpec {
  depth: number;
  radius: number;
  speed: number;
  offset: number;
  scale: number;
  phase: number;
}

function normalizeModel(
  source: THREE.Object3D,
  targetSize: number,
  centerVertically = true,
) {
  const clone = source.clone(true);
  clone.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(clone);
  const size = box.getSize(new THREE.Vector3());
  const horizontalSize = Math.max(size.x, size.z, 0.001);
  const factor = targetSize / horizontalSize;

  clone.scale.setScalar(factor);
  clone.updateMatrixWorld(true);

  const scaledBox = new THREE.Box3().setFromObject(clone);
  const center = scaledBox.getCenter(new THREE.Vector3());

  clone.position.x -= center.x;
  clone.position.z -= center.z;

  if (centerVertically) {
    clone.position.y -= scaledBox.min.y;
  }

  clone.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;

    object.castShadow = true;
    object.receiveShadow = true;

    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];

    materials.forEach((material) => {
      if (
        material instanceof THREE.MeshStandardMaterial ||
        material instanceof THREE.MeshPhysicalMaterial
      ) {
        material.roughness = Math.min(material.roughness, 0.48);
        material.metalness = Math.min(material.metalness, 0.12);
      }
    });
  });

  return clone;
}

function RealisticFish({
  radius,
  depth,
  maxDepth,
  speed,
  offset,
  scale,
  phase,
}: FishSpec & { maxDepth: number }) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(FISH_MODEL_URL);

  const fish = useMemo(
    () => normalizeModel(scene, 0.58 * scale),
    [scene, scale],
  );

  const baseY =
    4 - (depth / Math.max(maxDepth, 1)) * 8;

  useFrame(({ clock }) => {
    if (!group.current) return;

    const t = clock.getElapsedTime() * speed + offset;
    const x = Math.cos(t) * radius;
    const z = Math.sin(t) * radius;

    group.current.position.set(
      x,
      baseY + Math.sin(t * 2.1 + phase) * 0.1,
      z,
    );

    group.current.rotation.y = -t + Math.PI / 2;
    group.current.rotation.z =
      Math.sin(t * 2.2 + phase) * 0.055;
    group.current.rotation.x =
      Math.cos(t * 1.7 + phase) * 0.025;
  });

  return (
    <group ref={group}>
            <primitive
            object={fish}
            rotation={[0, -Math.PI / 2, 0]}
            />
    </group>
  );
}

function FishSchool({
  maxDepth,
}: {
  maxDepth: number;
}) {
  const fishes: FishSpec[] = useMemo(
    () => [
      { depth: maxDepth * 0.08, radius: 2.0, speed: 0.27, offset: 0.0, scale: 1.05, phase: 0.0 },
      { depth: maxDepth * 0.09, radius: 2.55, speed: 0.23, offset: 1.6, scale: 0.82, phase: 1.4 },
      { depth: maxDepth * 0.18, radius: 2.85, speed: 0.21, offset: 3.0, scale: 0.9, phase: 2.3 },
      { depth: maxDepth * 0.22, radius: 1.75, speed: 0.32, offset: 4.4, scale: 0.72, phase: 3.2 },
      { depth: maxDepth * 0.31, radius: 2.45, speed: 0.18, offset: 2.1, scale: 1.18, phase: 4.1 },
      { depth: maxDepth * 0.36, radius: 3.05, speed: 0.2, offset: 5.2, scale: 0.78, phase: 5.0 },
      { depth: maxDepth * 0.45, radius: 2.0, speed: 0.16, offset: 3.8, scale: 0.92, phase: 1.9 },
    ],
    [maxDepth],
  );

  return (
    <group>
      {fishes.map((fish, index) => (
        <RealisticFish
          key={index}
          {...fish}
          maxDepth={maxDepth}
        />
      ))}
    </group>
  );
}

/* =========================================================
   REALISTIC BOAT
   A real GLB fishing boat floats on the same wave field as the
   ocean surface. Its source dimensions are normalized so it
   remains correctly sized inside the reconstruction volume.
   ========================================================= */

function Boat() {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(BOAT_MODEL_URL);

  const boat = useMemo(
    () => normalizeModel(scene, 2.15, true),
    [scene],
  );

  const x = 1.25;
  const z = 0.45;

  useFrame(({ clock }) => {
    if (!group.current) return;

    const time = clock.getElapsedTime();
    const wave = waveHeight(x, z, time, 1);

    group.current.position.set(
      x,
      4.04 + wave + 0.015,
      z,
    );

    group.current.rotation.z =
      Math.sin(time * 1.05) * 0.035;
    group.current.rotation.x =
      Math.cos(time * 0.82) * 0.025;
    group.current.rotation.y =
      Math.PI * 0.08 + Math.sin(time * 0.3) * 0.025;
  });

  return (
    <group ref={group}>
      <primitive
        object={boat}
        rotation={[0, Math.PI, 0]}
      />

      <mesh
        position={[0, -0.015, 0.72]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[0.9, 1.55, 1]}
      >
        <planeGeometry args={[0.65, 0.18, 1, 1]} />
        <meshBasicMaterial
          color="#E9FBFF"
          transparent
          opacity={0.13}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

useGLTF.preload(FISH_MODEL_URL);
useGLTF.preload(BOAT_MODEL_URL);

/* =========================================================
   DEPTH LABELS
   ========================================================= */

function DepthLabels({
  maxDepth,
}: {
  maxDepth: number;
}) {
  const labels = [
    0,
    maxDepth * 0.25,
    maxDepth * 0.5,
    maxDepth * 0.75,
    maxDepth,
  ];

  return (
    <group>
      {labels.map((depth) => {
        const roundedDepth =
          Math.round(depth);

        const y =
          4 -
          (depth /
            Math.max(
              maxDepth,
              1,
            )) *
            8;

        return (
          <group
            key={roundedDepth}
          >
            <Text
              position={[
                -4.45,
                y,
                0,
              ]}
              fontSize={0.23}
              color="#102A43"
              anchorX="right"
              anchorY="middle"
              outlineWidth={0.012}
              outlineColor="#ffffff"
            >
              {roundedDepth} m
            </Text>

            <mesh
              position={[
                -4.0,
                y,
                0,
              ]}
              rotation={[
                0,
                0,
                Math.PI / 2,
              ]}
            >
              <boxGeometry
                args={[
                  0.35,
                  0.018,
                  0.018,
                ]}
              />

              <meshBasicMaterial
                color="#102A43"
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* =========================================================
   SUBTLE WATER PARTICLES
   ========================================================= */

function WaterParticles({
  maxDepth,
}: {
  maxDepth: number;
}) {
  const points = useMemo(() => {
    const positions: number[] = [];

    for (let i = 0; i < 90; i++) {
      positions.push(
        (Math.random() - 0.5) * 7.3,
        4 -
          Math.random() *
            8,
        (Math.random() - 0.5) * 7.3,
      );
    }

    return new Float32Array(
      positions,
    );
  }, []);

  const particles =
    useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    if (!particles.current)
      return;

    particles.current.rotation.y =
      clock.getElapsedTime() *
      0.012;
  });

  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[
            points,
            3,
            false,
          ]}
        />
      </bufferGeometry>

      <pointsMaterial
        color="#ffffff"
        size={0.025}
        transparent
        opacity={0.16}
        sizeAttenuation
      />
    </points>
  );
}

/* =========================================================
   MAIN OCEAN SCENE
   ========================================================= */

function OceanScene({
  points,
  selectedDepth,
  setSelectedDepth,
  showUncertainty,
}: {
  points: TemperaturePoint[];
  selectedDepth: number;
  setSelectedDepth: (
    depth: number,
  ) => void;
  showUncertainty: boolean;
}) {
  const maxDepth = Math.max(
    ...points.map(
      (point) => point.depth,
    ),
  );

  return (
    <>
      <ambientLight intensity={1.45} />

      <directionalLight
        position={[5, 10, 6]}
        intensity={2}
      />

      <directionalLight
        position={[-5, 4, -4]}
        intensity={0.75}
        color="#55D8FF"
      />

      <TemperatureVolume
        points={points}
        selectedDepth={
          selectedDepth
        }
        setSelectedDepth={
          setSelectedDepth
        }
        showUncertainty={
          showUncertainty
        }
      />

      <LayerConnectors
        points={points}
        maxDepth={maxDepth}
      />

      <WaterParticles
        maxDepth={maxDepth}
      />

      <FishSchool maxDepth={maxDepth} />

      <OceanSurface />

      <OceanFrame />

      <Boat />

      <DepthLabels
        maxDepth={maxDepth}
      />

      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.07}
        minDistance={7}
        maxDistance={18}
        minPolarAngle={0.65}
        maxPolarAngle={2.25}
        autoRotate
        autoRotateSpeed={0.28}
      />
    </>
  );
}

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export function TemperatureCubeScene({
  points,
  showUncertainty = false,
}: Props) {
  const [selectedDepth, setSelectedDepth] =
    useState(
      points[
        Math.floor(
          points.length / 2,
        )
      ]?.depth ??
        points[0]?.depth ??
        0,
    );

  const selected =
    points.find(
      (point) =>
        point.depth ===
        selectedDepth,
    ) ??
    points[0];

  const minTemperature =
    Math.min(
      ...points.map(
        (point) =>
          point.temperature,
      ),
    );

  const maxTemperature =
    Math.max(
      ...points.map(
        (point) =>
          point.temperature,
      ),
    );

  const maxDepth = Math.max(
    ...points.map(
      (point) => point.depth,
    ),
  );

  if (!points.length) {
    return (
      <div className="flex h-[560px] min-h-[480px] items-center justify-center rounded-2xl border border-slate-200 bg-[#E8F5F7]">
        <span className="text-sm text-slate-500">
          No reconstruction data
          available.
        </span>
      </div>
    );
  }

return (
  <div className="relative h-full min-h-0 w-full overflow-hidden rounded-2xl border border-slate-200/60 bg-[radial-gradient(circle_at_50%_15%,#ffffff,#dff2f5_55%,#c9e8ed)] shadow-[inset_0_0_0_1px_rgba(16,42,67,0.04)]">

    {/* ===================================================
        SELECTED DEPTH READOUT
        =================================================== */}

    {selected && (

      <div className="pointer-events-none absolute right-5 top-5 z-20 min-w-[145px] rounded-xl border border-slate-200/80 bg-white/90 px-3.5 py-3 shadow-lg backdrop-blur-md">

        <div className="text-[8px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Selected depth
        </div>

        <div className="mt-0.5 flex items-baseline gap-1">

          <span className="font-mono text-[28px] font-bold leading-none tracking-tight text-[#102F46]">
            {selected.depth}
          </span>

          <span className="text-[11px] text-slate-500">
            m
          </span>

        </div>

        <div className="mt-1.5 flex items-center gap-1.5">

          <span
            className="h-2 w-2 rounded-full ring-2 ring-white"
            style={{
              backgroundColor:
                temperatureColor(
                  selected.temperature,
                  minTemperature,
                  maxTemperature,
                ),
            }}
          />

          <span className="text-[11px] font-semibold text-slate-600">
            {selected.temperature.toFixed(2)}
            °C
          </span>

        </div>

        {showUncertainty && selected.std !== undefined && (

          <div className="mt-1 text-[9px] text-slate-400">
            ±{" "}
            {selected.std.toFixed(2)}
            °C uncertainty
          </div>

        )}

      </div>

    )}

    {/* ===================================================
        DEPTH RANGE
        =================================================== */}

    <div className="pointer-events-none absolute bottom-4 left-5 z-20 flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-[8px] font-semibold text-slate-500 shadow-sm backdrop-blur-md">

      <span>5 m</span>

      <span className="h-1 w-1 rounded-full bg-slate-300" />

      <span>
        {maxDepth} m
      </span>

      <span className="ml-1 text-slate-400">
        depth profile
      </span>

    </div>

    {/* ===================================================
        INTERACTION HINT
        =================================================== */}

    <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-[8px] font-semibold text-slate-500 shadow-sm backdrop-blur-md">

      Drag to explore · Scroll to zoom · Click a layer

    </div>

    {/* ===================================================
        CANVAS
        =================================================== */}

    <Canvas
      className="!h-full !w-full"
      camera={{
        position: [
          9,
          5.8,
          10,
        ],
        fov: 44,
      }}
      dpr={[1, 1.75]}
      gl={{
        antialias: true,
        powerPreference:
          "high-performance",
        alpha: true,
      }}
    >

      <color
        attach="background"
        args={[
          "#E8F5F7",
        ]}
      />

      <fog
        attach="fog"
        args={[
          "#E8F5F7",
          15,
          30,
        ]}
      />

      <OceanScene
        points={points}
        selectedDepth={
          selectedDepth
        }
        setSelectedDepth={
          setSelectedDepth
        }
        showUncertainty={
          showUncertainty
        }
      />

    </Canvas>

    {/* ===================================================
        SMALL PROFILE INFO
        =================================================== */}

    <div className="pointer-events-none absolute bottom-4 right-5 z-20 hidden rounded-lg border border-white/70 bg-white/65 px-2.5 py-1.5 text-right backdrop-blur-sm sm:block">

      <div className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">
        Reconstruction
      </div>

      <div className="mt-0.5 text-[9px] font-semibold text-slate-600">
        {points.length} depth levels
      </div>

    </div>

  </div>
);
}