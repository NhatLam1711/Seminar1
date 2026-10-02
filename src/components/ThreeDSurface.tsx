import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

interface ThreeDSurfaceProps {
  path: { w1: number; w2: number }[];
  isPlaying: boolean;
}

const costFunction = (w1: number, w2: number) => {
  return 0.5 * (w1 * w1 * 1 + w2 * w2 * 4); // J = 0.5 * w1^2 + 2 * w2^2
};

const Surface = () => {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(20, 20, 40, 40);
    const pos = geo.attributes.position;
    const colors = [];
    
    let minZ = 0;
    let maxZ = costFunction(10, 10) * 0.05; 
    
    for (let i = 0; i < pos.count; i++) {
      const w1 = pos.getX(i);
      const w2 = pos.getY(i);
      const z = costFunction(w1, w2) * 0.05;
      pos.setZ(i, z);
    }
    
    for (let i = 0; i < pos.count; i++) {
      const z = pos.getZ(i);
      const t = Math.max(0, Math.min(1, (z - minZ) / (maxZ - minZ)));
      // Map t=0 to Blue (0.66), t=1 to Red (0.0)
      const color = new THREE.Color().setHSL((1 - t) * 0.66, 1.0, 0.5);
      colors.push(color.r, color.g, color.b);
    }
    
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <mesh geometry={geometry}>
        <meshStandardMaterial vertexColors={true} side={THREE.DoubleSide} transparent opacity={0.9} />
      </mesh>
      <mesh geometry={geometry}>
        <meshBasicMaterial color="#000000" wireframe={true} transparent opacity={0.15} />
      </mesh>
    </group>
  );
};

const Axes = () => {
  const ticksX = [-10, -5, 0, 5, 10];
  const ticksZ = [-10, -5, 0, 5, 10];
  const maxH = costFunction(10, 10) * 0.05;

  return (
    <group position={[0, -2, 0]}>
      {/* Box lines for axes (Matplotlib style) */}
      <line>
        <bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-10, 0, 10), new THREE.Vector3(10, 0, 10),
          new THREE.Vector3(10, 0, 10), new THREE.Vector3(10, 0, -10),
          new THREE.Vector3(-10, 0, 10), new THREE.Vector3(-10, maxH, 10)
        ])} />
        <lineBasicMaterial color="#ffffff" opacity={0.5} transparent />
      </line>

      {/* X Axis (w) */}
      <Text position={[0, -1, 11]} fontSize={0.8} color="white">w</Text>
      {ticksX.map(t => (
        <group key={`x-${t}`} position={[t, 0, 10]}>
          <line>
            <bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -0.2, 0.2)
            ])} />
            <lineBasicMaterial color="#ffffff" />
          </line>
          <Text position={[0, -0.6, 0.5]} fontSize={0.5} color="white">{t}</Text>
        </group>
      ))}

      {/* Z Axis (b) */}
      <Text position={[12, -1, 0]} fontSize={0.8} color="white">b</Text>
      {ticksZ.map(t => (
        <group key={`z-${t}`} position={[10, 0, t]}>
          <line>
            <bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.2, -0.2, 0)
            ])} />
            <lineBasicMaterial color="#ffffff" />
          </line>
          <Text position={[0.8, -0.6, 0]} fontSize={0.5} color="white">{t}</Text>
        </group>
      ))}

      {/* Y Axis (J(w,b)) */}
      <Text position={[-11, maxH / 2, 10]} fontSize={0.8} color="white" rotation={[0, 0, Math.PI/2]}>J(w, b)</Text>
      {[0, maxH/2, maxH].map((t, i) => {
        const val = i === 0 ? 0 : i === 1 ? (maxH/0.05)/2 : (maxH/0.05);
        return (
          <group key={`y-${t}`} position={[-10, t, 10]}>
            <line>
              <bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0, 0), new THREE.Vector3(-0.2, 0, 0.2)
              ])} />
              <lineBasicMaterial color="#ffffff" />
            </line>
            <Text position={[-1.2, 0, 0.5]} fontSize={0.5} color="white">{val.toFixed(0)}</Text>
          </group>
        );
      })}
    </group>
  );
};

export default function ThreeDSurface({ path, isPlaying }: ThreeDSurfaceProps) {
  const current = path[path.length - 1];

  const pathGeometry = useMemo(() => {
    if (path.length < 2) return null;
    const points = path.map(p => new THREE.Vector3(p.w1, costFunction(p.w1, p.w2) * 0.05 - 2, p.w2));
    // Elevate path slightly so it doesn't z-fight with surface
    points.forEach(p => p.y += 0.1);
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [path]);

  return (
    <div className="w-full h-full relative bg-[#111] rounded-xl overflow-hidden shadow-inner border border-white/10">
      <Canvas camera={{ position: [15, 12, 18], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 20, 10]} intensity={1.5} />
        
        <Surface />
        <Axes />
        
        {/* Minimum Glow */}
        <mesh position={[0, -1.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.8, 32]} />
          <meshBasicMaterial color="#10b981" transparent opacity={0.8} />
        </mesh>

        {/* Path Line */}
        {pathGeometry && (
          <line>
            <primitive object={pathGeometry} attach="geometry" />
            <lineBasicMaterial color="#000000" linewidth={4} />
          </line>
        )}

        {/* Current Particle */}
        {current && (
          <mesh position={[current.w1, costFunction(current.w1, current.w2) * 0.05 - 1.9, current.w2]}>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={0.2} />
          </mesh>
        )}

        <OrbitControls 
          enablePan={true} 
          maxPolarAngle={Math.PI / 2} 
          minDistance={10} 
          maxDistance={40} 
          autoRotate={!isPlaying}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
