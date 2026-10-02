import React, { useState, useRef, useEffect } from 'react';

const GraphPoints = () => {
  const points = [];
  for(let w = 0; w <= 4; w += 0.1) {
    const cost = 5.5 * Math.pow(w - 2, 2);
    points.push(`${w * 25},${100 - cost * 2}`);
  }
  return points.join(' ');
};

export default function GradientPage() {
  const [w, setW] = useState(0.5);
  const svgRef = useRef<SVGSVGElement>(null);

  const cost = 5.5 * Math.pow(w - 2, 2);
  const gradient = 11 * (w - 2);

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.buttons !== 1) return;
    if (!svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const wVal = (x / rect.width) * 4;
    setW(Math.max(0, Math.min(4, wVal)));
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    e.target.setPointerCapture(e.pointerId);
    handlePointerMove(e);
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    e.target.releasePointerCapture(e.pointerId);
  };

  // Tangent line endpoints
  // Tangent line equation: y - cost = gradient * (x - w)
  // In SVG coordinates (which are inverted for y):
  const tangentLength = 1;
  const x1 = w - tangentLength;
  const y1 = cost - gradient * tangentLength;
  const x2 = w + tangentLength;
  const y2 = cost + gradient * tangentLength;

  return (
    <div className="w-full h-full p-8 flex flex-col items-center pt-24 overflow-y-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">The Gradient</h1>
        <p className="text-gray-400 max-w-2xl text-lg">
          Drag the particle along the curve. The <span className="text-accent">tangent line</span> represents the gradient (slope) at that point. A positive slope means we should move left; a negative slope means we should move right.
        </p>
      </div>

      <div className="w-full max-w-4xl bg-surface rounded-xl border border-white/10 p-8 shadow-2xl relative">
        <div className="absolute top-8 left-8 bg-black/60 p-4 rounded-lg border border-white/10 z-10 backdrop-blur-sm">
          <div className="font-mono space-y-2">
            <div>w = <span className="text-primary">{w.toFixed(2)}</span></div>
            <div>J(w) = <span className="text-secondary">{cost.toFixed(2)}</span></div>
            <div className="mt-2 pt-2 border-t border-white/10">
              dJ/dw = <span className={gradient > 0 ? 'text-accent' : gradient < 0 ? 'text-green-400' : 'text-white'}>
                {gradient.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="w-full aspect-[2/1] relative touch-none cursor-grab active:cursor-grabbing">
          <svg 
            ref={svgRef}
            viewBox="0 0 100 100" 
            className="w-full h-full overflow-visible" 
            preserveAspectRatio="none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
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
            />

            {/* Minimum Point Marker */}
            <circle cx="50" cy="100" r="1" fill="white" opacity="0.5" />

            {/* Tangent Line */}
            <line 
              x1={x1 * 25} 
              y1={100 - y1 * 2} 
              x2={x2 * 25} 
              y2={100 - y2 * 2} 
              stroke="#f43f5e" 
              strokeWidth="1" 
              strokeDasharray="4,4"
              style={{ transition: 'all 0.1s linear' }}
            />

            {/* Particle */}
            <circle 
              cx={w * 25} 
              cy={100 - cost * 2} 
              r="2.5" 
              fill="#3b82f6" 
              style={{ transition: 'all 0.1s linear' }}
            />
            <circle 
              cx={w * 25} 
              cy={100 - cost * 2} 
              r="6" 
              fill="#3b82f6" 
              opacity="0.3"
              style={{ transition: 'all 0.1s linear' }}
            />
            
            {/* Vector arrow indicating direction of descent */}
            {Math.abs(gradient) > 0.1 && (
              <g transform={`translate(${w * 25}, ${100 - cost * 2})`} style={{ transition: 'all 0.1s linear' }}>
                <line 
                  x1="0" y1="0" 
                  x2={gradient > 0 ? -10 : 10} y2="0" 
                  stroke="#10b981" 
                  strokeWidth="1.5" 
                  markerEnd="url(#arrowhead)"
                />
              </g>
            )}

            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
              </marker>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}
