import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function CostFunctionPage() {
  const [w, setW] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const requestRef = useRef<number>();

  // Generate 50 data points around true_w = 2.5
  const DATA_POINTS = useMemo(() => {
    const points = [];
    let seed = 42;
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };
    
    for (let i = 0; i < 50; i++) {
      const x = random() * 10;
      const noise = (random() - 0.5) * 4;
      const y = 2.5 * x + noise;
      points.push({ x, y });
    }
    return points.sort((a, b) => a.x - b.x);
  }, []);

  const calculateCost = (weight: number) => {
    let sum = 0;
    for (const p of DATA_POINTS) {
      const pred = weight * p.x;
      sum += Math.pow(pred - p.y, 2);
    }
    return sum / (2 * DATA_POINTS.length);
  };

  const currentCost = calculateCost(w);
  const maxCost = useMemo(() => calculateCost(0), [DATA_POINTS]);

  // Generate history dynamically up to current w
  const history = useMemo(() => {
    const pts = [];
    for (let curr = 0; curr <= w; curr += 0.05) {
      pts.push({ w: curr, cost: calculateCost(curr) });
    }
    if (w % 0.05 !== 0) {
      pts.push({ w, cost: currentCost });
    }
    return pts.sort((a, b) => a.w - b.w);
  }, [w, currentCost, DATA_POINTS]);

  const animate = () => {
    setW(prev => {
      let nextW = prev + 0.02;
      if (nextW > 5) {
        setIsPlaying(false);
        return 5;
      }
      return nextW;
    });
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    } else if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying]);

  return (
    <div className="w-full h-full p-8 flex flex-col items-center pt-24 overflow-y-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Generating the Cost Function</h1>
        <p className="text-gray-400 max-w-2xl text-lg">
          Adjust the parameter <span className="text-primary font-mono bg-primary/10 px-2 py-1 rounded">w</span> to fit the line to the dataset and observe how the Cost Function <span className="text-secondary font-mono bg-secondary/10 px-2 py-1 rounded">J(w)</span> takes the shape of a smooth bowl.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl flex-1 min-h-[400px]">
        {/* Model Chart */}
        <div className="flex-1 bg-[#111] rounded-xl border border-white/10 p-6 flex flex-col relative overflow-hidden shadow-2xl">
          <h2 className="text-xl font-semibold mb-4 text-primary text-center">Model Prediction: y = wx</h2>
          <div className="flex-1 relative w-full h-full">
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-hidden" preserveAspectRatio="none">
              {/* Grid */}
              <g stroke="rgba(255,255,255,0.1)" strokeWidth="0.5">
                {[10, 30, 50, 70, 90].map(y => <line key={`hy-${y}`} x1="10" y1={y} x2="100" y2={y} />)}
                {[10, 30, 50, 70, 90].map(x => <line key={`hx-${x}`} x1={x} y1="0" x2={x} y2="90" />)}
              </g>
              
              {/* Axes */}
              <line x1="10" y1="90" x2="100" y2="90" stroke="white" strokeWidth="1" />
              <line x1="10" y1="90" x2="10" y2="0" stroke="white" strokeWidth="1" />
              
              {/* Axis Labels */}
              <text x="55" y="98" fill="#aaa" fontSize="4" textAnchor="middle">x</text>
              <text x="3" y="45" fill="#aaa" fontSize="4" textAnchor="middle" transform="rotate(-90 3 45)">y</text>
              
              {/* Ticks X */}
              {[2, 4, 6, 8, 10].map(val => (
                <text key={`tx-${val}`} x={10 + val * 9} y="95" fill="#aaa" fontSize="3" textAnchor="middle">{val}</text>
              ))}
              {/* Ticks Y (approx max y is 30, mapping 0 to 90, so y*2.5) */}
              {[10, 20, 30].map(val => (
                <text key={`ty-${val}`} x="8" y={90 - val * 2.5 + 1} fill="#aaa" fontSize="3" textAnchor="end">{val}</text>
              ))}

              {/* Error lines */}
              {DATA_POINTS.map((p, i) => {
                const predY = w * p.x;
                return (
                  <line 
                    key={`e-${i}`} 
                    x1={10 + p.x * 9} 
                    y1={90 - p.y * 2.5} 
                    x2={10 + p.x * 9} 
                    y2={90 - predY * 2.5} 
                    stroke="#f43f5e" 
                    strokeWidth="0.3" 
                    opacity="0.6"
                  />
                );
              })}

              {/* Data points */}
              {DATA_POINTS.map((p, i) => (
                <circle key={`p-${i}`} cx={10 + p.x * 9} cy={90 - p.y * 2.5} r="1.2" fill="#e2e8f0" opacity="0.9" />
              ))}

              {/* Regression Line */}
              <line 
                x1="10" 
                y1="90" 
                x2="100" 
                y2={90 - (w * 10) * 2.5} 
                stroke="#3b82f6" 
                strokeWidth="1.5" 
                style={{ transition: 'all 0.05s linear' }}
              />
            </svg>
          </div>
          <div className="mt-4 bg-black/40 p-3 rounded text-center">
            <span className="font-mono text-xl">w = {w.toFixed(2)}</span>
          </div>
        </div>

        {/* Cost Function Chart */}
        <div className="flex-1 bg-[#111] rounded-xl border border-white/10 p-6 flex flex-col relative overflow-hidden shadow-2xl">
          <h2 className="text-xl font-semibold mb-4 text-secondary text-center">Cost Function: J(w)</h2>
          <div className="flex-1 relative w-full h-full">
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              {/* Grid */}
              <g stroke="rgba(255,255,255,0.1)" strokeWidth="0.5">
                {[10, 30, 50, 70, 90].map(y => <line key={`hy-${y}`} x1="10" y1={y} x2="100" y2={y} />)}
                {[10, 30, 50, 70, 90].map(x => <line key={`hx-${x}`} x1={x} y1="0" x2={x} y2="90" />)}
              </g>

              {/* Axes */}
              <line x1="10" y1="90" x2="100" y2="90" stroke="white" strokeWidth="1" />
              <line x1="10" y1="90" x2="10" y2="0" stroke="white" strokeWidth="1" />
              
              {/* Axis Labels */}
              <text x="55" y="98" fill="#aaa" fontSize="4" textAnchor="middle">w (weight)</text>
              <text x="3" y="45" fill="#aaa" fontSize="4" textAnchor="middle" transform="rotate(-90 3 45)">J(w)</text>
              
              {/* Ticks X */}
              {[1, 2, 3, 4, 5].map(val => (
                <text key={`tx-${val}`} x={10 + val * 18} y="95" fill="#aaa" fontSize="3" textAnchor="middle">{val}</text>
              ))}

              {/* Parabola continuous line */}
              {history.length > 1 && (
                <polyline 
                  points={history.map(h => `${10 + h.w * 18},${90 - (h.cost / maxCost) * 80}`).join(' ')} 
                  fill="none" 
                  stroke="#8b5cf6" 
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Minimum Point Marker */}
              {(() => {
                let sumXY = 0;
                let sumX2 = 0;
                for (const p of DATA_POINTS) {
                  sumXY += p.x * p.y;
                  sumX2 += p.x * p.x;
                }
                const wMin = sumXY / sumX2;
                const minCostVal = calculateCost(wMin);
                const cy = 90 - (minCostVal / maxCost) * 80;
                const cx = 10 + wMin * 18;

                return (
                  <g>
                    {/* Dashed line to minimum */}
                    <line 
                      x1={cx} y1="90" 
                      x2={cx} y2={cy} 
                      stroke="#f43f5e" 
                      strokeWidth="0.8" 
                      strokeDasharray="2,2" 
                      opacity="0.8"
                    />
                    <line 
                      x1="10" y1={cy} 
                      x2={cx} y2={cy} 
                      stroke="#f43f5e" 
                      strokeWidth="0.8" 
                      strokeDasharray="2,2" 
                      opacity="0.8"
                    />
                    {/* Minimum point glowing dot */}
                    <circle cx={cx} cy={cy} r="2.5" fill="#f43f5e" />
                    <circle cx={cx} cy={cy} r="6" fill="#f43f5e" opacity="0.3" className="animate-pulse" />
                    <text x={cx} y={cy + 7} fill="#f43f5e" fontSize="3.5" textAnchor="middle" fontWeight="bold">Min</text>
                  </g>
                );
              })()}

              {/* Current Point */}
              <circle 
                cx={10 + w * 18} 
                cy={90 - (currentCost / maxCost) * 80} 
                r="3" 
                fill="#3b82f6" 
                style={{ transition: 'all 0.05s linear' }}
              />
              <line 
                x1={10 + w * 18} 
                y1="90" 
                x2={10 + w * 18} 
                y2={90 - (currentCost / maxCost) * 80} 
                stroke="#3b82f6" 
                strokeWidth="1" 
                strokeDasharray="2,2" 
                style={{ transition: 'all 0.05s linear' }}
              />
            </svg>
          </div>
          <div className="mt-4 bg-black/40 p-3 rounded text-center">
            <span className="font-mono text-xl">J(w) = {currentCost.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-8 bg-surface border border-white/10 rounded-xl p-6 w-full max-w-4xl shadow-xl flex flex-col md:flex-row items-center gap-6">
        <div className="flex gap-4">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors shadow-lg shadow-primary/30"
          >
            {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
          </button>
          <button 
            onClick={() => {
              setIsPlaying(false);
              setW(0);
            }}
            className="w-12 h-12 rounded-full bg-surface border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <RotateCcw size={20} />
          </button>
        </div>
        
        <div className="flex-1 w-full">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-400">w = 0</span>
            <span className="text-sm font-bold text-primary">w = {w.toFixed(2)}</span>
            <span className="text-sm text-gray-400">w = 5</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="5" 
            step="0.01" 
            value={w} 
            onChange={(e) => {
              setIsPlaying(false);
              setW(parseFloat(e.target.value));
            }}
            className="w-full accent-primary"
          />
        </div>
      </div>
    </div>
  );
}
