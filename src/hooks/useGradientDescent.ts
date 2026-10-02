import { useState, useEffect, useRef, useMemo } from 'react';

// Shared dataset for all 3 algorithms to ensure fair comparison
const DATA_SIZE = 200;
const DATASET = Array.from({ length: DATA_SIZE }).map((_, i) => {
  // Use a pseudo-random generator for consistent data
  const seed = i * 1337;
  const rand = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };
  
  // x1 has variance 1
  const x1 = (rand(seed) + rand(seed+1) + rand(seed+2) - 1.5) * 2; 
  // x2 has variance 0.25 (so 2x2^2 has different contour scale)
  const x2 = (rand(seed+3) + rand(seed+4) + rand(seed+5) - 1.5) * 4;
  
  // Target is origin (0,0) with NOISE so SGD bounces at minimum!
  const noise = (rand(seed+6) - 0.5) * 6; 
  const y = noise; 
  
  return { x1, x2, y };
}).sort((a, b) => a.x1 - b.x1); // Sort by x1 to make "No Shuffle" fail spectacularly

export function useGradientDescent(batchSize: number, learningRate: number, isShuffle: boolean = true, initialW1 = 7, initialW2 = -6) {
  const [w1, setW1] = useState(initialW1);
  const [w2, setW2] = useState(initialW2);
  const [path, setPath] = useState<{w1: number, w2: number}[]>([{w1: initialW1, w2: initialW2}]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [iteration, setIteration] = useState(0);
  
  // For sequential reading
  const currentIndexRef = useRef(0);

  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // Let's refactor to object state to avoid race conditions
  const updateStep = () => {
    setPath(prevPath => {
      const current = prevPath[prevPath.length - 1];
      
      let gradW1 = 0;
      let gradW2 = 0;
      
      const indices = [];
      if (batchSize === DATA_SIZE) {
        for(let i=0; i<DATA_SIZE; i++) indices.push(i);
      } else {
        if (isShuffle) {
          // Shuffle: Pick random indices (sampling with replacement)
          for(let i=0; i<batchSize; i++) {
            indices.push(Math.floor(Math.random() * DATA_SIZE));
          }
        } else {
          // No Shuffle: Sequential reading
          for(let i=0; i<batchSize; i++) {
            indices.push((currentIndexRef.current + i) % DATA_SIZE);
          }
          currentIndexRef.current = (currentIndexRef.current + batchSize) % DATA_SIZE;
        }
      }

      for(let i of indices) {
        const { x1, x2, y } = DATASET[i];
        const pred = current.w1 * x1 + current.w2 * x2;
        const error = pred - y;
        gradW1 += error * x1;
        gradW2 += error * x2;
      }

      gradW1 /= batchSize;
      gradW2 /= batchSize;

      const nextW1 = current.w1 - learningRate * gradW1;
      const nextW2 = current.w2 - learningRate * gradW2;

      setIteration(i => i + 1);
      
      // Stop if converged (Only for Batch GD, as SGD never truly converges with noise)
      if (Math.abs(nextW1) < 0.05 && Math.abs(nextW2) < 0.05 && batchSize === DATA_SIZE) {
        setIsPlaying(false);
      }

      return [...prevPath, { w1: nextW1, w2: nextW2 }];
    });
  };

  const animate = (time: number) => {
    if (time - lastTimeRef.current > (batchSize === 1 ? 20 : 100)) { // SGD runs faster visually
      updateStep();
      lastTimeRef.current = time;
    }
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame(animate);
    } else if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, learningRate, batchSize]);

  const reset = () => {
    setIsPlaying(false);
    setIteration(0);
    setPath([{w1: initialW1, w2: initialW2}]);
  };

  return {
    path,
    isPlaying,
    setIsPlaying,
    iteration,
    reset,
    step: updateStep,
    DATA_SIZE
  };
}
