import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, StepForward, RotateCcw } from 'lucide-react';

const GraphPoints = () => {
  const points = [];
  for(let w = 0; w <= 4; w += 0.1) {
    const cost = 5.5 * Math.pow(w - 2, 2);
    points.push(`${w * 25},${100 - cost * 2}`);
  }
  return points.join(' ');
};

export default function GradientDescentPage() {
  const START_W = 0.2;
  const [w, setW] = useState(START_W);
  const [lr, setLr] = useState(0.05);
  const [iteration, setIteration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [history, setHistory] = useState<{w: number, cost: number}[]>([{w: START_W, cost: 5.5 * Math.pow(START_W - 2, 2)}]);
  
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const cost = 5.5 * Math.pow(w - 2, 2);
  const gradient = 11 * (w - 2);

  const step = () => {
    setW(prevW => {
      const grad = 11 * (prevW - 2);
      const nextW = prevW - lr * grad;
      
      setHistory(prev => [...prev, { w: nextW, cost: 5.5 * Math.pow(nextW - 2, 2) }]);
      setIteration(i => i + 1);
      
      return nextW;
    });
  };

  const animate = (time: number) => {
    if (time - lastTimeRef.current > 500) { // 500ms per step
      step();
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
  }, [isPlaying, lr]); // re-bind when lr changes

  // Stop if converged
  useEffect(() => {
    if (Math.abs(gradient) < 0.01 && isPlaying) {
      setIsPlaying(false);
    }
  }, [w, gradient, isPlaying]);

  const reset = () => {
    setIsPlaying(false);
    setW(START_W);
    setIteration(0);
    setHistory([{w: START_W, cost: 5.5 * Math.pow(START_W - 2, 2)}]);
  };

  return (
    <div className="w-full h-full p-8 flex flex-col items-center pt-24 overflow-y-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Gradient Descent</h1>
        <p className="text-gray-400 max-w-2xl text-lg">
          Watch the particle automatically move towards the minimum using the update rule. Adjust the learning rate <span className="text-accent font-mono">α</span> to see how it affects convergence.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl flex-1 min-h-[400px]">
        {/* Main Chart */}
        <div className="flex-[2] bg-surface rounded-xl border border-white/10 p-6 flex flex-col relative overflow-hidden shadow-2xl">
          <div className="absolute top-6 left-6 bg-black/60 p-4 rounded-lg border border-white/10 z-10 backdrop-blur-sm">
            <div className="font-mono space-y-2">
              <div className="text-gray-400 text-sm">Update Rule:</div>
              <div className="text-lg">w ← w - α <span className="text-accent">∇J</span></div>
              <div className="mt-4 pt-4 border-t border-white/10">
                Iteration: <span className="text-white">{iteration}</span>
              </div>
              <div>w = <span className="text-primary">{w.toFixed(4)}</span></div>
              <div>J(w) = <span className="text-secondary">{cost.toFixed(4)}</span></div>
              <div>∇J = <span className="text-accent">{gradient.toFixed(4)}</span></div>
            </div>
          </div>

          <div className="flex-1 relative w-full h-full mt-4">
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              {/* Grid */}
              <g stroke="rgba(255,255,255,0.1)" strokeWidth="0.5">
                {[0, 20, 40, 60, 80, 100].map(i => (
                  <React.Fragment key={i}>
                    <line x1="0" y1={i} x2="100" y2={i} />
                    <line x1={i} y1="0" x2={i} y2="100" />
                  </React.Fragment>
                ))}
              </g>
              
              {/* Axes */}
              <line x1="0" y1="100" x2="100" y2="100" stroke="white" strokeWidth="1" />
              
              {/* Cost Curve */}
              <polyline 
                points={GraphPoints()} 
                fill="none" 
                stroke="#8b5cf6" 
                strokeWidth="1.5" 
                opacity="0.5"
              />

              {/* History Lines */}
              {history.length > 1 && (
                <polyline 
                  points={history.map(h => `${h.w * 25},${100 - h.cost * 2}`).join(' ')} 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="1" 
                  strokeDasharray="2,2"
                />
              )}

              {/* History Points */}
              {history.map((h, i) => (
                <circle 
                  key={i} 
                  cx={h.w * 25} 
                  cy={100 - h.cost * 2} 
                  r="1.5" 
                  fill={i === history.length - 1 ? "#f43f5e" : "#3b82f6"} 
                  opacity={i === history.length - 1 ? 1 : Math.max(0.2, i / history.length)}
                />
              ))}

              {/* Vector arrow indicating direction of descent */}
              {Math.abs(gradient) > 0.01 && (
                <g transform={`translate(${w * 25}, ${100 - cost * 2})`} style={{ transition: 'all 0.3s ease-out' }}>
                  <line 
                    x1="0" y1="0" 
                    x2={-gradient * lr * 25} y2="0" 
                    stroke="#10b981" 
                    strokeWidth="1.5" 
                    markerEnd="url(#arrowhead-gd)"
                  />
                </g>
              )}

              <defs>
                <marker id="arrowhead-gd" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
                </marker>
              </defs>
            </svg>
          </div>
        </div>

        {/* Controls Sidebar */}
        <div className="flex-1 bg-surface rounded-xl border border-white/10 p-6 flex flex-col shadow-2xl">
          <h3 className="text-xl font-bold mb-6">Controls</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="py-3 rounded-lg bg-primary hover:bg-primary/80 transition-colors flex items-center justify-center font-semibold"
            >
              {isPlaying ? <><Pause className="mr-2" size={20} /> Pause</> : <><Play className="mr-2" size={20} /> Play</>}
            </button>
            <button 
              onClick={step}
              disabled={isPlaying}
              className="py-3 rounded-lg bg-surface border border-white/20 hover:bg-white/10 transition-colors flex items-center justify-center disabled:opacity-50"
            >
              <StepForward className="mr-2" size={20} /> Step
            </button>
            <button 
              onClick={reset}
              className="py-3 rounded-lg bg-surface border border-white/20 hover:bg-white/10 transition-colors flex items-center justify-center col-span-2"
            >
              <RotateCcw className="mr-2" size={20} /> Restart
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Learning Rate (α) = <span className="text-accent font-mono">{lr.toFixed(3)}</span>
            </label>
            <input 
              type="range" 
              min="0.001" 
              max="0.18" 
              step="0.001" 
              value={lr} 
              onChange={(e) => {
                setLr(parseFloat(e.target.value));
                if (iteration === 0) reset(); // Reset if we haven't started to see effect from beginning
              }}
              className="w-full accent-accent"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Too small (Slow)</span>
              <span>Too large (Diverge)</span>
            </div>
          </div>
          
          <div className="mt-auto p-4 bg-primary/10 rounded-lg border border-primary/20 text-sm">
            <p className="text-primary font-semibold mb-1">Observation</p>
            <p className="text-gray-300">
              {lr > 0.16 ? "Learning rate is too high, causing overshoot and divergence!" :
               lr > 0.08 ? "High learning rate causes oscillation before convergence." :
               lr < 0.01 ? "Learning rate is very small, convergence will be slow." :
               "Optimal learning rate for smooth convergence."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
