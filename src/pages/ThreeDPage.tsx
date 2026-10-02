import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { Play, Pause, RotateCcw } from 'lucide-react';

// The Cost Function: J(w1, w2) = w1^2 + w2^2
const costFunction = (w1: number, w2: number) => {
  return w1 * w1 + w2 * w2;
};

// Gradient: [dJ/dw1, dJ/dw2] = [2*w1, 2*w2]
const gradientFunction = (w1: number, w2: number) => {
  return [2 * w1, 2 * w2];
};

const Surface = () => {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(10, 10, 50, 50);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const w1 = pos.getX(i);
      const w2 = pos.getY(i);
      // z in PlaneGeometry is mapped to height (Y in 3D scene after rotation)
      // but we'll keep PlaneGeometry flat and rotate the mesh.
      // So z here is actually local z.
      const z = costFunction(w1, w2) * 0.1; // scale down height
      pos.setZ(i, z);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial 
        color="#8b5cf6" 
        wireframe={true} 
        transparent 
        opacity={0.3}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

const GradientDescentVisualization = ({ isPlaying, lr, resetTrigger }: { isPlaying: boolean, lr: number, resetTrigger: number }) => {
  const START_W1 = 4;
  const START_W2 = 3;
  
  const [w1, setW1] = useState(START_W1);
  const [w2, setW2] = useState(START_W2);
  const [path, setPath] = useState<THREE.Vector3[]>([]);
  const meshRef = useRef<THREE.Mesh>(null);

  // Reset logic
  useEffect(() => {
    setW1(START_W1);
    setW2(START_W2);
    setPath([new THREE.Vector3(START_W1, costFunction(START_W1, START_W2) * 0.1 - 2, START_W2)]);
  }, [resetTrigger]);

  useFrame(() => {
    if (isPlaying) {
      const [gw1, gw2] = gradientFunction(w1, w2);
      
      // Stop if converged
      if (Math.abs(gw1) < 0.01 && Math.abs(gw2) < 0.01) return;

      const nextW1 = w1 - lr * gw1;
      const nextW2 = w2 - lr * gw2;
      
      setW1(nextW1);
      setW2(nextW2);
      
      const newPos = new THREE.Vector3(nextW1, costFunction(nextW1, nextW2) * 0.1 - 2, nextW2);
      setPath(prev => [...prev, newPos]);
    }
  });

  const pathGeometry = useMemo(() => {
    if (path.length < 2) return null;
    return new THREE.BufferGeometry().setFromPoints(path);
  }, [path]);

  return (
    <group>
      {/* Current Particle */}
      <mesh position={[w1, costFunction(w1, w2) * 0.1 - 2, w2]} ref={meshRef}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Minimum Glow */}
      <mesh position={[0, -2, 0]}>
        <circleGeometry args={[0.5, 32]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.5} rotation={[-Math.PI/2, 0, 0]} />
      </mesh>

      {/* Path */}
      {pathGeometry && (
        <line>
          <primitive object={pathGeometry} attach="geometry" />
          <lineBasicMaterial color="#3b82f6" linewidth={3} />
        </line>
      )}
    </group>
  );
};

export default function ThreeDPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [lr, setLr] = useState(0.05);
  const [resetTrigger, setResetTrigger] = useState(0);

  const reset = () => {
    setIsPlaying(false);
    setResetTrigger(prev => prev + 1);
  };

  return (
    <div className="w-full h-full p-8 flex flex-col items-center pt-24 overflow-hidden relative">
      <div className="mb-4 text-center z-10 pointer-events-none">
        <h1 className="text-4xl font-bold mb-4">Convergence in 3D</h1>
        <p className="text-gray-400 max-w-2xl text-lg">
          Rotate and zoom the camera to explore the 3D Cost Function <span className="text-secondary font-mono">J(w₁, w₂)</span>. Watch the particle converge to the global minimum.
        </p>
      </div>

      <div className="absolute inset-0 w-full h-full pt-32 pb-24 z-0">
        <Canvas camera={{ position: [8, 6, 8], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[0, 5, 0]} intensity={2} color="#8b5cf6" />
          
          <Surface />
          <GradientDescentVisualization isPlaying={isPlaying} lr={lr} resetTrigger={resetTrigger} />
          
          <OrbitControls 
            enablePan={false} 
            maxPolarAngle={Math.PI / 2 + 0.1} 
            minDistance={5} 
            maxDistance={20} 
            autoRotate={!isPlaying}
            autoRotateSpeed={0.5}
          />
        </Canvas>
      </div>

      {/* Floating Controls */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-surface/80 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl z-10 flex flex-col md:flex-row items-center gap-6 min-w-[300px]">
        <div className="flex gap-4">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors shadow-lg shadow-primary/30"
          >
            {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
          </button>
          <button 
            onClick={reset}
            className="w-12 h-12 rounded-full bg-surface border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <RotateCcw size={20} />
          </button>
        </div>
        
        <div className="flex-1 w-full md:w-64">
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-gray-400">Learning Rate</label>
            <span className="text-sm font-bold text-accent font-mono">{lr.toFixed(3)}</span>
          </div>
          <input 
            type="range" 
            min="0.005" 
            max="0.2" 
            step="0.005" 
            value={lr} 
            onChange={(e) => {
              setLr(parseFloat(e.target.value));
              reset(); // Usually we want to restart if lr changes in 3D to see full effect
            }}
            className="w-full accent-accent"
          />
        </div>
      </div>
    </div>
  );
}
